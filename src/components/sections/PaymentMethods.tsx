"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Building2,
  Globe2,
  Copy,
  Check,
  Receipt,
  FileCheck2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";

interface PaymentMethodsProps {
  title?: string;
  subtitle?: string;
}

const REGISTRATION_RATES = [
  {
    category: "IEEE Member (Author)",
    earlyBird: "$650 USD",
    standard: "$750 USD",
    late: "$850 USD",
    note: "Includes 1 paper upload up to 6 pages, conference kit, banquet & all sessions",
    popular: true,
  },
  {
    category: "Non-IEEE Member (Author)",
    earlyBird: "$780 USD",
    standard: "$890 USD",
    late: "$990 USD",
    note: "Includes 1 paper upload up to 6 pages, conference kit, banquet & all sessions",
    popular: false,
  },
  {
    category: "IEEE Student Member",
    earlyBird: "$350 USD",
    standard: "$420 USD",
    late: "$490 USD",
    note: "Requires valid student ID verification; covers 1 student paper or attendee pass",
    popular: false,
  },
  {
    category: "Non-Member Student",
    earlyBird: "$420 USD",
    standard: "$490 USD",
    late: "$560 USD",
    note: "Valid student proof required; covers technical access & kit",
    popular: false,
  },
  {
    category: "Attendee / Industry Participant",
    earlyBird: "$450 USD",
    standard: "$520 USD",
    late: "$600 USD",
    note: "Access to all technical keynotes, workshops, and exhibition zones",
    popular: false,
  },
];

