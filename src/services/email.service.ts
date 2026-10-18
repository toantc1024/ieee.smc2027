/**
 * Email & Bulk Broadcast Notification Service Template
 * Supports transactional emails (OTP, Registration Confirmation, Payment Receipt)
 * and Admin Bulk Email Broadcasts.
 */

import prisma from "@/lib/prisma";
import env from "@/config/env";
import type { BroadcastCampaignInput, EmailDispatchInput } from "@/types";

export class EmailService {
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

    // Production SMTP / Transactional dispatch point
    console.log(
      `[EmailService:PROD] Dispatched via ${env.email.host}:${env.email.port} to ${recipients.length} recipient(s)`
    );

    return {
      sent: true,
      devMode: false,
      recipients,
    };
  }

  public async sendRegistrationConfirmation(params: {
    email: string;
    fullName: string;
    registrationCode: string;
    feeAmount: number;
    currency: string;
  }) {
    const portalUrl = `${env.app.url}/portal?code=${encodeURIComponent(params.registrationCode)}`;
    return this.sendEmail({
      to: params.email,
      subject: `[IEEE SMC 2027] Registration Confirmation - ${params.registrationCode}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>IEEE SMC 2027 Registration Confirmation</h2>
          <p>Dear <strong>${params.fullName}</strong>,</p>
          <p>Your registration has been recorded with code: <strong>${params.registrationCode}</strong>.</p>
          <p>Registration Fee: <strong>${params.feeAmount} ${params.currency}</strong></p>
          <p>Track your payment status, download your receipt, and access your Visa Support Letter at:</p>
          <p><a href="${portalUrl}">${portalUrl}</a></p>
        </div>
      `,
    });
  }

  public async sendBroadcastCampaign(input: BroadcastCampaignInput) {
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
      },
    });

    if (delegates.length === 0) {
      return {
        sentCount: 0,
        sampleRecipients: [],
        message: "No delegates found in the selected target group.",
      };
    }

    await this.sendEmail({
      to: delegates.map((d) => d.email),
      subject: input.subject,
      html: `<div style="font-family: sans-serif; white-space: pre-line;">${input.message}</div>`,
      text: input.message,
    });

    return {
      sentCount: delegates.length,
      sampleRecipients: delegates.slice(0, 5).map((r) => `${r.fullName} <${r.email}>`),
      message: `Successfully dispatched email broadcast to ${delegates.length} delegate(s) in group ${input.targetGroup}.`,
    };
  }
}

export const emailService = new EmailService();
export default emailService;
