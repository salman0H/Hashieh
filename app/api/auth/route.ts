import { NextResponse } from "next/server";
import {
  configured,
  same,
  issueSession,
  COOKIE,
  sameOrigin,
} from "@/app/lib/auth";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "درخواست نامعتبر است." },
      { status: 403 },
    );
  if (!configured())
    return NextResponse.json(
      { error: "ورود هنوز روی سرور تنظیم نشده است." },
      { status: 503 },
    );
  const form = await request.formData();
  const password = String(form.get("password") || "");
  if (password.length > 500 || !same(password, process.env.SITE_PASSWORD!))
    return NextResponse.json({ error: "رمز ورود درست نیست." }, { status: 401 });
  const result = NextResponse.json({ ok: true });
  result.cookies.set(COOKIE, issueSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 604800,
  });
  return result;
}
