/**
 * Document Service Template (Payment Receipt / Invoice & Visa Support Letter)
 * Generates official conference documents and archives them in MinIO storage.
 */

import prisma from "@/lib/prisma";
import storageService from "./storage.service";
import type { DocumentSummary } from "@/types";

export class DocumentService {
  /**
   * Generates Payment Receipt / Electronic Invoice for a paid delegate
   */
  public async generatePaymentReceipt(registrationCode: string): Promise<DocumentSummary> {
    const reg = await prisma.registration.findUnique({
      where: { registrationCode: registrationCode.trim().toUpperCase() },
    });

    if (!reg) {
      throw new Error("Không tìm thấy hồ sơ đại biểu.");
    }

    if (reg.paymentStatus !== "PAID") {
      throw new Error("Phiếu thu chỉ được cấp sau khi hoàn tất thanh toán lệ phí.");
    }

    const issuedAt = new Date().toISOString();
    const receiptHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Receipt - ${reg.registrationCode}</title></head>
<body style="font-family: sans-serif; padding: 40px; color: #0f172a;">
  <h1>IEEE SMC 2027 - OFFICIAL PAYMENT RECEIPT</h1>
  <p><strong>Receipt No:</strong> INV-${reg.registrationCode}</p>
  <p><strong>Date Issued:</strong> ${issuedAt}</p>
  <hr />
  <p><strong>Delegate Name:</strong> ${reg.fullName}</p>
  <p><strong>Affiliation:</strong> ${reg.affiliation} (${reg.country})</p>
  <p><strong>Registration Category:</strong> ${reg.participantType}</p>
  <p><strong>Amount Paid:</strong> ${reg.feeAmount} ${reg.currency}</p>
  <p><strong>Transaction Ref:</strong> ${reg.transactionRef || "Verified"}</p>
  <p><strong>Status:</strong> PAID</p>
</body>
</html>`;

    const filename = `Receipt-${reg.registrationCode}.html`;
    const uploaded = await storageService.uploadFile({
      buffer: Buffer.from(receiptHtml, "utf-8"),
      filename,
      mimeType: "text/html",
      folder: "private/invoices",
      generateBlur: false,
    });

    return {
      registrationCode: reg.registrationCode,
      documentType: "RECEIPT_INVOICE",
      filename,
      downloadUrl: uploaded.url,
      generatedAt: issuedAt,
    };
  }

  /**
   * Generates Official Visa Support Letter for international delegates
   */
  public async generateVisaSupportLetter(registrationCode: string): Promise<DocumentSummary> {
    const reg = await prisma.registration.findUnique({
      where: { registrationCode: registrationCode.trim().toUpperCase() },
    });

    if (!reg) {
      throw new Error("Không tìm thấy hồ sơ đại biểu.");
    }

    if (reg.paymentStatus !== "PAID") {
      throw new Error("Thư hỗ trợ Visa chỉ được cấp sau khi đại biểu hoàn tất thanh toán.");
    }

    const issuedAt = new Date().toISOString();
    const visaHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Visa Support Letter - ${reg.registrationCode}</title></head>
<body style="font-family: serif; padding: 48px; color: #0f172a; line-height: 1.6;">
  <h2>IEEE SMC 2027 ORGANIZING COMMITTEE</h2>
  <p>Ho Chi Minh City University of Technology and Education (HCMUTE), Vietnam</p>
  <hr />
  <h3>OFFICIAL VISA SUPPORT LETTER</h3>
  <p><strong>Date:</strong> ${issuedAt.slice(0, 10)}</p>
  <p><strong>Registration Code:</strong> ${reg.registrationCode}</p>
  <p><strong>Full Name:</strong> ${reg.fullName}</p>
  <p><strong>Passport Number:</strong> ${reg.passportNumber || "On File"}</p>
  <p><strong>Nationality / Country:</strong> ${reg.country}</p>
  <p><strong>Affiliation:</strong> ${reg.affiliation}</p>
  ${reg.paperId ? `<p><strong>Accepted Paper ID:</strong> ${reg.paperId} - ${reg.paperTitle || ""}</p>` : ""}
  <p>This letter confirms that the above delegate is officially registered and has paid the registration fee in full to attend the 2027 IEEE International Conference on Systems, Man, and Cybernetics (IEEE SMC 2027) in Ho Chi Minh City, Vietnam from October 6 to October 10, 2027.</p>
</body>
</html>`;

    const filename = `Visa-Letter-${reg.registrationCode}.html`;
    const uploaded = await storageService.uploadFile({
      buffer: Buffer.from(visaHtml, "utf-8"),
      filename,
      mimeType: "text/html",
      folder: "private/visa-letters",
      generateBlur: false,
    });

    return {
      registrationCode: reg.registrationCode,
      documentType: "VISA_SUPPORT_LETTER",
      filename,
      downloadUrl: uploaded.url,
      generatedAt: issuedAt,
    };
  }
}

export const documentService = new DocumentService();
export default documentService;
