import { NextRequest } from "next/server";
import {
  authService,
  registrationService,
  paymentService,
  checkInService,
  emailService,
} from "@/services";
import { requireAdminRequest, apiSuccess, apiError } from "@/lib";
import type { ParticipantType, PaymentStatus } from "@/types";

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
      paymentMethod = "VIETQR",
      currency = "VND",
    } = body;

    if (!fullName || !email || !affiliation || !country || !participantType) {
      return apiError(
        "Vui lòng điền đầy đủ Họ tên, Email, Đơn vị, Quốc gia và Loại đại biểu.",
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
    return apiError(error, 400, "Đã xảy ra lỗi khi tạo đơn đăng ký hội nghị.");
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const email = searchParams.get("email");

    if (code) {
      const reg = await registrationService.getByCode(code);
      if (!reg) {
        return apiError("Không tìm thấy hồ sơ đăng ký với mã này.", 404);
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

    const { errorResponse } = await requireAdminRequest("Yêu cầu quyền Quản trị viên.");
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
    return apiError(error, 500, "Lỗi hệ thống.");
  }
}
