/**
 * Payment & Automated Payoo / Bank Reconciliation Service
 * Supports Payoo VietQR NAPAS 24/7 dynamic QR codes, Payoo International Card (Visa/Mastercard),
 * and temporary Payoo checkout & webhook reconciliation with milestone email dispatch.
 */

import prisma from "@/lib/prisma";
import env from "@/config/env";
import {
  CONFERENCE_BANK_INFO,
  getTransferSyntax,
  getVietQrUrl,
} from "@/lib/conference-registration";
import emailService from "./email.service";
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
      provider: env.payment.provider || "PAYOO",
      merchantId: env.payment.payooMerchantId || "HCMUTE-SMC2027-TEMP",
    };
  }

  public buildVietQrPaymentInfo(registrationCode: string, feeAmount: number, currency = "VND") {
    return {
      provider: "PAYOO",
      merchantId: env.payment.payooMerchantId || "HCMUTE-SMC2027-TEMP",
      vietQrUrl: getVietQrUrl(registrationCode, feeAmount),
      bankInfo: this.getBankDetails(),
      transferSyntax: getTransferSyntax(registrationCode),
      feeAmount,
      currency,
    };
  }

  /**
   * Extracts registration code (e.g. SMC27-K8F291 or SMC27K8F291) from transfer description
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
   * Automated Payoo / Bank Reconciliation Webhook Handler
   */
  public async reconcileBankTransaction(payload: BankReconciliationPayload) {
    const extractedCode = this.extractRegistrationCode(payload.transferContent);
    if (!extractedCode) {
      return {
        matched: false,
        reason: "No valid registration code found in the transfer description.",
      };
    }

    const registration = await prisma.registration.findUnique({
      where: { registrationCode: extractedCode },
    });

    if (!registration) {
      return {
        matched: false,
        registrationCode: extractedCode,
        reason: "No delegate registration record found matching the transfer code.",
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
        reason: `Transfer amount (${payload.amount}) is less than required fee (${registration.feeAmount}).`,
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

    // Trigger Milestone 3: Payment Confirmed & Receipt Email
    emailService
      .sendPaymentConfirmation({
        email: updated.email,
        fullName: updated.fullName,
        registrationCode: updated.registrationCode,
        feeAmount: updated.feeAmount,
        currency: updated.currency,
        transactionRef: updated.transactionRef || payload.transactionId,
      })
      .catch((err: unknown) => console.warn("Milestone payment email warning:", err));

    return {
      matched: true,
      alreadyPaid: false,
      registration: updated,
    };
  }

  /**
   * Payoo Checkout Session (Temporary sandbox + live ready for VietQR & International Card)
   */
  public async createCardCheckoutSession(params: {
    registrationCode: string;
    amount: number;
    currency: "USD" | "VND";
    customerEmail: string;
    method?: "PAYOO_VIETQR" | "PAYOO_CARD";
  }) {
    const orderNo = `PAYOO-${Date.now().toString().slice(-6)}-${params.registrationCode.replace("SMC27-", "")}`;
    const returnUrl = `${env.app.url}/portal?code=${encodeURIComponent(params.registrationCode)}`;
    return {
      provider: env.payment.provider || "PAYOO",
      merchantId: env.payment.payooMerchantId || "HCMUTE-SMC2027-TEMP",
      orderNo,
      registrationCode: params.registrationCode,
      method: params.method || "PAYOO_CARD",
      amount: params.amount,
      currency: params.currency,
      checkoutUrl: `${returnUrl}&payooOrder=${encodeURIComponent(orderNo)}`,
      vietQrUrl: getVietQrUrl(params.registrationCode, params.amount),
      transferSyntax: getTransferSyntax(params.registrationCode),
      bankInfo: this.getBankDetails(),
      configured: Boolean(env.payment.payooSecretKey),
    };
  }
}

export const paymentService = new PaymentService();
export default paymentService;
