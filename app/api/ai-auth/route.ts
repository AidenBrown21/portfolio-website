import { NextResponse } from "next/server";

type AuthRequestBody = {
  password?: unknown;
};

export async function POST(request: Request) {
  const expectedPassword = process.env.AI_APP_ACCESS_PASSWORD?.trim();
  if (!expectedPassword) {
    return NextResponse.json(
      { ok: false, message: "AI app password is not configured on the server." },
      { status: 503 },
    );
  }

  let body: AuthRequestBody;
  try {
    body = (await request.json()) as AuthRequestBody;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password.trim() : "";
  if (!password) {
    return NextResponse.json({ ok: false, message: "Password is required." }, { status: 400 });
  }

  if (password !== expectedPassword) {
    return NextResponse.json({ ok: false, message: "Incorrect password." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
