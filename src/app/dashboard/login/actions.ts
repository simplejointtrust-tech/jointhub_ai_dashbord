"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { JOINTHUB_AUTH_COOKIE } from "@/lib/jointhub/auth";
import {
  authenticateDemoCredential,
  findDemoCredential,
} from "@/lib/jointhub/demo-credentials";
import { findAuthUser } from "@/lib/jointhub/data-store";

export type DemoSignInState = {
  error: string | null;
};

export async function signInDemoAccount(
  _prevState: DemoSignInState,
  formData: FormData,
): Promise<DemoSignInState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  // Prefer explicit password auth when provided; fall back to known demo emails for the quick picker.
  let accountEmail = email;
  if (password) {
    const demo = authenticateDemoCredential(email, password);
    if (!demo) {
      return {
        error:
          "Invalid email or password. Use the Leader, Mentor, or Admin demo credentials.",
      };
    }
    accountEmail = demo.email;
  } else {
    const known = findDemoCredential(email);
    if (!known) {
      return {
        error:
          "Unknown demo account. Choose Leader, Mentor, or Admin, or enter email and password on /login.",
      };
    }
    accountEmail = known.email;
  }

  const user = findAuthUser(accountEmail);
  if (!user) {
    return {
      error:
        "Demo account data is missing. Refresh the page and try again, or contact support if it continues.",
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

  redirect("/dashboard");
}
