import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "oauth_google" },
    });

    const dbData = (setting?.data as Record<string, string>) || {};
    const envClientId = process.env.GOOGLE_CLIENT_ID || "";
    const envClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    const envAppUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const clientId = dbData.clientId || envClientId || "";
    const clientSecret = dbData.clientSecret || envClientSecret || "";
    const appUrl = dbData.appUrl || envAppUrl;

    const hasSecret = Boolean(clientSecret && clientSecret.trim().length > 0);
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
    return NextResponse.json(
      { error: "Failed to fetch OAuth settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { clientId, clientSecret, appUrl } = body;

    // Fetch existing setting to preserve existing secret if not re-provided
    const existing = await prisma.setting.findUnique({
      where: { key: "oauth_google" },
    });
    const existingData = (existing?.data as Record<string, string>) || {};

    const finalClientSecret =
      clientSecret && clientSecret.trim().length > 0
        ? clientSecret.trim()
        : existingData.clientSecret || process.env.GOOGLE_CLIENT_SECRET || "";

    const finalClientId = (clientId || existingData.clientId || "").trim();
    const finalAppUrl = (appUrl || existingData.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").trim();

    // 1. Save to Database
    await prisma.setting.upsert({
      where: { key: "oauth_google" },
      update: {
        data: {
          clientId: finalClientId,
          clientSecret: finalClientSecret,
          appUrl: finalAppUrl,
        },
        updatedAt: new Date(),
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

    // 2. Also sync to .env file if available
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

    return NextResponse.json({
      success: true,
      isConfigured: Boolean(finalClientId && finalClientSecret),
    });
  } catch (error) {
    console.error("Failed to save OAuth settings:", error);
    return NextResponse.json(
      { error: "Failed to save OAuth settings" },
      { status: 500 }
    );
  }
}