export function PaymentMethods({
  title = "Registration & Payment Methods",
  subtitle = "Official registration fees and payment instructions for IEEE SMC 2027 participants and authors",
}: PaymentMethodsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <SectionContainer id="registration" fullWidthBg="bg-slate-50/50">
      {/* 1. Header */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-6 w-full">
        <div className="corner-dot-tr opacity-70 pointer-events-none" />

        <div className="space-y-3 w-full relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 border border-blue-200/80 text-xs font-bold text-[#115eff] uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Conference Registration</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight leading-[1.15]">
            <span className="block text-[#004776]">Registration &</span>
            <span className="block text-[#115eff]">Payment Methods</span>
          </h2>

          <p className="text-base sm:text-lg text-[#004776]/80 font-medium max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* 2. Fee Table */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#004776]">
                Registration Fee Schedule (IEEE SMC 2027)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                All prices in USD. Early bird registration deadline:{" "}
                <strong>July 05, 2027</strong>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>IEEE Scopus & Xplore Proceedings Included</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100/70 text-xs uppercase tracking-wider font-bold text-[#004776] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Registration Category</th>
                  <th className="py-3.5 px-4">Early Bird (Before Jul 05)</th>
                  <th className="py-3.5 px-4">Standard (Before Aug 05)</th>
                  <th className="py-3.5 px-4">Late / On-Site</th>
                  <th className="py-3.5 px-4 sm:px-6">Entitlements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {REGISTRATION_RATES.map((rate, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      rate.popular ? "bg-blue-50/20" : ""
                    }`}
                  >
                    <td className="py-4 px-4 sm:px-6 font-bold text-slate-900 flex items-center gap-2">
                      <span>{rate.category}</span>
                      {rate.popular && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#115eff] text-white">
                          Main
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#115eff]">
                      {rate.earlyBird}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-900">
                      {rate.standard}
                    </td>
                    <td className="py-4 px-4 text-slate-500">{rate.late}</td>
                    <td className="py-4 px-4 sm:px-6 text-xs text-slate-600 max-w-xs">
                      {rate.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Official Payment Channels (Cards Grid) */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <h3 className="text-xl sm:text-2xl font-bold text-[#004776] mb-6">
          Official Payment Channels
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Channel 1: Domestic Wire / VietQR */}
          <div className="p-6 bg-white border border-slate-200 hover:border-[#115eff] rounded-xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#115eff] border border-blue-100 flex items-center justify-center mb-4 group-hover:bg-[#115eff] group-hover:text-white transition-colors">
                <Building2 className="w-6 h-6" />
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Domestic (Vietnam)
              </div>
              <h4 className="text-lg font-bold text-[#004776] mb-2">
                Chuyển Khoản Ngân Hàng (Vietcombank)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Dành cho đại biểu và tác giả tại Việt Nam thanh toán học phí / lệ phí hội nghị qua VietQR hoặc Napas 24/7.
              </p>

              <div className="space-y-2 text-xs bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div>
                  <span className="text-slate-500 block">Tên đơn vị thụ hưởng:</span>
                  <span className="font-bold text-slate-900">
                    TRUONG DAI HOC SU PHAM KY THUAT TP. HO CHI MINH
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Số tài khoản:</span>
                  <div className="flex items-center justify-between font-mono font-bold text-sm text-[#115eff]">
                    <span>038 100 038 9999</span>
                    <button
                      onClick={() => handleCopy("vcb_acc", "0381000389999")}
                      className="text-slate-500 hover:text-slate-900 cursor-pointer p-1"
                      title="Copy account number"
                    >
                      {copiedKey === "vcb_acc" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block">Ngân hàng:</span>
                  <span className="text-slate-800 font-medium">
                    Vietcombank - CN Thủ Đức, TP.HCM
                  </span>
                </div>
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-slate-500 block">Cú pháp chuyển tiền:</span>
                  <div className="flex items-center justify-between font-mono text-[11px] font-bold text-slate-800 bg-white p-1.5 rounded border border-slate-200">
                    <span>SMC2027 [PaperID] [Họ Tên]</span>
                    <button
                      onClick={() => handleCopy("syntax", "SMC2027 [PaperID] [Họ Tên]")}
                      className="text-slate-500 hover:text-slate-900 cursor-pointer p-0.5"
                    >
                      {copiedKey === "syntax" ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Hỗ trợ xuất hóa đơn VAT</span>
              <span className="text-emerald-600 font-semibold">Tự động đối soát</span>
            </div>
          </div>

          {/* Channel 2: International Wire / SWIFT */}
          <div className="p-6 bg-white border border-slate-200 hover:border-[#115eff] rounded-xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#115eff] border border-blue-100 flex items-center justify-center mb-4 group-hover:bg-[#115eff] group-hover:text-white transition-colors">
                <Globe2 className="w-6 h-6" />
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                International Authors
              </div>
              <h4 className="text-lg font-bold text-[#004776] mb-2">
                International Wire Transfer (SWIFT)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Recommended for international overseas wire payments in USD. All bank remittance charges must be borne by the sender.
              </p>

              <div className="space-y-2 text-xs bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div>
                  <span className="text-slate-500 block">Beneficiary Name:</span>
                  <span className="font-bold text-slate-900">
                    HCM CITY UNIV OF TECHNOLOGY & ENGINEERING
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Beneficiary Bank:</span>
                  <span className="text-slate-800 font-medium">
                    Joint Stock Commercial Bank for Foreign Trade of Vietnam
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">SWIFT Code (BIC):</span>
                  <div className="flex items-center justify-between font-mono font-bold text-sm text-[#115eff]">
                    <span>BFTV VNVX</span>
                    <button
                      onClick={() => handleCopy("swift", "BFTVVNVX")}
                      className="text-slate-500 hover:text-slate-900 cursor-pointer p-1"
                      title="Copy SWIFT code"
                    >
                      {copiedKey === "swift" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-slate-500 block">Payment Reference:</span>
                  <span className="font-mono text-[11px] font-bold text-slate-800">
                    IEEE SMC 2027 - Paper ID [XXXX]
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Currency: USD</span>
              <span className="text-[#115eff] font-semibold">SWIFT Verified</span>
            </div>
          </div>

          {/* Channel 3: Online PaperCept / Credit Card */}
          <div className="p-6 bg-white border border-slate-200 hover:border-[#115eff] rounded-xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#115eff] border border-blue-100 flex items-center justify-center mb-4 group-hover:bg-[#115eff] group-hover:text-white transition-colors">
                <CreditCard className="w-6 h-6" />
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Online Portal
              </div>
              <h4 className="text-lg font-bold text-[#004776] mb-2">
                PaperCept Online Card Portal
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Instant confirmation using international credit cards (Visa, MasterCard, JCB, American Express) via the official IEEE PaperCept gateway.
              </p>

              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-lg space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#004776] font-bold">
                  <FileCheck2 className="w-4 h-4 text-[#115eff]" />
                  <span>Instant Receipt & Confirmation</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Upon completion, your registration is instantly linked to your PaperCept manuscript ID and early-bird status is locked.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700">
                    VISA
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700">
                    MasterCard
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700">
                    JCB
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <a
                href="#cfp"
                className="w-full py-2.5 px-4 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-xs rounded-[0.26rem] transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Access PaperCept Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 4. VAT Invoice & Notes Notice Box */}
      <div className="px-4 sm:px-6 pb-12">
        <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-blue-50 text-[#115eff] border border-blue-100 shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#004776]">
                Yêu cầu Xuất Hóa Đơn Điện Tử (VAT e-Invoice)
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Đại biểu và đơn vị có nhu cầu xuất hóa đơn tài chính (Hóa đơn điện tử của Trường Đại học Sư phạm Kỹ thuật TP. Hồ Chí Minh) vui lòng gửi thông tin công ty, mã số thuế và ủy nhiệm chi tới email ban tài chính:{" "}
                <strong className="text-[#115eff]">{CONFERENCE_INFO.contactEmail}</strong>.
              </p>
            </div>
          </div>

          <a
            href={`mailto:${CONFERENCE_INFO.contactEmail}?subject=IEEE%20SMC%202027%20VAT%20Invoice%20Request`}
            className="shrink-0 px-4 py-2.5 bg-white hover:bg-slate-50 text-[#115eff] font-bold text-xs rounded-[0.26rem] border border-[#115eff] transition-colors whitespace-nowrap"
          >
            Yêu cầu Hóa đơn VAT
          </a>
        </div>
      </div>
    </SectionContainer>
  );
}

export default PaymentMethods;
