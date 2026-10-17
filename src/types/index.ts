/**
 * Shared Domain Types & Service DTOs for IEEE SMC 2027 Fullstack Architecture
 */

import type { ParticipantType, PaymentStatus, PostStatus, Role } from "@prisma/client";

export type { ParticipantType, PaymentStatus, PostStatus, Role };

export type StorageFolder =
  | "public/uploads"
  | "public/avatars"
  | "public/news"
  | "private/passports"
  | "private/invoices"
  | "private/visa-letters";

export interface UploadFileInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  folder?: StorageFolder;
  generateBlur?: boolean;
}

export interface UploadFileResult {
  key: string;
  bucket: string;
  url: string;
  proxyUrl: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
  storageDriver: "minio" | "local-fallback";
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
  paymentMethod?: "VIETQR" | "CARD";
  currency?: "VND" | "USD";
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
