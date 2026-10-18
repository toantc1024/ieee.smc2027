import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  prisma,
  getGoogleOAuthConfig,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";

export async function GET() {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const { clientId, clientSecret, appUrl } = await getGoogleOAuthConfig();

    const hasSecret = Boolean(clientSecret && clientSecret.length > 0);
    const maskedSecret = hasSecret
      ? `${clientSecret.substring(0, 6)}••••••••••••••••••••${clientSecret.slice(-4)}`
      : "";

    return NextResponse.json({
      clientId,
      hasSecret,
      maskedSecret,
      appUrl,
      isConfigured: Boolean(clientId && hasSecret),
    });
  } catch (error) {
    console.error("Failed to fetch OAuth settings:", error);
    return apiError(error, 500, "Failed to fetch OAuth settings");
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { clientId, clientSecret, appUrl } = body;

    const current = await getGoogleOAuthConfig();

    const finalClientSecret =
      clientSecret && clientSecret.trim().length > 0
        ? clientSecret.trim()
        : current.clientSecret;

    const finalClientId = (clientId || current.clientId).trim();
    const finalAppUrl = (appUrl || current.appUrl).trim();

    await prisma.setting.upsert({
      where: { key: "oauth_google" },
      update: {
        data: {
          clientId: finalClientId,
          clientSecret: finalClientSecret,
          appUrl: finalAppUrl,
        },
      },
      create: {
        key: "oauth_google",
        data: {
          clientId: finalClientId,
          clientSecret: finalClientSecret,
          appUrl: finalAppUrl,
        },
      },
    });

    try {
      const envPath = path.join(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, "utf-8");

        const updateEnvVar = (name: string, value: string) => {
          const regex = new RegExp(`^${name}=.*$`, "m");
          if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${name}="${value}"`);
          } else {
            envContent += `\n${name}="${value}"`;
          }
        };

        if (finalClientId) updateEnvVar("GOOGLE_CLIENT_ID", finalClientId);
        if (finalClientSecret) updateEnvVar("GOOGLE_CLIENT_SECRET", finalClientSecret);
        if (finalAppUrl) updateEnvVar("NEXT_PUBLIC_APP_URL", finalAppUrl);

        fs.writeFileSync(envPath, envContent, "utf-8");
      }
    } catch (envErr) {
      console.warn("Could not write to .env file:", envErr);
    }

    return apiSuccess({
      isConfigured: Boolean(finalClientId && finalClientSecret),
    });
  } catch (error) {
    console.error("Failed to save OAuth settings:", error);
    return apiError(error, 500, "Failed to save OAuth settings");
  }
}
