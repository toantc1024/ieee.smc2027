/**
 * Payment & Automated Bank Reconciliation Service Template
 * Supports VietQR NAPAS 24/7 dynamic QR codes, bank webhook auto-reconciliation,
 * and international card payment gateway integration.
 */

import prisma from "@/lib/prisma";
import env from "@/config/env";
import {
  CONFERENCE_BANK_INFO,
  getTransferSyntax,
  getVietQrUrl,
} from "@/lib/conference-registration";
import type { BankReconciliationPayload } from "@/types";

export class PaymentService {
  public getBankDetails() {
    return {
      bankId: env.payment.bankId || CONFERENCE_BANK_INFO.bankId,
      bankName: env.payment.bankName || CONFERENCE_BANK_INFO.bankName,
      accountNo: env.payment.accountNo || CONFERENCE_BANK_INFO.accountNo,
      accountName: env.payment.accountName || CONFERENCE_BANK_INFO.accountName,
      swiftBic: env.payment.swiftBic || CONFERENCE_BANK_INFO.swiftBic,
      address: CONFERENCE_BANK_INFO.address,
    };
  }

  public buildVietQrPaymentInfo(registrationCode: string, feeAmount: number, currency = "VND") {
    return {
      vietQrUrl: getVietQrUrl(registrationCode, feeAmount),
      bankInfo: this.getBankDetails(),
      transferSyntax: getTransferSyntax(registrationCode),
      feeAmount,
      currency,
    };
  }

  /**
   * Extracts registration code (e.g. SMC27-K8F291 or SMC27K8F291) from bank transfer description
   */
  public extractRegistrationCode(transferContent: string): string | null {
    const normalized = transferContent.toUpperCase();
    const matchWithHyphen = normalized.match(/SMC27-[A-Z0-9]{6}/);
    if (matchWithHyphen) return matchWithHyphen[0];

    const matchCompact = normalized.match(/SMC27([A-Z0-9]{6})/);
    if (matchCompact) return `SMC27-${matchCompact[1]}`;

    return null;
  }

  /**
   * Automated Bank Reconciliation Webhook Handler (Casso / SePay / PayOS / Bank API)
   */
  public async reconcileBankTransaction(payload: BankReconciliationPayload) {
    const extractedCode = this.extractRegistrationCode(payload.transferContent);
    if (!extractedCode) {
      return {
        matched: false,
        reason: "Không tìm thấy mã đăng ký hợp lệ trong nội dung chuyển khoản.",
      };
    }

    const registration = await prisma.registration.findUnique({
      where: { registrationCode: extractedCode },
    });

    if (!registration) {
      return {
        matched: false,
        registrationCode: extractedCode,
        reason: "Không tìm thấy hồ sơ đại biểu khớp với mã chuyển khoản.",
      };
    }

    if (registration.paymentStatus === "PAID") {
      return {
        matched: true,
        alreadyPaid: true,
        registration,
      };
    }

    if (payload.amount < registration.feeAmount) {
      return {
        matched: false,
        registrationCode: extractedCode,
        reason: `Số tiền chuyển khoản (${payload.amount}) thấp hơn lệ phí yêu cầu (${registration.feeAmount}).`,
      };
    }

    const updated = await prisma.registration.update({
      where: { id: registration.id },
      data: {
        paymentStatus: "PAID",
        transactionRef: payload.transactionId,
        paidAt: payload.paidAt ? new Date(payload.paidAt) : new Date(),
      },
    });

    return {
      matched: true,
      alreadyPaid: false,
      registration: updated,
    };
  }

  /**
   * Template for International Card Checkout Session (Stripe / OnePay)
   */
  public async createCardCheckoutSession(params: {
    registrationCode: string;
    amount: number;
    currency: "USD" | "VND";
    customerEmail: string;
  }) {
    const returnUrl = `${env.app.url}/portal?code=${encodeURIComponent(params.registrationCode)}`;
    return {
      provider: env.payment.cardGatewayProvider,
      registrationCode: params.registrationCode,
      checkoutUrl: `${returnUrl}&payment=card_pending`,
      configured: Boolean(env.payment.cardGatewaySecretKey),
    };
  }
}

export const paymentService = new PaymentService();
export default paymentService;
