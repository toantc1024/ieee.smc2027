import { NextRequest, NextResponse } from "next/server";
import { documentService } from "@/services";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const type = searchParams.get("type") || "RECEIPT_INVOICE";

    if (!code) {
      return NextResponse.json(
        { error: "Thiếu mã đăng ký đại biểu." },
        { status: 400 }
      );
    }

    const doc =
      type === "VISA_SUPPORT_LETTER"
        ? await documentService.generateVisaSupportLetter(code)
        : await documentService.generatePaymentReceipt(code);

    return NextResponse.json({
      success: true,
      document: doc,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Không thể tạo tài liệu.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
