import { NextResponse } from "next/server";
import { JOINTHUB_AUTH_COOKIE } from "@/lib/jointhub/auth";
import { findAuthUser, getAuthUsers } from "@/lib/jointhub/data-store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    accounts: getAuthUsers().map((user) => ({
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    })),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const user = findAuthUser(email);
  if (!user) {
    return NextResponse.json(
      {
        error:
          "Unknown demo account. Use leader1@jointhub.demo, leader2@jointhub.demo, or admin@jointhub.demo.",
      },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ user });
  response.cookies.set(JOINTHUB_AUTH_COOKIE, user.email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(JOINTHUB_AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
