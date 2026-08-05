/**
 * Lightweight demo auth for Capstone dashboard.
 * Cookie stores only the email; role is resolved from sample auth_users.json.
 * Production path should use Supabase email/password (already scaffolded at /login).
 */

import { cookies } from "next/headers";
import { findAuthUser } from "@/lib/jointhub/data-store";
import type { AuthUser } from "@/lib/jointhub/types";

export const JOINTHUB_AUTH_COOKIE = "jointhub_demo_email";

export async function getSessionUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const email = jar.get(JOINTHUB_AUTH_COOKIE)?.value;
  if (!email) {
    return null;
  }
  return findAuthUser(email) ?? null;
}

export function demoAccounts(): string[] {
  return [
    "leader1@jointhub.demo",
    "leader2@jointhub.demo",
    "mentor1@jointhub.demo",
    "admin@jointhub.demo",
  ];
}
