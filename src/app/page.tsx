import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const CANVA_PROTOTYPE_URL = "https://canva.link/tawbtl3fowjdafd";
const CANVA_EMBED_URL =
  "https://www.canva.com/design/DAHPdX_cD54/onR4VikDE4v8lmd7Hk-vtQ/view?embed";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F4F7F7] text-[#0D1B2A]">
      <div className="border-b border-[#0D1B2A]/10 bg-[#0D1B2A] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F4B942]">
              SimpleJoint Trust · JointHub Africa
            </p>
            <p className="text-sm text-white/70">Pan-African opportunity & mentorship platform</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#028090]">
          Mentor Hub · JointHub Africa
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Mentor Hub for ESL scholars and mentors.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#0D1B2A]/75">
          Join Mentor Hub to review opportunities, mentor matching, risk outreach, and analytics on
          the ESL cohort.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard/login"
            className="inline-flex rounded-full bg-[#F4B942] px-5 py-2.5 text-sm font-semibold text-[#0D1B2A] hover:bg-[#e0a836]"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="border-t border-[#0D1B2A]/10 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#028090]">
                Design reference
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#0D1B2A]/70">
                Live Canva design embedded in the app for review alongside the working Mentor Hub.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/prototype"
                className="rounded-full bg-[#0D1B2A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b2e44]"
              >
                Open full page
              </Link>
              <a
                href={CANVA_PROTOTYPE_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#0D1B2A]/15 px-4 py-2 text-sm font-semibold text-[#0D1B2A] hover:border-[#028090]/40"
              >
                Open in Canva
              </a>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-[#0D1B2A]/10 bg-[#F4F7F7] shadow-sm">
            <div className="relative w-full" style={{ paddingTop: "62.5%" }}>
              <iframe
                title="Mentor Hub design reference"
                src={CANVA_EMBED_URL}
                loading="lazy"
                allowFullScreen
                allow="fullscreen"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-[#0D1B2A]/55">Source: {CANVA_PROTOTYPE_URL}</p>
        </div>
      </section>
    </main>
  );
}
