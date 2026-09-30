import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  REGISTRATION_FEES,
  CONFERENCE_BANK_INFO,
  generateRegistrationCode,
  getVietQrUrl,
  getTransferSyntax,
  generateQrDataUrl,
} from "@/lib/conference-registration";
import { getSession } from "@/lib/auth";

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

    // Validate required fields
    if (!fullName || !email || !affiliation || !country || !participantType) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ các thông tin bắt buộc (Họ tên, Email, Đơn vị, Quốc gia, Loại đại biểu)." },
        { status: 400 }
      );
    }

    // Author check
    if (participantType === "AUTHOR" && !paperId) {
      return NextResponse.json(
        { error: "Đại biểu Tác giả bắt buộc phải nhập Mã bài báo (Paper ID)." },
        { status: 400 }
      );
    }

    const tier = REGISTRATION_FEES[participantType as keyof typeof REGISTRATION_FEES];
    if (!tier) {
      return NextResponse.json(
        { error: "Loại hình đại biểu không hợp lệ." },
        { status: 400 }
      );
    }

    const feeAmount = currency === "USD" ? tier.usd : tier.vnd;

    // Generate unique registration code
    let registrationCode = generateRegistrationCode();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.registration.findUnique({
        where: { registrationCode },
      });
      if (!existing) break;
      registrationCode = generateRegistrationCode();
      attempts++;
    }

    // Optional user session link
    const session = await getSession();
    const userId = session?.user?.id || null;

    const registration = await prisma.registration.create({
      data: {
        registrationCode,
        userId,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        affiliation: affiliation.trim(),
        country: country.trim(),
        participantType: participantType as any,
        paperId: paperId ? String(paperId).trim() : null,
        paperTitle: paperTitle ? paperTitle.trim() : null,
        passportNumber: passportNumber ? passportNumber.trim() : null,
        needsVisaSupport: Boolean(needsVisaSupport),
        dietaryRequirement: dietaryRequirement || "None",
        travelNotes: travelNotes ? travelNotes.trim() : null,
        avatarUrl: avatarUrl || null,
        feeAmount,
        currency,
        paymentStatus: "PENDING",
        paymentMethod,
      },
    });

    const vietQrUrl = getVietQrUrl(registration.registrationCode, registration.feeAmount);
    const badgeQrUrl = await generateQrDataUrl(
      JSON.stringify({
        code: registration.registrationCode,
        name: registration.fullName,
        type: registration.participantType,
        org: registration.affiliation,
      })
    );

    return NextResponse.json({
      success: true,
      registration,
      payment: {
        vietQrUrl,
        bankInfo: CONFERENCE_BANK_INFO,
        transferSyntax: getTransferSyntax(registration.registrationCode),
        feeAmount,
        currency,
      },
      badgeQrUrl,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error?.message || "Đã xảy ra lỗi khi tạo đơn đăng ký hội nghị." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const email = searchParams.get("email");

    // Lookup single registration by code or email for delegate portal
    if (code) {
      const reg = await prisma.registration.findUnique({
        where: { registrationCode: code.toUpperCase().trim() },
      });
      if (!reg) {
        return NextResponse.json({ error: "Không tìm thấy hồ sơ đăng ký với mã này." }, { status: 404 });
      }

      const vietQrUrl = getVietQrUrl(reg.registrationCode, reg.feeAmount);
      const badgeQrUrl = await generateQrDataUrl(
        JSON.stringify({
          code: reg.registrationCode,
          name: reg.fullName,
          type: reg.participantType,
          org: reg.affiliation,
        })
      );

      return NextResponse.json({
        success: true,
        registration: reg,
        payment: {
          vietQrUrl,
          bankInfo: CONFERENCE_BANK_INFO,
          transferSyntax: getTransferSyntax(reg.registrationCode),
        },
        badgeQrUrl,
      });
    }

    if (email) {
      const regs = await prisma.registration.findMany({
        where: { email: email.toLowerCase().trim() },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, registrations: regs });
    }

    // Admin query for list
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên." }, { status: 403 });
    }

    const search = searchParams.get("q") || "";
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {};
    if (status && status !== "ALL") {
      where.paymentStatus = status;
    }
    if (type && type !== "ALL") {
      where.participantType = type;
    }
    if (search) {
      where.OR = [
        { registrationCode: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { affiliation: { contains: search, mode: "insensitive" } },
        { paperId: { contains: search, mode: "insensitive" } },
      ];
    }

    const registrations = await prisma.registration.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, registrations });
  } catch (error: any) {
    console.error("Error retrieving registrations:", error);
    return NextResponse.json({ error: error?.message || "Lỗi hệ thống." }, { status: 500 });
  }
}
