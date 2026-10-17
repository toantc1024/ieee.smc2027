/**
 * Conference Registration Service (Fullstack Prisma)
 * Handles delegate registration, fee calculation, profile lookup, and admin management.
 */

import prisma from "@/lib/prisma";
import {
  REGISTRATION_FEES,
  generateRegistrationCode,
} from "@/lib/conference-registration";
import type { CreateRegistrationInput, ParticipantType, PaymentStatus } from "@/types";

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

  public calculateFee(participantType: ParticipantType, currency: "VND" | "USD" = "VND"): number {
    const tier = REGISTRATION_FEES[participantType];
    if (!tier) {
      throw new Error("Loại hình đại biểu không hợp lệ.");
    }
    return currency === "USD" ? tier.usd : tier.vnd;
  }

  public async createRegistration(input: CreateRegistrationInput) {
    if (input.participantType === "AUTHOR" && !input.paperId) {
      throw new Error("Đại biểu Tác giả bắt buộc phải nhập Mã bài báo.");
    }

    const currency = input.currency || "VND";
    const feeAmount = this.calculateFee(input.participantType, currency);
    const registrationCode = await this.generateUniqueCode();

    return prisma.registration.create({
      data: {
        registrationCode,
        userId: input.userId || null,
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone ? input.phone.trim() : null,
        affiliation: input.affiliation.trim(),
        country: input.country.trim(),
        participantType: input.participantType,
        paperId: input.paperId ? String(input.paperId).trim() : null,
        paperTitle: input.paperTitle ? input.paperTitle.trim() : null,
        passportNumber: input.passportNumber ? input.passportNumber.trim() : null,
        needsVisaSupport: Boolean(input.needsVisaSupport),
        dietaryRequirement: input.dietaryRequirement || "None",
        travelNotes: input.travelNotes ? input.travelNotes.trim() : null,
        avatarUrl: input.avatarUrl || null,
        feeAmount,
        currency,
        paymentStatus: "PENDING",
        paymentMethod: input.paymentMethod || "VIETQR",
      },
    });
  }

  public async getByCode(code: string) {
    return prisma.registration.findUnique({
      where: { registrationCode: code.trim().toUpperCase() },
    });
  }

  public async getByEmail(email: string) {
    return prisma.registration.findMany({
      where: { email: email.trim().toLowerCase() },
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
      paymentStatus?: PaymentStatus;
      transactionRef?: string;
      checkInStatus?: boolean;
      travelNotes?: string;
      dietaryRequirement?: string;
      needsVisaSupport?: boolean;
    }
  ) {
    const updatePayload: Record<string, unknown> = {};

    if (data.paymentStatus) {
      updatePayload.paymentStatus = data.paymentStatus;
      if (data.paymentStatus === "PAID") {
        updatePayload.paidAt = new Date();
      }
    }
    if (data.transactionRef !== undefined) updatePayload.transactionRef = data.transactionRef;
    if (data.checkInStatus !== undefined) {
      updatePayload.checkInStatus = Boolean(data.checkInStatus);
      updatePayload.checkedInAt = data.checkInStatus ? new Date() : null;
    }
    if (data.travelNotes !== undefined) updatePayload.travelNotes = data.travelNotes;
    if (data.dietaryRequirement !== undefined) updatePayload.dietaryRequirement = data.dietaryRequirement;
    if (data.needsVisaSupport !== undefined) updatePayload.needsVisaSupport = Boolean(data.needsVisaSupport);

    return prisma.registration.update({
      where: { id },
      data: updatePayload,
    });
  }

  public async deleteRegistration(id: string) {
    return prisma.registration.delete({ where: { id } });
  }
}

export const registrationService = new RegistrationService();
export default registrationService;
