import { NextRequest, NextResponse } from "next/server";
import { upsertUser, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/admin/login?error=${encodeURIComponent(error || "wechat_access_denied")}`, origin)
    );
  }

  try {
    let email = "admin@hcmute.edu.vn";
    let name = "WeChat Admin (IEEE SMC 2027)";
    let avatar: string | null = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

    const devMode = process.env.WECHAT_DEV_MODE === "true";
    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;

    if (!devMode && appId && appSecret && code !== "mock_wechat_dev_code") {
      // Production WeChat Open Platform API Exchange
      const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`;
      const tokenRes = await fetch(tokenUrl);
      const tokenData = await tokenRes.json();

      if (tokenData.errcode) {
        throw new Error(`WeChat Token Error: ${tokenData.errmsg || tokenData.errcode}`);
      }

      const { access_token, openid } = tokenData;

      // Fetch user profile from WeChat
      const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`;
      const userInfoRes = await fetch(userInfoUrl);
      const userInfo = await userInfoRes.json();

      email = `${openid}@wechat.ieee-smc2027.org`;
      name = userInfo.nickname || "WeChat User";
      avatar = userInfo.headimgurl || null;
    }

    // Upsert into Neon DB
    const dbUser = await upsertUser({
      id: `wechat_${Date.now()}`,
      email,
      name,
      avatar,
      provider: "wechat",
      role: "ADMIN",
    });

    const token = await createSessionToken(dbUser);

    const response = NextResponse.redirect(new URL("/admin", origin));
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    console.error("WeChat Callback Error:", err);
    const msg = err instanceof Error ? err.message : "wechat_auth_failed";
    return NextResponse.redirect(
      new URL(`/admin/login?error=${encodeURIComponent(msg)}`, origin)
    );
  }
}
