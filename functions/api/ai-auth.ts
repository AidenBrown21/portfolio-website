type Env = {
  AI_APP_ACCESS_PASSWORD?: string;
};

type AuthRequestBody = {
  password?: unknown;
};

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const expectedPassword = context.env.AI_APP_ACCESS_PASSWORD;
  if (!expectedPassword) {
    return Response.json(
      { ok: false, message: "AI app password is not configured on the server." },
      { status: 503 },
    );
  }

  let body: AuthRequestBody;
  try {
    body = (await context.request.json()) as AuthRequestBody;
  } catch {
    return Response.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password.trim() : "";
  if (!password) {
    return Response.json({ ok: false, message: "Password is required." }, { status: 400 });
  }

  if (password !== expectedPassword) {
    return Response.json({ ok: false, message: "Incorrect password." }, { status: 401 });
  }

  return Response.json({ ok: true });
}
