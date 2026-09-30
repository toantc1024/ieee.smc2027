import QRCode from "qrcode";

export const CONFERENCE_BANK_INFO = {
  bankId: "VCB",
  bankName: "Vietcombank - Chi nhánh Thủ Đức, TP. Hồ Chí Minh",
  accountNo: "0381000385642",
  accountName: "TRUONG DH SU PHAM KY THUAT TPHCM",
  swiftBic: "BFTVVNVX",
  address: "01 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh",
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
    label: "Tác giả báo cáo (Author Delegate)",
    badge: "Bắt buộc mã bài",
    vnd: 12000000,
    usd: 500,
    description: "Dành cho tác giả chính có bài báo được chấp nhận trình bày tại IEEE SMC 2027.",
    requiresPaper: true,
    features: [
      "Quyền nộp 1 bài báo chính thức lên đến 6 trang",
      "Bài báo được đăng trên IEEE Xplore, chỉ mục Scopus & EI",
      "Bộ tài liệu hội nghị chính thức (Conference Kit)",
      "Vé tham dự Gala Dinner & Tiệc trưa Networking 3 ngày",
      "Chứng nhận trình bày bài báo quốc tế (Certificate)",
    ],
  },
  IEEE_MEMBER: {
    id: "IEEE_MEMBER",
    label: "Hội viên IEEE (IEEE Member)",
    badge: "Ưu đãi hội viên",
    vnd: 10000000,
    usd: 420,
    description: "Dành riêng cho hội viên chính thức của IEEE và IEEE SMC Society.",
    requiresPaper: false,
    features: [
      "Tham dự tất cả các phiên Technical Sessions song song",
      "Tham gia các phiên Plenary Keynotes & Workshops",
      "Bộ tài liệu hội nghị chính thức",
      "Vé tham dự Gala Dinner & Tiệc trưa Networking",
      "Chứng nhận tham dự hội nghị quốc tế",
    ],
  },
  STUDENT: {
    id: "STUDENT",
    label: "Sinh viên / Học viên (Student Delegate)",
    badge: "Ưu đãi sinh viên",
    vnd: 6000000,
    usd: 250,
    description: "Dành cho sinh viên, học viên cao học, nghiên cứu sinh (yêu cầu thẻ SV hợp lệ).",
    requiresPaper: false,
    features: [
      "Tham dự toàn bộ các phiên báo cáo & Workshop kỹ thuật",
      "Bộ quà tặng hội nghị sinh viên",
      "Phiếu ăn trưa networking tại hội nghị",
      "Cơ hội giao lưu cùng các Giáo sư hàng đầu thế giới",
      "Chứng nhận tham dự sinh viên",
    ],
  },
  REGULAR: {
    id: "REGULAR",
    label: "Đại biểu tự do / Doanh nghiệp (Regular / Industry)",
    badge: "Tiêu chuẩn",
    vnd: 14000000,
    usd: 580,
    description: "Dành cho đại biểu học thuật tự do, kỹ sư công nghiệp và chuyên gia quốc tế.",
    requiresPaper: false,
    features: [
      "Toàn quyền truy cập tất cả các phiên thảo luận và triển lãm",
      "Tham gia khu vực Tech Exhibition & Industry Booths",
      "Bộ tài liệu hội nghị cao cấp",
      "Vé tham dự Gala Dinner tại khách sạn 5 sao",
      "Chứng nhận tham dự hội nghị",
    ],
  },
};

/**
 * Format currency VND nicely
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency USD nicely
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

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
