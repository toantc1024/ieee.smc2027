/**
 * Badge QR Code & Hall Check-In Service Template (Fullstack Prisma)
 */

import prisma from "@/lib/prisma";
import { generateQrDataUrl } from "@/lib/conference-registration";
import { normalizeRegistrationCode, formatTimeVi } from "@/lib/utils";

export class CheckInService {
  public async generateBadgeQr(registration: {
    registrationCode: string;
    fullName: string;
    participantType: string;
    affiliation: string;
  }): Promise<string> {
    return generateQrDataUrl(
      JSON.stringify({
        code: registration.registrationCode,
        name: registration.fullName,
        type: registration.participantType,
        org: registration.affiliation,
      })
    );
  }

  public parseScannedPayload(rawCode: string): string {
    const trimmed = rawCode.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed) as { code?: string };
        if (parsed.code) return normalizeRegistrationCode(String(parsed.code));
      } catch {
        // treat as raw code string
      }
    }
    return normalizeRegistrationCode(trimmed);
  }

  public async verifyAndCheckIn(rawCode: string) {
    const registrationCode = this.parseScannedPayload(rawCode);
    const reg = await prisma.registration.findUnique({
      where: { registrationCode },
    });

    if (!reg) {
      return {
        found: false,
        registrationCode,
        error: `No delegate found with registration code "${registrationCode}".`,
      };
    }

    const alreadyCheckedIn = reg.checkInStatus;
    const updated = await prisma.registration.update({
      where: { id: reg.id },
      data: {
        checkInStatus: true,
        checkedInAt: reg.checkedInAt || new Date(),
      },
    });

    return {
      found: true,
      alreadyCheckedIn,
      registration: updated,
      message: alreadyCheckedIn
        ? `Delegate ${updated.fullName} was already checked in at ${formatTimeVi(updated.checkedInAt)}.`
        : `Successfully checked in delegate ${updated.fullName}!`,
    };
  }
}

export const checkInService = new CheckInService();
export default checkInService;
