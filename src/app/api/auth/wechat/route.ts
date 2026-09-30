import { NextRequest, NextResponse } from "next/server";
import { getWeChatAuthUrl } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const devMode = process.env.WECHAT_DEV_MODE === "true";
  const appId = process.env.WECHAT_APP_ID;
  const isDevOrTest = devMode || !appId || appId === "wx_smc2027_dev";

  // If in dev mode or mock mode, redirect directly to callback with a mock code
  if (isDevOrTest) {
    const devCallback = new URL("/api/auth/callback/wechat?code=mock_wechat_dev_code&state=dev", origin);
    return NextResponse.redirect(devCallback);
  }

  // Official WeChat Open Platform QR Connect
  const authUrl = getWeChatAuthUrl(origin);
  return NextResponse.redirect(authUrl);
}
