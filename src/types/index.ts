/**
 * Shared Domain Types & Service DTOs for IEEE SMC 2027 Fullstack Architecture
 */

import type { ParticipantType, PaymentStatus, PostStatus, Role } from "@prisma/client";

export type { ParticipantType, PaymentStatus, PostStatus, Role };

export type StorageFolder =
  | "public/uploads"
  | "public/avatars"
  | "public/news"
  | "public/proofs"
  | "private/passports"
  | "private/invoices"
  | "private/visa-letters";

export interface UploadFileInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  folder?: StorageFolder;
  generateBlur?: boolean;
  uploadedById?: string | null;
  altText?: string | null;
}

export interface UploadFileResult {
  id?: string;
  key: string;
  bucket: string;
  url: string;
  proxyUrl: string;
  filename: string;
  size: number;
  mimeType: string;
  folder: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
  storageDriver: "minio" | "local-fallback";
  createdAt?: string;
}

export interface UnstructuredRegistrationFormData {
  // Academic / PaperCept
  paperId?: string;
  paperTitle?: string;
  secondaryPaperId?: string;
  extraPagesCount?: number;
  extraBanquetTickets?: number;
  ieeeMemberNumber?: string;
  proofDocumentUrl?: string;
  proofVerified?: boolean;

  // Passport & Visa Support
  passportNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  nationality?: string;
  dateOfBirth?: string;
  embassyCity?: string;
  passportScanUrl?: string;
  needsVisaSupport?: boolean;
  visaApprovalStatus?: "NOT_REQUESTED" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

  // Dietary & Travel
  dietaryRequirement?: string;
  allergyDetails?: string;
  arrivalFlight?: string;
  arrivalDateTime?: string;
  departureFlight?: string;
  departureDateTime?: string;
  hotelName?: string;
  airportShuttleRequired?: boolean;
  travelNotes?: string;

  // Tax & Invoice
  invoiceCompanyName?: string;
  invoiceTaxCode?: string;
  invoiceAddress?: string;

  // Custom dynamic JSON attributes
  customFields?: Record<string, string>;
  [key: string]: unknown;
}

export interface DelegateProfileData {
  phone?: string;
  affiliation?: string;
  department?: string;
  academicTitle?: string;
  country?: string;
  orcid?: string;
  ieeeMemberNumber?: string;
  bio?: string;
  dietaryRequirement?: string;
  passportNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  nationality?: string;
  passportScanUrl?: string;
  proofDocumentUrl?: string;
  invoiceCompanyName?: string;
  invoiceTaxCode?: string;
  invoiceAddress?: string;
  customFields?: Record<string, string>;
  [key: string]: unknown;
}

export interface CreateRegistrationInput {
  userId?: string | null;
  fullName: string;
  email: string;
  phone?: string | null;
  affiliation: string;
  country: string;
  participantType: ParticipantType;
  paperId?: string | null;
  paperTitle?: string | null;
  passportNumber?: string | null;
  needsVisaSupport?: boolean;
  dietaryRequirement?: string;
  travelNotes?: string | null;
  avatarUrl?: string | null;
  paymentMethod?: "PAYOO_VIETQR" | "PAYOO_CARD" | "VIETQR" | "CARD";
  currency?: "VND" | "USD";
  formData?: UnstructuredRegistrationFormData;
}

export interface BankReconciliationPayload {
  transactionId: string;
  amount: number;
  currency?: string;
  transferContent: string;
  paidAt?: string | Date;
  rawPayload?: Record<string, unknown>;
}

export interface EmailDispatchInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface BroadcastCampaignInput {
  targetGroup: "ALL" | "PAID" | "PENDING" | "AUTHOR" | "STUDENT";
  campaignType: "GENERAL" | "CFP_REMINDER" | "INVITATION" | "URGENT";
  templateSlug?: string;
  subject: string;
  message: string;
}

export interface DocumentSummary {
  registrationCode: string;
  documentType: "RECEIPT_INVOICE" | "VISA_SUPPORT_LETTER";
  filename: string;
  downloadUrl: string;
  generatedAt: string;
}
