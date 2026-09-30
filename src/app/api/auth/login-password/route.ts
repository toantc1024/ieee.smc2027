import { NextRequest, NextResponse } from "next/server";
import {
  getUserPasswordHash,
  verifyPassword,
  upsertUser,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.toLowerCase()?.trim();
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Email và Mật khẩu" },
        { status: 400 }
      );
    }

    const storedHash = await getUserPasswordHash(email);

    if (!storedHash) {
      return NextResponse.json(
        { error: "Tài khoản không tồn tại hoặc chưa được thiết lập mật khẩu" },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, storedHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    const name = email.split("@")[0].toUpperCase();

    const user = await upsertUser({
      id: `pwd_${Date.now()}`,
      email,
      name: `Admin (${name})`,
      provider: "password",
      role: "ADMIN",
    });

    const token = await createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập mật khẩu thành công",
      user,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("Password login error:", err);
    return NextResponse.json(
      { error: "Lỗi xử lý đăng nhập mật khẩu" },
      { status: 500 }
    );
  }
}
