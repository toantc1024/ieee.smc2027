/**
 * Document Service (Payment Receipt / Invoice & Visa Support Letter)
 * Generates official conference documents using relational + JSON formData and archives them in MinIO storage.
 */

import prisma from "@/lib/prisma";
import storageService from "./storage.service";
import type { DocumentSummary, UnstructuredRegistrationFormData } from "@/types";

export class DocumentService {
  /**
   * Generates Payment Receipt / Electronic Invoice for a paid delegate
   */
  public async generatePaymentReceipt(registrationCode: string): Promise<DocumentSummary> {
    const reg = await prisma.registration.findUnique({
      where: { registrationCode: registrationCode.trim().toUpperCase() },
    });

    if (!reg) {
      throw new Error("Delegate registration record not found.");
    }

    if (reg.paymentStatus !== "PAID") {
      throw new Error("Payment receipt is only issued after registration fee payment is completed.");
    }

    const formData: UnstructuredRegistrationFormData =
      reg.formData && typeof reg.formData === "object"
        ? (reg.formData as UnstructuredRegistrationFormData)
        : {};

    const issuedAt = new Date().toISOString();
    const receiptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Receipt - ${reg.registrationCode}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 48px; color: #0f172a; max-width: 820px; margin: 0 auto; }
    .header { border-bottom: 3px solid #005496; padding-bottom: 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { color: #005496; font-size: 24px; font-weight: 800; margin: 0; }
    .subtitle { color: #475569; font-size: 13px; margin-top: 4px; }
    .badge { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 6px 14px; border-radius: 999px; font-weight: 700; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 14px; }
    th { background: #f8fafc; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    .total { font-size: 18px; font-weight: 800; color: #005496; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">IEEE SMC 2027 — OFFICIAL PAYMENT RECEIPT</h1>
      <p class="subtitle">Ho Chi Minh City University of Technology and Education · October 6–10, 2027</p>
    </div>
    <span class="badge">PAID & VERIFIED</span>
  </div>

  <table>
    <tr><th>Receipt Number</th><td>INV-${reg.registrationCode}</td></tr>
    <tr><th>Date Issued</th><td>${issuedAt.slice(0, 10)}</td></tr>
    <tr><th>Registration Code</th><td><strong>${reg.registrationCode}</strong></td></tr>
    <tr><th>Delegate Name</th><td>${reg.fullName}</td></tr>
    <tr><th>Email</th><td>${reg.email}</td></tr>
    <tr><th>Affiliation</th><td>${reg.affiliation} — ${reg.country}</td></tr>
    <tr><th>Registration Category</th><td>${reg.participantType}</td></tr>
    ${reg.paperId ? `<tr><th>PaperCept Paper ID</th><td>${reg.paperId} ${reg.paperTitle ? `— ${reg.paperTitle}` : ""}</td></tr>` : ""}
    ${formData.extraPagesCount ? `<tr><th>Extra Pages Surcharge</th><td>${formData.extraPagesCount} page(s)</td></tr>` : ""}
    ${formData.extraBanquetTickets ? `<tr><th>Additional Banquet Tickets</th><td>${formData.extraBanquetTickets} ticket(s)</td></tr>` : ""}
    ${formData.invoiceCompanyName ? `<tr><th>Invoice Organization</th><td>${formData.invoiceCompanyName}</td></tr>` : ""}
    ${formData.invoiceTaxCode ? `<tr><th>Tax Identification Number</th><td>${formData.invoiceTaxCode}</td></tr>` : ""}
    ${formData.invoiceAddress ? `<tr><th>Billing Address</th><td>${formData.invoiceAddress}</td></tr>` : ""}
    <tr><th>Payment Gateway</th><td>${reg.paymentMethod || "PAYOO"}</td></tr>
    <tr><th>Transaction Reference</th><td>${reg.transactionRef || "Verified"}</td></tr>
    <tr><th>Total Amount Paid</th><td class="total">${reg.feeAmount.toLocaleString("en-US")} ${reg.currency}</td></tr>
  </table>
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
      downloadUrl: uploaded.proxyUrl || uploaded.url,
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
      throw new Error("Delegate registration record not found.");
    }

    if (reg.paymentStatus !== "PAID") {
      throw new Error("Visa Support Letter is only issued after registration fee payment is completed.");
    }

    const formData: UnstructuredRegistrationFormData =
      reg.formData && typeof reg.formData === "object"
        ? (reg.formData as UnstructuredRegistrationFormData)
        : {};

    const issuedAt = new Date().toISOString();
    const visaHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Visa Support Letter - ${reg.registrationCode}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; padding: 56px; color: #0f172a; line-height: 1.7; max-width: 820px; margin: 0 auto; }
    .letterhead { border-bottom: 2px solid #005496; padding-bottom: 16px; margin-bottom: 32px; }
    .org { color: #005496; font-size: 20px; font-weight: bold; margin: 0; }
    .sub { font-size: 13px; color: #475569; margin: 4px 0 0 0; }
    .grid { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px 24px; margin: 24px 0; }
    .grid p { margin: 6px 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="letterhead">
    <p class="org">IEEE SMC 2027 ORGANIZING COMMITTEE</p>
    <p class="sub">Ho Chi Minh City University of Technology and Education · 01 Vo Van Ngan, Thu Duc City, Ho Chi Minh City, Vietnam</p>
  </div>

  <p><strong>Date of Issue:</strong> ${issuedAt.slice(0, 10)}</p>
  <p><strong>Subject:</strong> Official Visa Support Letter for IEEE SMC 2027 Delegate</p>

  <div class="grid">
    <p><strong>Registration Code:</strong> ${reg.registrationCode}</p>
    <p><strong>Full Name:</strong> ${reg.fullName}</p>
    <p><strong>Passport Number:</strong> ${reg.passportNumber || formData.passportNumber || "On File"}</p>
    ${formData.passportIssueDate ? `<p><strong>Passport Issue Date:</strong> ${formData.passportIssueDate}</p>` : ""}
    ${formData.passportExpiryDate ? `<p><strong>Passport Expiry Date:</strong> ${formData.passportExpiryDate}</p>` : ""}
    <p><strong>Nationality:</strong> ${formData.nationality || reg.country}</p>
    <p><strong>Affiliation:</strong> ${reg.affiliation}</p>
    ${formData.embassyCity ? `<p><strong>Consulate / Embassy Location:</strong> ${formData.embassyCity}</p>` : ""}
    ${reg.paperId ? `<p><strong>PaperCept Paper ID:</strong> ${reg.paperId} ${reg.paperTitle ? `— ${reg.paperTitle}` : ""}</p>` : ""}
  </div>

  <p>To Whom It May Concern,</p>
  <p>This official letter confirms that <strong>${reg.fullName}</strong> from <strong>${reg.affiliation}</strong> is registered and has paid the conference registration fee in full to attend the <strong>2027 IEEE International Conference on Systems, Man, and Cybernetics</strong> in Ho Chi Minh City, Vietnam from <strong>October 6 to October 10, 2027</strong>.</p>
  <p>We kindly request that the Embassy or Consulate of the Socialist Republic of Vietnam grant an entry visa to the above-named delegate to participate in the scientific sessions at Ho Chi Minh City University of Technology and Education.</p>
  <br />
  <p>Sincerely,<br /><strong>IEEE SMC 2027 Local Organizing Committee</strong><br />Ho Chi Minh City University of Technology and Education</p>
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
      downloadUrl: uploaded.proxyUrl || uploaded.url,
      generatedAt: issuedAt,
    };
  }
}

export const documentService = new DocumentService();
export default documentService;
