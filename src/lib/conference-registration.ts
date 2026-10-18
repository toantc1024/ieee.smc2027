import QRCode from "qrcode";

export const CONFERENCE_BANK_INFO = {
  bankId: "VCB",
  bankName: "Vietcombank - Thu Duc Branch, Ho Chi Minh City",
  accountNo: "0381000385642",
  accountName: "TRUONG DH SU PHAM KY THUAT TPHCM",
  swiftBic: "BFTVVNVX",
  address: "01 Vo Van Ngan, Linh Chieu Ward, Thu Duc City, Ho Chi Minh City, Vietnam",
};

export interface FeeTier {
  id: "AUTHOR" | "IEEE_MEMBER" | "STUDENT" | "REGULAR";
  label: string;
  badge: string;
  vnd: number;
  usd: number;
  description: string;
  requiresPaper: boolean;
  features: string[];
}

export const REGISTRATION_FEES: Record<FeeTier["id"], FeeTier> = {
  AUTHOR: {
    id: "AUTHOR",
    label: "Author Delegate",
    badge: "Paper ID Required",
    vnd: 12000000,
    usd: 500,
    description: "For primary authors with accepted manuscripts to be presented at IEEE SMC 2027.",
    requiresPaper: true,
    features: [
      "Covers publication of 1 accepted paper up to 6 pages",
      "Indexed in IEEE Xplore, Scopus & EI Compendex",
      "Official IEEE SMC 2027 Conference Kit",
      "Full access to Gala Banquet & 3-day Networking Lunches",
      "Official International Presentation Certificate",
    ],
  },
  IEEE_MEMBER: {
    id: "IEEE_MEMBER",
    label: "IEEE Member",
    badge: "Member Rate",
    vnd: 10000000,
    usd: 420,
    description: "Exclusive rate for active members of IEEE and the IEEE SMC Society.",
    requiresPaper: false,
    features: [
      "Full access to all parallel Technical Sessions",
      "Access to Plenary Keynotes & Special Workshops",
      "Official IEEE SMC 2027 Conference Kit",
      "Full access to Gala Banquet & Networking Lunches",
      "Official Attendance Certificate",
    ],
  },
  STUDENT: {
    id: "STUDENT",
    label: "Student Delegate",
    badge: "Student Rate",
    vnd: 6000000,
    usd: 250,
    description: "For full-time undergraduate, master's, and PhD students with valid student ID.",
    requiresPaper: false,
    features: [
      "Full access to all Technical Sessions & Workshops",
      "Student Conference Welcome Kit",
      "Daily conference networking lunch vouchers",
      "Young Professionals & Fellows networking sessions",
      "Official Student Attendance Certificate",
    ],
  },
  REGULAR: {
    id: "REGULAR",
    label: "Regular / Industry Delegate",
    badge: "Standard",
    vnd: 14000000,
    usd: 580,
    description: "For academic attendees, industry engineers, and international professionals.",
    requiresPaper: false,
    features: [
      "All-access pass to sessions, panels, and exhibitions",
      "Full entry to Tech Exhibition & Industry Booths",
      "Executive Conference Kit",
      "VIP Gala Banquet ticket at 5-star hotel",
      "Official Attendance Certificate",
    ],
  },
};

export { formatVND, formatUSD } from "./utils";

/**
 * Generates an official unique registration code like: SMC27-K8F291
 */
export function generateRegistrationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SMC27-${randomPart}`;
}

/**
 * Returns the exact transfer syntax for automated bank reconciliation
 */
export function getTransferSyntax(registrationCode: string): string {
  return `SMC2027 ${registrationCode.replace(/[^A-Za-z0-9]/g, "")}`;
}

/**
 * Generates official VietQR NAPAS 24/7 image URL
 */
export function getVietQrUrl(registrationCode: string, amount: number): string {
  const syntax = getTransferSyntax(registrationCode);
  return `https://img.vietqr.io/image/${CONFERENCE_BANK_INFO.bankId}-${CONFERENCE_BANK_INFO.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(syntax)}&accountName=${encodeURIComponent(CONFERENCE_BANK_INFO.accountName)}`;
}

/**
 * Generate Base64 QR Code SVG/PNG data URL locally (Great Firewall safe, zero CDN)
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 320,
      color: {
        dark: "#002244",
        light: "#ffffff",
      },
    });
  } catch (error) {
    console.error("Error generating local QR code:", error);
    return "";
  }
}
