import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const IMPACT = [
  { label: "Scholarships & grants", value: "$158,000+" },
  { label: "Students supported", value: "85+" },
  { label: "Countries reached", value: "6+" },
];

const MODULES = [
  {
    title: "Opportunity engine",
    body: "Content-based cosine similarity ranks verified scholarships, fellowships, and programmes against each scholar profile.",
  },
  {
    title: "Mentor Hub",
    body: "Cosine compatibility plus the Hungarian algorithm assigns mentors globally and surfaces top alternatives per student.",
  },
  {
    title: "Dropout risk",
    body: "Logistic regression flags scholars who need outreach; Random Forest explains the top contributing factor.",
  },
  {
    title: "NLP goals",
    body: "Entity extraction and semantic matching turn free-text career goals into personalised recommendation sentences.",
  },
];

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
              href="/dashboard/login"
              className="rounded-full bg-[#F4B942] px-4 py-2 text-sm font-semibold text-[#0D1B2A] hover:bg-[#e0a836]"
            >
              Open Capstone dashboard
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#028090]">
          Capstone II · ALU EMBA 2026 · Data Science & AI
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          JointHub Africa AI modules, live for scholars and mentors.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#0D1B2A]/75">
          Built for SimpleJoint Trust with ALU. The Capstone dashboard runs four integrated modules
          on sample cohort data so Isaiah can demo matching quality, risk outreach, and NLP goal
          analysis before the 30 August 2026 submission.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard/login"
            className="rounded-full bg-[#028090] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#026f7d]"
          >
            Enter dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-[#0D1B2A]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#0D1B2A] hover:border-[#028090]/40"
          >
            Supabase auth scaffold
          </Link>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {IMPACT.map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#0D1B2A]/10 bg-white p-5">
              <p className="text-2xl font-semibold tabular-nums text-[#0D1B2A]">{item.value}</p>
              <p className="mt-1 text-sm text-[#0D1B2A]/65">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#0D1B2A]/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-12 sm:grid-cols-2">
          {MODULES.map((module) => (
            <article key={module.title} className="rounded-2xl border border-[#0D1B2A]/10 p-5">
              <h2 className="text-lg font-semibold text-[#0D1B2A]">{module.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#0D1B2A]/70">{module.body}</p>
            </article>
          ))}
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
            for risk outreach and analytics KPIs.
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
