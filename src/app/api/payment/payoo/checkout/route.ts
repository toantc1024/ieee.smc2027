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

    await registrationService.updateRegistration(reg.id, {
      paymentMethod: method,
    });

    const session = await paymentService.createCardCheckoutSession({
      registrationCode: reg.registrationCode,
      amount: reg.feeAmount,
      currency: (reg.currency === "USD" ? "USD" : "VND") as "USD" | "VND",
      customerEmail: reg.email,
      method: method === "PAYOO_CARD" ? "PAYOO_CARD" : "PAYOO_VIETQR",
    });

    return apiSuccess({
      checkout: session,
      registration: reg,
    });
  } catch (error: unknown) {
    return apiError(error, 500, "Failed to initialize Payoo checkout session");
  }
}
