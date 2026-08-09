"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { JOINTHUB_AUTH_COOKIE } from "@/lib/jointhub/auth";
import { findAuthUser } from "@/lib/jointhub/data-store";

const DEMO_EMAILS = new Set([
  "leader1@jointhub.demo",
  "leader2@jointhub.demo",
  "mentor1@jointhub.demo",
  "admin@jointhub.demo",
]);

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

  if (!email || !DEMO_EMAILS.has(email)) {
    return {
      error:
        "Unknown demo account. Choose Leader, Mentor, or Admin from the list.",
    };
  }

  const user = findAuthUser(email);
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
