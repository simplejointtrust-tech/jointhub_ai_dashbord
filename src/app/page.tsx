import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const CANVA_PROTOTYPE_URL = "https://canva.link/tawbtl3fowjdafd";
const CANVA_EMBED_URL = "https://www.canva.com/design/DAHPdX_cD54/onR4VikDE4v8lmd7Hk-vtQ/view?embed";

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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/prototype"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Design prototype
            </Link>
            <Link
              href="/dashboard/login"
              className="rounded-full bg-[#F4B942] px-4 py-2 text-sm font-semibold text-[#0D1B2A] hover:bg-[#e0a836]"
            >
              Open Mentor Hub
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#028090]">
          Mentor Hub · JointHub Africa
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Mentor Hub for scholars and mentors.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#0D1B2A]/75">
          Built for SimpleJoint Trust with ALU. Open Mentor Hub to review opportunities,
          mentor matching, risk outreach, and analytics on the demo cohort.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard/login"
            className="rounded-full bg-[#028090] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#026f7d]"
          >
            Enter dashboard
          </Link>
          <Link
            href="/prototype"
            className="rounded-full border border-[#0D1B2A]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#0D1B2A] hover:border-[#028090]/40"
          >
            View Canva prototype
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-[#0D1B2A]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#0D1B2A] hover:border-[#028090]/40"
          >
            Supabase auth scaffold
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
              <h2 className="mt-2 text-2xl font-semibold text-[#0D1B2A]">Canva Mentor Hub prototype</h2>
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
                title="Mentor Hub Canva prototype"
                src={CANVA_EMBED_URL}
                loading="lazy"
                allowFullScreen
                allow="fullscreen"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-[#0D1B2A]/55">
            Source: {CANVA_PROTOTYPE_URL}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl bg-[#0D1B2A] px-6 py-8 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F4B942]">
            CreativeTech bootcamp
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Create With AI · 25–26 August 2026 · ALU Kigali
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Demo path: sign in as scholar1@jointhub.demo, review curated opportunities, open Mentor
            Hub for the assignment matrix and session booking, then switch to admin@jointhub.demo
            for risk outreach and analytics.
          </p>
          <p className="mt-4 text-xs text-white/50">
            Partners: British Council · ALX · Hood.D · A4 · JointHub Africa · ALU · @alueducation
            @millenniumfellows @UNAI
          </p>
        </div>
      </section>
    </main>
  );
}
