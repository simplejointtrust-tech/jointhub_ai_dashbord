"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const DEMO_ACCOUNTS = [
  { email: "leader1@jointhub.demo", label: "Leader 1 (student view)" },
  { email: "leader2@jointhub.demo", label: "Leader 2 (student view)" },
  { email: "admin@jointhub.demo", label: "Admin (full cohort)" },
];

export default function DashboardLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/jointhub/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Sign-in failed.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the demo auth endpoint.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F0E6] text-[#142033]">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
        <div className="rounded-3xl border border-[#142033]/10 bg-white p-6 shadow-sm sm:p-8">
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
              <p className="text-sm font-semibold tracking-tight text-[#142033]">
                SimpleJoint Trust
              </p>
              <p className="text-xs text-[#142033]/60">ESL Mentors · JointHub Africa</p>
            </div>
          </div>
          <h1 className="mt-5 text-2xl font-semibold">Mentor Hub sign-in</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#142033]/70">
            Demo gate for the scholar dashboard. Leaders open Overview, Opportunities, ESL Mentors,
            Applications, Community, and Kay the AI Coach. Admins also get cohort dropout risk and
            model analytics. Account signup stays at{" "}
            <Link
              href="/login"
              className="font-medium text-[#3A87B8] underline-offset-2 hover:underline"
            >
              /login
            </Link>
            .
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium" htmlFor="email">
              Demo account
            </label>
            <select
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-[#142033]/15 px-3 py-2.5 text-sm outline-none focus:border-[#3A87B8]"
            >
              {DEMO_ACCOUNTS.map((account) => (
                <option key={account.email} value={account.email}>
                  {account.label} — {account.email}
                </option>
              ))}
            </select>

            {error ? (
              <p
                className="rounded-lg bg-[#E0312E]/10 px-3 py-2 text-sm text-[#E0312E]"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[#3A87B8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F739E] disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : "Enter dashboard"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
