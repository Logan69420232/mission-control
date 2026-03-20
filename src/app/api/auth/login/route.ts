import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const VALID_EMAIL = "logan@nfsupplements.co.uk";
const VALID_PASSWORD = "Logan123";
const SESSION_TOKEN = "mc_secret_token_nfs_2026";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("mc_session", SESSION_TOKEN, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return NextResponse.json({ ok: true });
}
