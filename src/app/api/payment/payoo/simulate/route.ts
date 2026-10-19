import { paymentService, registrationService } from "@/services";
import { apiSuccess, apiError } from "@/lib";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { registrationCode, method = "PAYOO_VIETQR" } = body;

    if (!registrationCode) {
      return apiError("Registration code is required", 400);
    }

    const reg = await registrationService.getByCode(registrationCode);
    if (!reg) {
      return apiError("Registration not found", 404);
    }

    const txRef = `PAYOO-${method === "PAYOO_CARD" ? "CARD" : "QR"}-${Date.now().toString().slice(-6)}`;

    await registrationService.updateRegistration(reg.id, {
      paymentMethod: method,
    });

    const reconciled = await paymentService.reconcileBankTransaction({
      transactionId: txRef,
      amount: reg.feeAmount,
      currency: reg.currency,
      transferContent: `${reg.registrationCode} PAYOO CONFIRMED`,
      paidAt: new Date(),
    });

    if (!reconciled.matched) {
      return apiError(reconciled.reason || "Payoo reconciliation failed", 400);
    }

    return apiSuccess({
      reconciled: true,
      transactionRef: txRef,
      registration: reconciled.registration,
    });
  } catch (error: unknown) {
    return apiError(error, 500, "Failed to complete temporary Payoo payment");
  }
}
