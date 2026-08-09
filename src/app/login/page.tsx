"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useMemo, useState } from "react";
import {
  DEMO_CREDENTIALS,
  defaultEmailForRole,
  type DemoRole,
} from "@/lib/jointhub/demo-credentials";
import { type LoginState, signInWithDemoPassword } from "./actions";

const initialState: LoginState = { error: null };

function roleFromParam(value: string | null): DemoRole | null {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "mentor" || normalized === "admin" || normalized === "leader") {
    return normalized;
  }
  if (normalized === "student") return "leader";
  return null;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const requestedRole = roleFromParam(searchParams.get("role"));
  const [state, formAction, isPending] = useActionState(
    signInWithDemoPassword,
    initialState,
  );
  const [email, setEmail] = useState(() => defaultEmailForRole(requestedRole));
  const [password, setPassword] = useState("");

  const intro = useMemo(() => {
    if (requestedRole === "mentor") {
      return "Join as Mentor — sign in to open your ESL caseload and mentee guidance tools.";
    }
    if (requestedRole === "admin") {
      return "Admin access — full cohort dropout risk and platform analytics.";
    }
    if (requestedRole === "leader") {
      return "Join as Leader — open your scholar workspace, opportunities, and AI Coach Kay.";
    }
    return "Sign in with your demo role credentials for a personalised Mentor Hub dashboard.";
  }, [requestedRole]);

  return (
    <main className="min-h-screen bg-[#FBF7F0] text-[#0F3D2E]">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
        <div className="rounded-3xl border border-[rgba(15,61,46,0.12)] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/simplejoint-puzzle-logo.png"
              alt="SimpleJoint Trust"
              className="h-12 w-12 rounded-xl bg-black object-contain p-1"
              width={48}
              height={48}
            />
            <div>
              <p className="text-sm font-semibold tracking-tight text-[#0F3D2E]">
                SimpleJoint Trust
              </p>
              <p className="text-xs text-[rgba(15,61,46,0.6)]">
                JointHub Africa · role-based access
              </p>
            </div>
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm leading-relaxed text-[rgba(15,61,46,0.72)]">{intro}</p>

          <form action={formAction} className="mt-6 space-y-4">
            <label className="block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-[rgba(15,61,46,0.16)] px-3 py-2.5 text-sm outline-none focus:border-[#0F3D2E]"
              placeholder="leader1@jointhub.demo"
            />

            <label className="block text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[rgba(15,61,46,0.16)] px-3 py-2.5 text-sm outline-none focus:border-[#0F3D2E]"
              placeholder="Enter demo password"
            />

            {state.error ? (
              <p
                className="rounded-lg bg-[#E0312E]/10 px-3 py-2 text-sm text-[#E0312E]"
                role="alert"
              >
                {state.error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full bg-[#0F3D2E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0A2A20] disabled:opacity-60"
            >
              {isPending ? "Signing in…" : "Enter dashboard"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-[rgba(15,61,46,0.10)] bg-[#FBF7F0] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E07020]">
              Demo roles
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[rgba(15,61,46,0.78)]">
              {DEMO_CREDENTIALS.map((account) => (
                <li key={account.email}>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-transparent px-2 py-2 text-left transition hover:border-[rgba(15,61,46,0.12)] hover:bg-white"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                    }}
                  >
                    <span className="font-semibold text-[#0F3D2E]">{account.label}</span>
                    <span className="mt-0.5 block text-xs text-[rgba(15,61,46,0.62)]">
                      {account.email} · {account.dashboardHint}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-[rgba(15,61,46,0.55)]">
              Tap a role to fill credentials, then sign in. Access is personalised by role after
              login.
            </p>
          </div>

          <p className="mt-5 text-center text-sm text-[rgba(15,61,46,0.65)]">
            <Link href="/" className="font-medium text-[#0F3D2E] underline-offset-2 hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#FBF7F0] text-sm text-[#0F3D2E]">
          Loading sign-in…
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
