import { NextRequest } from "next/server";
import {
  authService,
  registrationService,
  paymentService,
  checkInService,
  emailService,
} from "@/services";
import { requireAdminRequest, apiSuccess, apiError } from "@/lib";
import type { ParticipantType, PaymentStatus, UnstructuredRegistrationFormData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      affiliation,
      country,
      participantType,
      paperId,
      paperTitle,
      passportNumber,
      needsVisaSupport,
      dietaryRequirement,
      travelNotes,
      avatarUrl,
      paymentMethod = "PAYOO_VIETQR",
      currency = "VND",
      formData,
    } = body;

    if (!fullName || !email || !affiliation || !country || !participantType) {
      return apiError(
        "Please provide Full Name, Email, Affiliation, Country, and Delegate Category.",
        400
      );
    }

    const session = await authService.getSession();
    const registration = await registrationService.createRegistration({
      userId: session?.user?.id || null,
      fullName,
      email,
      phone,
      affiliation,
      country,
      participantType: participantType as ParticipantType,
      paperId,
      paperTitle,
      passportNumber,
      needsVisaSupport,
      dietaryRequirement,
      travelNotes,
      avatarUrl,
      paymentMethod,
      currency,
      formData: (formData || {}) as UnstructuredRegistrationFormData,
    });

    const payment = paymentService.buildVietQrPaymentInfo(
      registration.registrationCode,
      registration.feeAmount,
      registration.currency
    );

    const badgeQrUrl = await checkInService.generateBadgeQr(registration);

    await emailService.sendRegistrationConfirmation({
      email: registration.email,
      fullName: registration.fullName,
      registrationCode: registration.registrationCode,
      participantType: registration.participantType,
      feeAmount: registration.feeAmount,
      currency: registration.currency,
    });

    return apiSuccess({
      registration,
      payment,
      badgeQrUrl,
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return apiError(error, 400, "Failed to create conference registration.");
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const email = searchParams.get("email");
    const mine = searchParams.get("mine");

    if (mine === "1" || mine === "true") {
      const session = await authService.getSession();
      if (!session?.user) {
        return apiError("Not authenticated.", 401);
      }

      const registrations = await registrationService.getByUser(
        session.user.id,
        session.user.email
      );

      if (registrations.length === 0) {
        return apiSuccess({
          user: session.user,
          registration: null,
          registrations: [],
        });
      }

      const latest = registrations[0];
      const payment = paymentService.buildVietQrPaymentInfo(
        latest.registrationCode,
        latest.feeAmount,
        latest.currency
      );
      const badgeQrUrl = await checkInService.generateBadgeQr(latest);

      return apiSuccess({
        user: session.user,
        registration: latest,
        registrations,
        payment,
        badgeQrUrl,
      });
    }

    if (code) {
      const reg = await registrationService.getByCode(code);
      if (!reg) {
        return apiError("No registration record found with this code.", 404);
      }

      const payment = paymentService.buildVietQrPaymentInfo(
        reg.registrationCode,
        reg.feeAmount,
        reg.currency
      );
      const badgeQrUrl = await checkInService.generateBadgeQr(reg);

      return apiSuccess({
        registration: reg,
        payment,
        badgeQrUrl,
      });
    }

    if (email) {
      const registrations = await registrationService.getByEmail(email);
      return apiSuccess({ registrations });
    }

    const { errorResponse } = await requireAdminRequest("Administrator privileges required.");
    if (errorResponse) return errorResponse;

    const search = searchParams.get("q") || "";
    const status = (searchParams.get("status") || "ALL") as PaymentStatus | "ALL";
    const type = (searchParams.get("type") || "ALL") as ParticipantType | "ALL";

    const registrations = await registrationService.listRegistrations({
      search,
      paymentStatus: status,
      participantType: type,
    });

    return apiSuccess({ registrations });
  } catch (error: unknown) {
    console.error("Error retrieving registrations:", error);
    return apiError(error, 500, "Internal server error.");
  }
}
