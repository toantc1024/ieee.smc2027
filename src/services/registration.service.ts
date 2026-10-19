/**
 * Conference Registration Service (Fullstack Prisma + JSON FormData)
 * Handles delegate registration, dynamic fee calculation, JSON formData/profileData sync,
 * and admin workflow approvals.
 */

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  REGISTRATION_FEES,
  generateRegistrationCode,
} from "@/lib/conference-registration";
import { normalizeEmail, normalizeRegistrationCode } from "@/lib/utils";
import emailService from "./email.service";
import type {
  CreateRegistrationInput,
  ParticipantType,
  PaymentStatus,
  UnstructuredRegistrationFormData,
} from "@/types";

export const EXTRA_PAGE_SURCHARGE = {
  USD: 150,
  VND: 3750000,
};

export const EXTRA_BANQUET_TICKET_PRICE = {
  USD: 90,
  VND: 2250000,
};

export class RegistrationService {
  public async generateUniqueCode(): Promise<string> {
    let code = generateRegistrationCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const exists = await prisma.registration.findUnique({
        where: { registrationCode: code },
      });
      if (!exists) return code;
      code = generateRegistrationCode();
    }
    return code;
  }

  public calculateFee(
    participantType: ParticipantType,
    currency: "VND" | "USD" = "VND",
    formData?: UnstructuredRegistrationFormData
  ): number {
    const tier = REGISTRATION_FEES[participantType];
    if (!tier) {
      throw new Error("Invalid delegate registration category.");
    }
    const baseFee = currency === "USD" ? tier.usd : tier.vnd;
    const extraPages = Math.max(0, Number(formData?.extraPagesCount || 0));
    const extraBanquet = Math.max(0, Number(formData?.extraBanquetTickets || 0));

    const pageFee =
      extraPages * (currency === "USD" ? EXTRA_PAGE_SURCHARGE.USD : EXTRA_PAGE_SURCHARGE.VND);
    const banquetFee =
      extraBanquet *
      (currency === "USD" ? EXTRA_BANQUET_TICKET_PRICE.USD : EXTRA_BANQUET_TICKET_PRICE.VND);

    return baseFee + pageFee + banquetFee;
  }

  public async createRegistration(input: CreateRegistrationInput) {
    const rawForm: UnstructuredRegistrationFormData = input.formData || {};
    const finalPaperId = (input.paperId || rawForm.paperId || "").trim() || null;
    const finalPaperTitle = (input.paperTitle || rawForm.paperTitle || "").trim() || null;

    if (input.participantType === "AUTHOR" && !finalPaperId) {
      throw new Error("Author delegates must provide an accepted PaperCept Paper ID.");
    }

    const cleanEmail = normalizeEmail(input.email);
    const needsVisa = Boolean(
      input.needsVisaSupport !== undefined ? input.needsVisaSupport : rawForm.needsVisaSupport
    );
    const finalPassport = (input.passportNumber || rawForm.passportNumber || "").trim() || null;
    const finalDietary =
      (input.dietaryRequirement || rawForm.dietaryRequirement || "None").trim();
    const finalTravelNotes = (input.travelNotes || rawForm.travelNotes || "").trim() || null;

    const structuredJson: UnstructuredRegistrationFormData = {
      ...rawForm,
      paperId: finalPaperId || undefined,
      paperTitle: finalPaperTitle || undefined,
      extraPagesCount: Number(rawForm.extraPagesCount || 0),
      extraBanquetTickets: Number(rawForm.extraBanquetTickets || 0),
      passportNumber: finalPassport || undefined,
      needsVisaSupport: needsVisa,
      visaApprovalStatus: needsVisa
        ? rawForm.visaApprovalStatus || "PENDING_APPROVAL"
        : "NOT_REQUESTED",
      dietaryRequirement: finalDietary,
      travelNotes: finalTravelNotes || undefined,
      proofVerified: Boolean(rawForm.proofVerified),
    };

    const currency = input.currency || "VND";
    const feeAmount = this.calculateFee(input.participantType, currency, structuredJson);
    const registrationCode = await this.generateUniqueCode();

    // Link with existing User account if not explicitly passed
    let resolvedUserId = input.userId || null;
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (!resolvedUserId && existingUser) {
      resolvedUserId = existingUser.id;
    }

    const created = await prisma.registration.create({
      data: {
        registrationCode,
        userId: resolvedUserId,
        fullName: input.fullName.trim(),
        email: cleanEmail,
        phone: input.phone ? input.phone.trim() : null,
        affiliation: input.affiliation.trim(),
        country: input.country.trim(),
        participantType: input.participantType,
        paperId: finalPaperId,
        paperTitle: finalPaperTitle,
        passportNumber: finalPassport,
        needsVisaSupport: needsVisa,
        dietaryRequirement: finalDietary,
        travelNotes: finalTravelNotes,
        avatarUrl: input.avatarUrl || null,
        formData: structuredJson as Prisma.InputJsonValue,
        feeAmount,
        currency,
        paymentStatus: "PENDING",
        paymentMethod: input.paymentMethod || "PAYOO_VIETQR",
      },
    });

    // Sync unstructured profileData and avatar back to the User account if present
    if (resolvedUserId) {
      const currentProfile =
        existingUser?.profileData && typeof existingUser.profileData === "object"
          ? (existingUser.profileData as Record<string, unknown>)
          : {};

      const nextProfileData = {
        ...currentProfile,
        phone: input.phone || currentProfile.phone || "",
        affiliation: input.affiliation || currentProfile.affiliation || "",
        country: input.country || currentProfile.country || "",
        dietaryRequirement: finalDietary,
        passportNumber: finalPassport || currentProfile.passportNumber || "",
        passportIssueDate: structuredJson.passportIssueDate || currentProfile.passportIssueDate || "",
        passportExpiryDate:
          structuredJson.passportExpiryDate || currentProfile.passportExpiryDate || "",
        nationality: structuredJson.nationality || input.country || "",
        passportScanUrl: structuredJson.passportScanUrl || currentProfile.passportScanUrl || "",
        proofDocumentUrl: structuredJson.proofDocumentUrl || currentProfile.proofDocumentUrl || "",
        ieeeMemberNumber: structuredJson.ieeeMemberNumber || currentProfile.ieeeMemberNumber || "",
        invoiceCompanyName:
          structuredJson.invoiceCompanyName || currentProfile.invoiceCompanyName || "",
        invoiceTaxCode: structuredJson.invoiceTaxCode || currentProfile.invoiceTaxCode || "",
        invoiceAddress: structuredJson.invoiceAddress || currentProfile.invoiceAddress || "",
        customFields: structuredJson.customFields || currentProfile.customFields || {},
      } as Prisma.InputJsonValue;

      await prisma.user
        .update({
          where: { id: resolvedUserId },
          data: {
            name: input.fullName.trim(),
            ...(input.avatarUrl ? { avatar: input.avatarUrl } : {}),
            profileData: nextProfileData,
          },
        })
        .catch(() => null);
    }

    return created;
  }

  public async getByCode(code: string) {
    return prisma.registration.findUnique({
      where: { registrationCode: normalizeRegistrationCode(code) },
    });
  }

  public async getByEmail(email: string) {
    return prisma.registration.findMany({
      where: { email: normalizeEmail(email) },
      orderBy: { createdAt: "desc" },
    });
  }

  public async getByUser(userId: string, email: string) {
    return prisma.registration.findMany({
      where: {
        OR: [{ userId }, { email: normalizeEmail(email) }],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  public async listRegistrations(filters?: {
    search?: string;
    paymentStatus?: PaymentStatus | "ALL";
    participantType?: ParticipantType | "ALL";
  }) {
    const where: Record<string, unknown> = {};

    if (filters?.paymentStatus && filters.paymentStatus !== "ALL") {
      where.paymentStatus = filters.paymentStatus;
    }
    if (filters?.participantType && filters.participantType !== "ALL") {
      where.participantType = filters.participantType;
    }
    if (filters?.search) {
      const q = filters.search.trim();
      where.OR = [
        { registrationCode: { contains: q, mode: "insensitive" } },
        { fullName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { affiliation: { contains: q, mode: "insensitive" } },
        { paperId: { contains: q, mode: "insensitive" } },
      ];
    }

    return prisma.registration.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  public async updateRegistration(
    id: string,
    data: {
      fullName?: string;
      phone?: string;
      affiliation?: string;
      country?: string;
      avatarUrl?: string | null;
      paymentStatus?: PaymentStatus;
      paymentMethod?: string;
      transactionRef?: string;
      checkInStatus?: boolean;
      travelNotes?: string;
      dietaryRequirement?: string;
      needsVisaSupport?: boolean;
      passportNumber?: string;
      paperId?: string;
      paperTitle?: string;
      formData?: UnstructuredRegistrationFormData;
    }
  ) {
    const existing = await prisma.registration.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Registration not found.");
    }

    const existingForm: UnstructuredRegistrationFormData =
      existing.formData && typeof existing.formData === "object"
        ? (existing.formData as UnstructuredRegistrationFormData)
        : {};

    const mergedFormData: UnstructuredRegistrationFormData = {
      ...existingForm,
      ...(data.formData || {}),
    };

    if (data.dietaryRequirement !== undefined) {
      mergedFormData.dietaryRequirement = data.dietaryRequirement;
    }
    if (data.travelNotes !== undefined) {
      mergedFormData.travelNotes = data.travelNotes;
    }
    if (data.needsVisaSupport !== undefined) {
      mergedFormData.needsVisaSupport = Boolean(data.needsVisaSupport);
    }
    if (data.passportNumber !== undefined) {
      mergedFormData.passportNumber = data.passportNumber;
    }
    if (data.paperId !== undefined) {
      mergedFormData.paperId = data.paperId;
    }
    if (data.paperTitle !== undefined) {
      mergedFormData.paperTitle = data.paperTitle;
    }

    const updatePayload: Prisma.RegistrationUpdateInput = {
      formData: mergedFormData as Prisma.InputJsonValue,
    };

    if (data.fullName?.trim()) updatePayload.fullName = data.fullName.trim();
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.affiliation?.trim()) updatePayload.affiliation = data.affiliation.trim();
    if (data.country?.trim()) updatePayload.country = data.country.trim();
    if (data.avatarUrl !== undefined) updatePayload.avatarUrl = data.avatarUrl;
    if (data.paymentMethod !== undefined) updatePayload.paymentMethod = data.paymentMethod;

    const becomingPaid =
      data.paymentStatus === "PAID" && existing.paymentStatus !== "PAID";

    if (data.paymentStatus) {
      updatePayload.paymentStatus = data.paymentStatus;
      if (data.paymentStatus === "PAID") {
        updatePayload.paidAt = existing.paidAt || new Date();
      }
    }
    if (data.transactionRef !== undefined) {
      updatePayload.transactionRef = data.transactionRef;
    }
    if (data.checkInStatus !== undefined) {
      updatePayload.checkInStatus = Boolean(data.checkInStatus);
      updatePayload.checkedInAt = data.checkInStatus ? new Date() : null;
    }
    if (data.travelNotes !== undefined) updatePayload.travelNotes = data.travelNotes;
    if (data.dietaryRequirement !== undefined) {
      updatePayload.dietaryRequirement = data.dietaryRequirement;
    }
    if (data.needsVisaSupport !== undefined) {
      updatePayload.needsVisaSupport = Boolean(data.needsVisaSupport);
    }
    if (data.passportNumber !== undefined) {
      updatePayload.passportNumber = data.passportNumber;
    }
    if (data.paperId !== undefined) updatePayload.paperId = data.paperId;
    if (data.paperTitle !== undefined) updatePayload.paperTitle = data.paperTitle;

    const updated = await prisma.registration.update({
      where: { id },
      data: updatePayload,
    });

    // Trigger Milestone 3 Email if paymentStatus became PAID
    if (becomingPaid) {
      emailService
        .sendPaymentConfirmation({
          email: updated.email,
          fullName: updated.fullName,
          registrationCode: updated.registrationCode,
          feeAmount: updated.feeAmount,
          currency: updated.currency,
          transactionRef: updated.transactionRef || `MANUAL-${Date.now()}`,
        })
        .catch((err: unknown) => console.warn("Milestone payment email warning:", err));
    }

    // Trigger Milestone 4 Email if visaApprovalStatus became APPROVED
    if (
      mergedFormData.visaApprovalStatus === "APPROVED" &&
      existingForm.visaApprovalStatus !== "APPROVED"
    ) {
      emailService
        .sendVisaSupportApprovedEmail({
          email: updated.email,
          fullName: updated.fullName,
          registrationCode: updated.registrationCode,
        })
        .catch((err: unknown) => console.warn("Milestone visa email warning:", err));
    }

    return updated;
  }

  public async deleteRegistration(id: string) {
    return prisma.registration.delete({ where: { id } });
  }
}

export const registrationService = new RegistrationService();
export default registrationService;
