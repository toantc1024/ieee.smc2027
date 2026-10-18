import { NextRequest } from "next/server";
import {
  getUserPasswordHash,
  verifyPassword,
  upsertUser,
  createSessionToken,
  normalizeEmail,
  attachSessionCookie,
  apiSuccess,
  apiError,
} from "@/lib";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body?.email);
    const password = body?.password;

    if (!email || !password) {
      return apiError("Vui lòng nhập đầy đủ Email và Mật khẩu", 400);
    }

    const storedHash = await getUserPasswordHash(email);
    if (!storedHash) {
      return apiError("Tài khoản không tồn tại hoặc chưa được thiết lập mật khẩu", 401);
    }

    if (!verifyPassword(password, storedHash)) {
      return apiError("Mật khẩu không chính xác", 401);
    }

    const name = email.split("@")[0].toUpperCase();
    const user = await upsertUser({
      id: `pwd_${Date.now()}`,
      email,
      name: `Admin ${name}`,
      provider: "password",
      role: "ADMIN",
    });

    const token = await createSessionToken(user);
    const response = apiSuccess({
      message: "Đăng nhập mật khẩu thành công",
      user,
    });

    return attachSessionCookie(response, token);
  } catch (err) {
    console.error("Password login error:", err);
    return apiError(err, 500, "Lỗi xử lý đăng nhập mật khẩu");
  }
}
