import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  prisma,
  requireAdminRequest,
  apiSuccess,
  apiError,
  revalidatePagePaths,
} from "@/lib";
import { DEFAULT_FOOTER_CONFIG, normalizeFooterHref } from "@/lib/footer-config";

const FOOTER_SETTING_KEY = "footer";

function sanitizeFooterPayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_FOOTER_CONFIG };
  }
  const src = raw as Record<string, unknown>;
  const linkGroups = Array.isArray(src.linkGroups)
    ? src.linkGroups.map((group) => {
        if (!group || typeof group !== "object") return group;
        const g = group as Record<string, unknown>;
        return {
          ...g,
          links: Array.isArray(g.links)
            ? g.links.map((link) => {
                if (!link || typeof link !== "object") return link;
                const l = link as Record<string, unknown>;
                return {
                  ...l,
                  href:
                    typeof l.href === "string"
                      ? normalizeFooterHref(l.href)
                      : l.href,
                };
              })
            : [],
        };
      })
    : DEFAULT_FOOTER_CONFIG.linkGroups;

  return {
    ...DEFAULT_FOOTER_CONFIG,
    ...src,
    linkGroups,
  };
}

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: FOOTER_SETTING_KEY },
    });
    const footer = sanitizeFooterPayload(setting?.data);
    return NextResponse.json({ success: true, footer });
  } catch (error) {
    console.error("Error loading footer setting:", error);
    return NextResponse.json({
      success: true,
      footer: DEFAULT_FOOTER_CONFIG,
    });
  }
}

export async function PUT(request: Request) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return apiError("Invalid footer configuration payload.", 400);
    }

    const payload = sanitizeFooterPayload(
      "footer" in body && body.footer && typeof body.footer === "object"
        ? body.footer
        : body
    );

    await prisma.setting.upsert({
      where: { key: FOOTER_SETTING_KEY },
      update: { data: payload as unknown as Prisma.InputJsonValue },
      create: {
        key: FOOTER_SETTING_KEY,
        data: payload as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePagePaths("home");
    return apiSuccess({ footer: payload });
  } catch (error) {
    return apiError(error, 500);
  }
}

