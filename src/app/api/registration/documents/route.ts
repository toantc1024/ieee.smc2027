import { NextRequest } from "next/server";
import { documentService } from "@/services";
import { apiSuccess, apiError } from "@/lib";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const type = searchParams.get("type") || "RECEIPT_INVOICE";

    if (!code) {
      return apiError("Thiếu mã đăng ký đại biểu.", 400);
    }

    const document =
      type === "VISA_SUPPORT_LETTER"
        ? await documentService.generateVisaSupportLetter(code)
        : await documentService.generatePaymentReceipt(code);

    return apiSuccess({ document });
  } catch (error: unknown) {
    return apiError(error, 400, "Không thể tạo tài liệu.");
  }
}
