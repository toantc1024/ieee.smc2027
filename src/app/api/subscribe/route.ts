import { Prisma } from "@prisma/client";
import { prisma, requireAdminRequest, apiSuccess, apiError } from "@/lib";

const CFP_SUBSCRIBERS_KEY = "cfp_subscribers";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscriberRecord {
  email: string;
  subscribedAt: string;
  source?: string;
}

function readSubscriberList(raw: unknown): SubscriberRecord[] {
  if (Array.isArray(raw)) {
    return raw.filter(
      (item): item is SubscriberRecord =>
        Boolean(item && typeof item === "object" && typeof (item as SubscriberRecord).email === "string")
    );
  }
  if (raw && typeof raw === "object" && Array.isArray((raw as { subscribers?: unknown }).subscribers)) {
    return ((raw as { subscribers: unknown[] }).subscribers).filter(
      (item): item is SubscriberRecord =>
        Boolean(item && typeof item === "object" && typeof (item as SubscriberRecord).email === "string")
    );
  }
  return [];
}

export async function GET() {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const setting = await prisma.setting.findUnique({
      where: { key: CFP_SUBSCRIBERS_KEY },
    });
    const subscribers = readSubscriberList(setting?.data);
    return apiSuccess({ subscribers, total: subscribers.length });
  } catch (error) {
    return apiError(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawEmail = typeof body?.email === "string" ? body.email.trim() : "";
    const normalizedEmail = rawEmail.toLowerCase();
    const source = typeof body?.source === "string" && body.source.trim()
      ? body.source.trim().slice(0, 64)
      : "cfp_banner";

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return apiError("Please enter a valid email address.", 400);
    }

    const existingSetting = await prisma.setting.findUnique({
      where: { key: CFP_SUBSCRIBERS_KEY },
    });
    const current = readSubscriberList(existingSetting?.data);
    const alreadySubscribed = current.some(
      (entry) => entry.email.toLowerCase() === normalizedEmail
    );

    if (!alreadySubscribed) {
      const updatedList: SubscriberRecord[] = [
        ...current,
        {
          email: normalizedEmail,
          subscribedAt: new Date().toISOString(),
          source,
        },
      ];

      await prisma.setting.upsert({
        where: { key: CFP_SUBSCRIBERS_KEY },
        update: {
          data: { subscribers: updatedList } as unknown as Prisma.InputJsonValue,
        },
        create: {
          key: CFP_SUBSCRIBERS_KEY,
          data: { subscribers: updatedList } as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return apiSuccess(
      {
        subscribed: true,
        alreadySubscribed,
        email: normalizedEmail,
      },
      alreadySubscribed ? 200 : 201
    );
  } catch (error) {
    console.error("Failed to persist CFP subscription:", error);
    return apiError(error, 500);
  }
}
