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
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";

  // Password path enforces demo credentials; email-only remains for internal demo tooling.
  if (password) {
    const { authenticateDemoCredential } = await import(
      "@/lib/jointhub/demo-credentials"
    );
    const demo = authenticateDemoCredential(email, password);
    if (!demo) {
      return NextResponse.json(
        {
          error:
            "Invalid email or password. Use the Leader, Mentor, or Admin demo credentials.",
        },
        { status: 401 },
      );
    }
  }

  const user = findAuthUser(email);
  if (!user) {
    return NextResponse.json(
      {
        error:
          "Unknown demo account. Use leader1@jointhub.demo, mentor1@jointhub.demo, or admin@jointhub.demo.",
      },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    user: {
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      student_id: user.student_id ?? null,
      mentor_id: user.mentor_id ?? null,
    },
  });
  response.cookies.set(JOINTHUB_AUTH_COOKIE, user.email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
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
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
