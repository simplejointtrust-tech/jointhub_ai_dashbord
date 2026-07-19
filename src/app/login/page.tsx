"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_NEXT_PATH = "/";
const MIN_PASSWORD_LENGTH = 6;

type AuthMode = "sign-in" | "sign-up";

function getSafeNextPath(): string {
  if (typeof window === "undefined") {
    return DEFAULT_NEXT_PATH;
  }

  const rawNextPath = new URLSearchParams(window.location.search).get("next");
  if (!rawNextPath) {
    return DEFAULT_NEXT_PATH;
  }

  try {
    const candidateUrl = new URL(rawNextPath, window.location.origin);
    if (candidateUrl.origin !== window.location.origin) {
      return DEFAULT_NEXT_PATH;
    }

    return `${candidateUrl.pathname}${candidateUrl.search}${candidateUrl.hash}`;
  } catch {
    return DEFAULT_NEXT_PATH;
  }
}

function getEmailRedirectTo(nextPath: string): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const callbackUrl = new URL("/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("next", nextPath);
  return callbackUrl.toString();
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("NEXT_PUBLIC_SUPABASE")) {
      return "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before using auth.";
    }

    return error.message;
  }

  return "Authentication failed. Try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage("Enter an email and a password with at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const nextPath = getSafeNextPath();

      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          throw error;
        }

        router.replace(nextPath);
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: getEmailRedirectTo(nextPath),
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        router.replace(nextPath);
        router.refresh();
        return;
      }

      setStatusMessage("Check your email to finish account setup.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitLabel = mode === "sign-in" ? "Sign in" : "Create account";

  return (
    <main className="relative min-h-screen">
      <div className="border-b border-[var(--color-rule)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-8 py-3.5 text-[10px] uppercase tracking-[0.32em] text-[var(--color-ink-50)] md:px-12 lg:px-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-[var(--color-ink-80)] transition-colors hover:text-[var(--color-ink)]"
          >
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rotate-45 bg-[var(--color-caret)]"
            />
            <span>Cofounder</span>
          </Link>
          <span className="inline-flex items-center gap-3">
            <span className="hidden sm:inline">Product auth</span>
            <ThemeToggle />
          </span>
        </div>
      </div>

      <section className="mx-auto grid max-w-6xl gap-x-12 gap-y-14 px-8 pt-16 pb-24 md:grid-cols-12 md:px-12 md:pt-24 md:pb-32 lg:px-16">
        <div className="co-rise md:col-span-6" style={{ animationDelay: "60ms" }}>
          <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--color-ink-40)]">
            Supabase / Email and password
          </p>
          <h1 className="mt-10 font-display text-[clamp(2.5rem,6vw,5rem)] font-normal leading-[1] tracking-normal text-[var(--color-ink)]">
            Sign in.
          </h1>
          <p className="mt-6 max-w-md text-balance text-[15px] leading-7 text-[var(--color-ink-70)]">
            Use the account attached to this product. New teammates can create one here when signup
            is enabled in Supabase.
          </p>
          <div className="mt-12 border-y border-[var(--color-rule)] py-5">
            <dl className="grid gap-4 text-[12px] text-[var(--color-ink-70)] sm:grid-cols-2">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-40)]">
                  Method
                </dt>
                <dd className="mt-1 text-[var(--color-ink-90)]">Password</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-40)]">
                  Session
                </dt>
                <dd className="mt-1 text-[var(--color-ink-90)]">Supabase SSR</dd>
              </div>
            </dl>
          </div>
        </div>

        <div
          className="co-rise md:col-span-6 md:border-l md:border-[var(--color-rule)] md:pl-10 lg:pl-14"
          style={{ animationDelay: "160ms" }}
        >
          <div className="max-w-md">
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="grid grid-cols-2 border border-[var(--color-rule)] bg-[var(--color-paper)] p-1"
            >
              {(["sign-in", "sign-up"] as const).map((authMode) => (
                <button
                  key={authMode}
                  type="button"
                  role="tab"
                  aria-selected={mode === authMode}
                  onClick={() => {
                    setMode(authMode);
                    setStatusMessage(null);
                    setErrorMessage(null);
                  }}
                  className="px-4 py-2.5 text-[10px] uppercase tracking-[0.24em] text-[var(--color-ink-60)] transition-colors hover:text-[var(--color-ink)] aria-selected:bg-[var(--color-ink)] aria-selected:text-[var(--color-bg)]"
                >
                  {authMode === "sign-in" ? "Sign in" : "Sign up"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-50)]">
                  Email
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full border border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-3 text-[15px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-40)] focus:border-[var(--color-ink-40)] focus:bg-[var(--color-paper-raised)]"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-50)]">
                  Password
                </span>
                <input
                  type="password"
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full border border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-3 text-[15px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-40)] focus:border-[var(--color-ink-40)] focus:bg-[var(--color-paper-raised)]"
                  placeholder="password"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex w-full items-center justify-center gap-3 border border-[var(--color-ink)] bg-[var(--color-ink)] px-5 py-3.5 text-[11px] uppercase tracking-[0.24em] text-[var(--color-bg)] transition-colors hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{isSubmitting ? "Working" : submitLabel}</span>
                {isSubmitting ? (
                  <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>

              <div aria-live="polite" className="min-h-6 text-[13px] leading-6">
                {statusMessage ? (
                  <p className="text-[var(--color-ink-70)]">{statusMessage}</p>
                ) : null}
                {errorMessage ? (
                  <p className="text-red-600 dark:text-red-300">{errorMessage}</p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
