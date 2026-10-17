import { NextRequest, NextResponse } from "next/server";
import env from "@/config/env";
import { paymentService, emailService } from "@/services";

export async function POST(req: NextRequest) {
  try {
    const signature =
      req.headers.get("x-webhook-secret") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (env.isProd && signature !== env.payment.webhookSecret) {
      return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
    }

    const body = await req.json();
    const transactionId = String(body.transactionId || body.id || `TXN-${Date.now()}`);
    const amount = Number(body.amount || body.transferAmount || 0);
    const transferContent = String(body.transferContent || body.content || body.description || "");

    if (!transferContent || amount <= 0) {
      return NextResponse.json(
        { error: "Thiếu nội dung chuyển khoản hoặc số tiền không hợp lệ." },
        { status: 400 }
      );
    }

    const result = await paymentService.reconcileBankTransaction({
      transactionId,
      amount,
      transferContent,
      paidAt: body.paidAt,
      rawPayload: body,
    });

    if (result.matched && !result.alreadyPaid && result.registration) {
      await emailService.sendRegistrationConfirmation({
        email: result.registration.email,
        fullName: result.registration.fullName,
        registrationCode: result.registration.registrationCode,
        feeAmount: result.registration.feeAmount,
        currency: result.registration.currency,
      });
    }

    return NextResponse.json({
      success: result.matched,
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    console.error("Payment webhook error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
