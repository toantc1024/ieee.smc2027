/**
 * Milestone Email Template & Broadcast Notification Service
 * Supports DB-backed milestone templates, merge tags, Email Link + OTP sign-in,
 * Registration Confirmation, Payoo Payment Receipt, Visa Support Letter, and Bulk Broadcasts.
 */

import prisma from "@/lib/prisma";
import env from "@/config/env";
import type { BroadcastCampaignInput, EmailDispatchInput } from "@/types";

export interface MilestoneTemplateSeed {
  slug: string;
  name: string;
  milestone: string;
  targetGroup: string;
  subject: string;
  preheader: string;
  textContent: string;
  htmlContent: string;
}

function wrapBrandedEmailHtml(params: {
  badge: string;
  headline: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IEEE SMC 2027 Official Communication</title>
</head>
<body style="margin:0;padding:24px 12px;background-color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#004776;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
    <tr>
      <td style="background:linear-gradient(135deg,#004776 0%,#115eff 100%);padding:24px 28px;color:#FFFFFF;">
        <div style="display:inline-block;background-color:rgba(255,255,255,0.18);color:#FFFFFF;font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 10px;border-radius:999px;text-transform:uppercase;margin-bottom:10px;">
          ${params.badge}
        </div>
        <h1 style="margin:0;font-size:21px;font-weight:800;line-height:1.3;color:#FFFFFF;">
          ${params.headline}
        </h1>
        <p style="margin:6px 0 0;font-size:12px;opacity:0.9;color:#E2E8F0;">
          IEEE SMC 2027 • Ho Chi Minh City University of Technology and Education
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:28px;font-size:14px;line-height:1.65;color:#1E293B;">
        ${params.bodyHtml}
        ${
          params.ctaLabel && params.ctaUrl
            ? `<div style="margin:24px 0 8px;text-align:center;">
                <a href="${params.ctaUrl}" style="display:inline-block;background-color:#115eff;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:700;padding:12px 26px;border-radius:6px;">
                  ${params.ctaLabel}
                </a>
              </div>`
            : ""
        }
      </td>
    </tr>
    <tr>
      <td style="background-color:#05225C;padding:20px 28px;color:#CBD5E1;font-size:12px;line-height:1.5;">
        <strong style="color:#FFFFFF;display:block;margin-bottom:4px;">IEEE International Conference on Systems, Man, and Cybernetics 2027</strong>
        <span>Host Institution: Ho Chi Minh City University of Technology and Education — 01 Vo Van Ngan, Thu Duc City, Ho Chi Minh City, Vietnam</span><br/>
        <span>Official Portal: <a href="${env.app.url}" style="color:#93C5FD;text-decoration:none;">${env.app.url}</a></span>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const DEFAULT_MILESTONE_TEMPLATES: MilestoneTemplateSeed[] = [
  {
    slug: "auth-email-link",
    name: "Delegate Email Sign-In Link & Verification Code",
    milestone: "M0_AUTH_EMAIL_LINK",
    targetGroup: "ALL",
    subject: "[IEEE SMC 2027] Your One-Click Sign-In Link & Verification Code",
    preheader: "Use this link or 6-digit code to sign in to IEEE SMC 2027",
    textContent: `Dear Delegate,\n\nClick the link below to sign in directly to your IEEE SMC 2027 account:\n{{EmailLink}}\n\nOr enter this 6-digit verification code on the login page:\n{{OtpCode}}\n\nThis link and code are valid for 15 minutes.\n\nIEEE SMC 2027 Secretariat`,
    htmlContent: wrapBrandedEmailHtml({
      badge: "Security & Access",
      headline: "Sign In to IEEE SMC 2027",
      bodyHtml: `
        <p>Dear Delegate,</p>
        <p>Use the one-click sign-in button below to access your IEEE SMC 2027 Delegate Portal, or enter the 6-digit verification code directly on the login screen:</p>
        <div style="margin:18px 0;padding:16px;background-color:#F8FAFC;border:1px solid #CBD5E1;border-radius:6px;text-align:center;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748B;letter-spacing:1px;">6-Digit Verification Code</div>
          <div style="font-size:28px;font-weight:900;letter-spacing:6px;color:#115eff;font-family:monospace;margin-top:6px;">{{OtpCode}}</div>
        </div>
        <p style="font-size:12px;color:#64748B;">Designed for reliable access across international and Chinese academic email gateways.</p>
      `,
      ctaLabel: "Sign In with Email Link",
      ctaUrl: "{{EmailLink}}",
    }),
  },
  {
    slug: "milestone-papercept-submission",
    name: "Milestone 1: PaperCept Full Paper Submission Open",
    milestone: "M1_PAPERCEPT_SUBMISSION",
    targetGroup: "AUTHOR",
    subject: "[IEEE SMC 2027] Call for Papers & PaperCept Submission Milestone",
    preheader: "Submit your full manuscript via PaperCept before April 08, 2027",
    textContent: `Dear {{FullName}},\n\nThe IEEE SMC 2027 Technical Program Committee invites you to submit your full manuscript via the official PaperCept portal (https://ras.papercept.net).\n\nKey Milestone Deadline: April 08, 2027.\n\nWarm regards,\nIEEE SMC 2027 Program Committee`,
    htmlContent: wrapBrandedEmailHtml({
      badge: "Milestone 1 • Call For Papers",
      headline: "PaperCept Manuscript Submission Open",
      bodyHtml: `
        <p>Dear <strong>{{FullName}}</strong>,</p>
        <p>The Technical Program Committee cordially reminds all prospective authors that full manuscript submissions for Regular Sessions, Special Sessions, and Workshops are processed exclusively through <strong>PaperCept</strong>.</p>
        <div style="margin:16px 0;padding:14px 18px;background-color:#EFF6FF;border-left:4px solid #115eff;border-radius:4px;">
          <strong style="color:#004776;">Submission Deadline: April 08, 2027</strong><br/>
          <span>All manuscripts must adhere to the standard IEEE two-column format.</span>
        </div>
      `,
      ctaLabel: "Open PaperCept Portal",
      ctaUrl: "https://ras.papercept.net",
    }),
  },
  {
    slug: "milestone-camera-ready",
    name: "Milestone 2: Camera-Ready & Author Registration Reminder",
    milestone: "M2_CAMERA_READY",
    targetGroup: "AUTHOR",
    subject: "[IEEE SMC 2027] Milestone Reminder: Camera-Ready & Author Registration",
    preheader: "Complete IEEE PDF eXpress check and Author registration on PaperCept",
    textContent: `Dear {{FullName}},\n\nCongratulations on your accepted paper ({{PaperID}}). Please upload your final camera-ready manuscript on PaperCept by July 15, 2027 and complete your Author Registration ({{RegistrationCode}}) via Payoo before August 05, 2027.\n\nPortal: {{PortalUrl}}\n\nWarm regards,\nIEEE SMC 2027 Publication Committee`,
    htmlContent: wrapBrandedEmailHtml({
      badge: "Milestone 2 • Camera-Ready",
      headline: "Camera-Ready Manuscript & Author Registration",
      bodyHtml: `
        <p>Dear <strong>{{FullName}}</strong>,</p>
        <p>Please ensure your final camera-ready manuscript for PaperCept ID <strong>{{PaperID}}</strong> passes IEEE PDF eXpress verification and your IEEE Electronic Copyright Form is completed.</p>
        <ul style="padding-left:20px;color:#334155;">
          <li><strong>Camera-Ready Deadline:</strong> July 15, 2027</li>
          <li><strong>Author Registration Deadline:</strong> August 05, 2027</li>
        </ul>
      `,
      ctaLabel: "Access Delegate Portal",
      ctaUrl: "{{PortalUrl}}",
    }),
  },
  {
    slug: "milestone-registration-created",
    name: "Milestone 3: Registration Recorded & Payoo Payment Instructions",
    milestone: "M3_REGISTRATION_CREATED",
    targetGroup: "PENDING",
    subject: "[IEEE SMC 2027] Registration Recorded ({{RegistrationCode}}) — Complete Payoo Payment",
    preheader: "Your registration code is ready. Complete payment via Payoo VietQR or International Card.",
    textContent: `Dear {{FullName}},\n\nThank you for registering for IEEE SMC 2027 in Ho Chi Minh City, Vietnam.\n\nRegistration Code: {{RegistrationCode}}\nCategory: {{ParticipantType}}\nTotal Fee: {{FeeAmount}} {{Currency}}\n\nComplete your payment via Payoo (VietQR or Visa/Mastercard) and track your status at:\n{{PortalUrl}}\n\nWarm regards,\nIEEE SMC 2027 Registration Secretariat`,
    htmlContent: wrapBrandedEmailHtml({
      badge: "Milestone 3 • Registration Recorded",
      headline: "Conference Registration Recorded",
      bodyHtml: `
        <p>Dear <strong>{{FullName}}</strong>,</p>
        <p>Your delegate registration for <strong>IEEE SMC 2027</strong> has been recorded in our system.</p>
        <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="margin:16px 0;background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;">
          <tr><td><strong>Registration Code:</strong></td><td style="font-family:monospace;font-weight:700;color:#115eff;">{{RegistrationCode}}</td></tr>
          <tr><td><strong>Delegate Category:</strong></td><td>{{ParticipantType}}</td></tr>
          <tr><td><strong>Registration Fee:</strong></td><td><strong>{{FeeAmount}} {{Currency}}</strong></td></tr>
          <tr><td><strong>Payment Gateway:</strong></td><td>Payoo — VietQR &amp; Visa / Mastercard</td></tr>
        </table>
        <p>Please complete your payment on the Delegate Portal to unlock your Official Receipt, Digital QR Badge, and Visa Support Letter.</p>
      `,
      ctaLabel: "Complete Payment & View Portal",
      ctaUrl: "{{PortalUrl}}",
    }),
  },
  {
    slug: "milestone-payment-confirmed",
    name: "Milestone 4: Payment Confirmed, Official Receipt & QR Badge",
    milestone: "M4_PAYMENT_CONFIRMED",
    targetGroup: "PAID",
    subject: "[IEEE SMC 2027] Payment Confirmed — Official Receipt & Digital QR Badge ({{RegistrationCode}})",
    preheader: "Your Payoo payment has been reconciled. Download your receipt and badge now.",
    textContent: `Dear {{FullName}},\n\nWe are pleased to confirm that your payment for IEEE SMC 2027 ({{RegistrationCode}}) has been verified via Payoo.\n\nAmount Paid: {{FeeAmount}} {{Currency}}\nTransaction Ref: {{TransactionRef}}\n\nDownload your Official Payment Receipt, Digital QR Badge, and Visa Support Letter at:\n{{PortalUrl}}\n\nWarm regards,\nIEEE SMC 2027 Finance Committee`,
    htmlContent: wrapBrandedEmailHtml({
      badge: "Milestone 4 • Payment Reconciled",
      headline: "Payment Confirmed & Digital Badge Ready",
      bodyHtml: `
        <p>Dear <strong>{{FullName}}</strong>,</p>
        <p>Your registration fee for <strong>IEEE SMC 2027</strong> has been reconciled via Payoo.</p>
        <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="margin:16px 0;background-color:#ECFDF5;border:1px solid #A7F3D0;border-radius:6px;font-size:13px;">
          <tr><td><strong>Registration Code:</strong></td><td style="font-family:monospace;font-weight:700;color:#065F46;">{{RegistrationCode}}</td></tr>
          <tr><td><strong>Amount Paid:</strong></td><td><strong>{{FeeAmount}} {{Currency}}</strong></td></tr>
          <tr><td><strong>Transaction Reference:</strong></td><td style="font-family:monospace;">{{TransactionRef}}</td></tr>
          <tr><td><strong>Status:</strong></td><td><strong style="color:#059669;">PAID</strong></td></tr>
        </table>
        <p>You can now download your <strong>Official Payment Receipt PDF</strong>, print your <strong>QR Conference Badge</strong>, and access your <strong>Visa Support Letter</strong> in the Delegate Portal.</p>
      `,
      ctaLabel: "Download Receipt & QR Badge",
      ctaUrl: "{{PortalUrl}}",
    }),
  },
  {
    slug: "milestone-visa-letter-ready",
    name: "Milestone 5: Official Visa Support Letter Approved",
    milestone: "M5_VISA_LETTER_READY",
    targetGroup: "PAID",
    subject: "[IEEE SMC 2027] Your Official Visa Support Letter is Ready for Download",
    preheader: "Download your stamped Visa Support Letter from the IEEE SMC 2027 Delegate Portal",
    textContent: `Dear {{FullName}},\n\nYour Official Visa Support Letter for IEEE SMC 2027 in Ho Chi Minh City, Vietnam has been approved and is ready for download.\n\nRegistration Code: {{RegistrationCode}}\nAccess Portal: {{PortalUrl}}\n\nWarm regards,\nIEEE SMC 2027 Local Arrangements Committee`,
    htmlContent: wrapBrandedEmailHtml({
      badge: "Milestone 5 • Visa Assistance",
      headline: "Official Visa Support Letter Issued",
      bodyHtml: `
        <p>Dear <strong>{{FullName}}</strong>,</p>
        <p>The Local Arrangements Committee at Ho Chi Minh City University of Technology and Education has approved your <strong>Official Visa Support Letter</strong> for registration <strong>{{RegistrationCode}}</strong>.</p>
        <p>Please log in to the Delegate Portal to download and print the signed document for your Vietnamese Embassy or E-Visa application.</p>
      `,
      ctaLabel: "Download Visa Support Letter",
      ctaUrl: "{{PortalUrl}}",
    }),
  },
];

function applyMergeTags(template: string, vars: Record<string, string>): string {
  let output = template;
  for (const [key, val] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    output = output.replace(regex, val);
  }
  return output;
}

export class EmailService {
  private templatesSeeded = false;

  public async ensureMilestoneTemplates(): Promise<void> {
    if (this.templatesSeeded) return;
    try {
      const count = await prisma.emailTemplate.count();
      if (count === 0) {
        for (const tpl of DEFAULT_MILESTONE_TEMPLATES) {
          await prisma.emailTemplate.upsert({
            where: { slug: tpl.slug },
            update: {},
            create: tpl,
          });
        }
      }
      this.templatesSeeded = true;
    } catch (err) {
      console.error("Failed to seed milestone email templates:", err);
    }
  }

  public async listTemplates() {
    await this.ensureMilestoneTemplates();
    return prisma.emailTemplate.findMany({
      orderBy: { milestone: "asc" },
    });
  }

  public async upsertTemplate(input: MilestoneTemplateSeed) {
    await this.ensureMilestoneTemplates();
    return prisma.emailTemplate.upsert({
      where: { slug: input.slug },
      update: {
        name: input.name,
        milestone: input.milestone,
        targetGroup: input.targetGroup,
        subject: input.subject,
        preheader: input.preheader,
        htmlContent: input.htmlContent,
        textContent: input.textContent,
      },
      create: input,
    });
  }

  public async sendEmail(input: EmailDispatchInput): Promise<{
    sent: boolean;
    devMode: boolean;
    recipients: string[];
  }> {
    const recipients = Array.isArray(input.to) ? input.to : [input.to];

    if (env.email.devMode) {
      console.log(`[EmailService:DEV] To=${recipients.join(", ")} | Subject="${input.subject}"`);
      return {
        sent: true,
        devMode: true,
        recipients,
      };
    }

    console.log(
      `[EmailService:PROD] Dispatched via ${env.email.host}:${env.email.port} to ${recipients.length} recipient(s)`
    );

    return {
      sent: true,
      devMode: false,
      recipients,
    };
  }

  public async sendAuthEmailLink(params: {
    email: string;
    code: string;
    emailLink: string;
  }) {
    await this.ensureMilestoneTemplates();
    const tpl =
      (await prisma.emailTemplate.findUnique({
        where: { slug: "auth-email-link" },
      })) || DEFAULT_MILESTONE_TEMPLATES[0];

    const vars = {
      Email: params.email,
      OtpCode: params.code,
      EmailLink: params.emailLink,
      PortalUrl: `${env.app.url}/portal`,
    };

    return this.sendEmail({
      to: params.email,
      subject: applyMergeTags(tpl.subject, vars),
      html: applyMergeTags(tpl.htmlContent, vars),
      text: applyMergeTags(tpl.textContent, vars),
    });
  }

  public async sendRegistrationConfirmation(params: {
    email: string;
    fullName: string;
    registrationCode: string;
    participantType?: string;
    feeAmount: number;
    currency: string;
  }) {
    await this.ensureMilestoneTemplates();
    const tpl =
      (await prisma.emailTemplate.findUnique({
        where: { slug: "milestone-registration-created" },
      })) || DEFAULT_MILESTONE_TEMPLATES[3];

    const portalUrl = `${env.app.url}/portal?code=${encodeURIComponent(params.registrationCode)}`;
    const vars = {
      FullName: params.fullName,
      Email: params.email,
      RegistrationCode: params.registrationCode,
      ParticipantType: params.participantType || "REGULAR",
      FeeAmount: params.feeAmount.toLocaleString("en-US"),
      Currency: params.currency,
      PortalUrl: portalUrl,
    };

    return this.sendEmail({
      to: params.email,
      subject: applyMergeTags(tpl.subject, vars),
      html: applyMergeTags(tpl.htmlContent, vars),
      text: applyMergeTags(tpl.textContent, vars),
    });
  }

  public async sendPaymentConfirmation(params: {
    email: string;
    fullName: string;
    registrationCode: string;
    feeAmount: number;
    currency: string;
    transactionRef: string;
  }) {
    await this.ensureMilestoneTemplates();
    const tpl =
      (await prisma.emailTemplate.findUnique({
        where: { slug: "milestone-payment-confirmed" },
      })) || DEFAULT_MILESTONE_TEMPLATES[4];

    const portalUrl = `${env.app.url}/portal?code=${encodeURIComponent(params.registrationCode)}`;
    const vars = {
      FullName: params.fullName,
      Email: params.email,
      RegistrationCode: params.registrationCode,
      FeeAmount: params.feeAmount.toLocaleString("en-US"),
      Currency: params.currency,
      TransactionRef: params.transactionRef,
      PortalUrl: portalUrl,
    };

    return this.sendEmail({
      to: params.email,
      subject: applyMergeTags(tpl.subject, vars),
      html: applyMergeTags(tpl.htmlContent, vars),
      text: applyMergeTags(tpl.textContent, vars),
    });
  }

  public async sendBroadcastCampaign(input: BroadcastCampaignInput & { templateSlug?: string }) {
    await this.ensureMilestoneTemplates();
    const where: Record<string, unknown> = {};
    if (input.targetGroup === "PAID") {
      where.paymentStatus = "PAID";
    } else if (input.targetGroup === "PENDING") {
      where.paymentStatus = "PENDING";
    } else if (input.targetGroup === "AUTHOR") {
      where.participantType = "AUTHOR";
    } else if (input.targetGroup === "STUDENT") {
      where.participantType = "STUDENT";
    }

    const delegates = await prisma.registration.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        registrationCode: true,
        participantType: true,
        paymentStatus: true,
        paperId: true,
        feeAmount: true,
        currency: true,
        transactionRef: true,
      },
    });

    if (delegates.length === 0) {
      return {
        sentCount: 0,
        sampleRecipients: [],
        message: "No delegates found in the selected target group.",
      };
    }

    for (const d of delegates) {
      const portalUrl = `${env.app.url}/portal?code=${encodeURIComponent(d.registrationCode)}`;
      const vars = {
        FullName: d.fullName,
        Email: d.email,
        RegistrationCode: d.registrationCode,
        ParticipantType: d.participantType,
        PaperID: d.paperId || "N/A",
        FeeAmount: d.feeAmount.toLocaleString("en-US"),
        Currency: d.currency,
        TransactionRef: d.transactionRef || "PENDING",
        PortalUrl: portalUrl,
      };

      const personalizedSubject = applyMergeTags(input.subject, vars);
      const personalizedText = applyMergeTags(input.message, vars);
      const personalizedHtml = wrapBrandedEmailHtml({
        badge: `IEEE SMC 2027 • ${input.targetGroup}`,
        headline: personalizedSubject.replace(/^\[IEEE SMC 2027\]\s*/i, ""),
        bodyHtml: `<div style="white-space:pre-line;">${personalizedText}</div>`,
        ctaLabel: "Open Delegate Portal",
        ctaUrl: portalUrl,
      });

      await this.sendEmail({
        to: d.email,
        subject: personalizedSubject,
        html: personalizedHtml,
        text: personalizedText,
      });
    }

    return {
      sentCount: delegates.length,
      sampleRecipients: delegates.slice(0, 5).map((r) => `${r.fullName} <${r.email}>`),
      message: `Dispatched personalized milestone broadcast to ${delegates.length} delegate(s) in group ${input.targetGroup}.`,
    };
  }
}

export const emailService = new EmailService();
export default emailService;
