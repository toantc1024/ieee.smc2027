import {
  createSessionToken,
  upsertUser,
  attachSessionCookie,
  apiSuccess,
  apiError,
} from "@/lib";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email || "tctoan1024@gmail.com";
    const name = body.name || "Toan Tran";

    const dbUser = await upsertUser({
      id: `dev_${email}`,
      email,
      name,
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=tctoan",
      role: "ADMIN",
      provider: "dev_mock",
    });

    const sessionToken = await createSessionToken(dbUser);
    const response = apiSuccess({ user: dbUser });
    return attachSessionCookie(response, sessionToken);
  } catch (error: unknown) {
    return apiError(error, 500);
  }
}
