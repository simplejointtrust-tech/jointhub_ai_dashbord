"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { JOINTHUB_AUTH_COOKIE } from "@/lib/jointhub/auth";
import { authenticateDemoCredential } from "@/lib/jointhub/demo-credentials";
import { findAuthUser } from "@/lib/jointhub/data-store";

export type LoginState = {
  error: string | null;
};

export async function signInWithDemoPassword(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter both email and password." };
  }

  const demo = authenticateDemoCredential(email, password);
  if (!demo) {
    return {
      error:
        "Invalid email or password. Use the Leader, Mentor, or Admin demo credentials.",
    };
  }

  const user = findAuthUser(demo.email);
  if (!user) {
    return {
      error:
        "Demo account data is missing. Refresh and try again, or contact support if it continues.",
    };
  }

  const jar = await cookies();
  jar.set(JOINTHUB_AUTH_COOKIE, user.email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  // Role-based dashboards share /dashboard; personalisation is resolved from the session role.
  redirect("/dashboard");
}
