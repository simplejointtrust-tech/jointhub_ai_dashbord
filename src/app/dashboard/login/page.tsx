"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const DEMO_ACCOUNTS = [
  { email: "scholar1@jointhub.demo", label: "Scholar 1 (student view)" },
  { email: "scholar2@jointhub.demo", label: "Scholar 2 (student view)" },
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
    <main className="min-h-screen bg-[#F4F7F7] text-[#0D1B2A]">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
        <div className="rounded-3xl border border-[#0D1B2A]/10 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#028090]">
            JointHub Africa
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Mentor Hub sign-in</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#0D1B2A]/70">
            Capstone demo gate for Mentor Hub. Scholars open Overview, Opportunities, Mentors,
            Applications, Community, and JointHub Advisor. Admins also get cohort dropout risk and
            model analytics. Production Supabase email/password remains at{" "}
            <Link
              href="/login"
              className="font-medium text-[#028090] underline-offset-2 hover:underline"
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
              className="w-full rounded-xl border border-[#0D1B2A]/15 px-3 py-2.5 text-sm outline-none focus:border-[#028090]"
            >
              {DEMO_ACCOUNTS.map((account) => (
                <option key={account.email} value={account.email}>
                  {account.label} — {account.email}
                </option>
              ))}
            </select>

            {error ? (
              <p
                className="rounded-lg bg-[#C0392B]/10 px-3 py-2 text-sm text-[#C0392B]"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[#028090] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#026f7d] disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : "Enter dashboard"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
