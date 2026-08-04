import {
  ArrowRight,
  BookOpen,
  Compass,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const IMPACT = [
  { label: "Scholarships & grants", value: "$158,000+" },
  { label: "Students supported", value: "85+" },
  { label: "Countries reached", value: "6+" },
];

const MODULES = [
  {
    title: "Opportunities, ranked for you",
    body: "Verified scholarships, fellowships, and programmes scored against your goals — not a generic feed.",
    icon: Compass,
  },
  {
    title: "Mentor match that explains itself",
    body: "See your assigned mentor, fit score, and why the match was made. Book a check-in in one step.",
    icon: Users,
  },
  {
    title: "JointHub Advisor",
    body: "Ask eligibility, deadline, and next-step questions grounded in your profile and Capstone AI outputs.",
    icon: MessageSquareText,
  },
  {
    title: "Stay on track",
    body: "Applications pipeline, soft coaching when you risk falling behind, and community energy from peers.",
    icon: BookOpen,
  },
];

const STEPS = [
  {
    n: "01",
    title: "Enter as a scholar",
    body: "Use the Capstone demo login to step into a real ESL scholar workspace.",
  },
  {
    n: "02",
    title: "Review your path",
    body: "Overview shows what matters this week: mentor, ranked opportunities, applications.",
  },
  {
    n: "03",
    title: "Ask the Advisor",
    body: "Chat with JointHub Advisor for personalised next actions — no generic chatbot filler.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F4F7F7] text-[#0D1B2A]">
      <header className="border-b border-[#0D1B2A]/10 bg-[#0D1B2A] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F4B942]">
              SimpleJoint Trust · JointHub Africa
            </p>
            <p className="truncate text-sm text-white/70">AI Mentor Hub for ESL scholars</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Join as scholar
            </Link>
            <Link
              href="/dashboard/login"
              className="rounded-full bg-[#F4B942] px-4 py-2 text-sm font-semibold text-[#0D1B2A] transition hover:bg-[#e0a836]"
            >
              Capstone demo login
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#0D1B2A]/10 bg-[#0D1B2A] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 85% 20%, rgba(2,128,144,0.45), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(244,185,66,0.18), transparent 50%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F4B942]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Capstone II · staging demo
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Your next mentor, opportunity, and next step — in one hub.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              JointHub Africa’s AI Mentor Hub helps ESL scholars discover verified opportunities,
              match with the right mentor, and stay on track with personalised guidance. Built for
              African youth first. Powered by Capstone AI underneath.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#028090] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#026f7d]"
              >
                Enter Mentor Hub
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Join as scholar
              </Link>
              <Link
                href="/prototype"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View design reference
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/55">
              Demo path: scholar1@jointhub.demo · admin@jointhub.demo · no production publish
              without Isaiah’s sign-off
            </p>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
            <div className="flex items-center gap-2 text-[#F4B942]">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">Who this is for</p>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/80">
              <li>
                <span className="font-semibold text-white">ESL scholars</span> — personalised
                opportunities, mentor match, applications, Advisor chat
              </li>
              <li>
                <span className="font-semibold text-white">Programme admins</span> — cohort risk,
                matching quality, Capstone model evidence
              </li>
              <li>
                <span className="font-semibold text-white">Mentors</span> — first-class role on the
                roadmap; represented in matching today
              </li>
            </ul>
            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5">
              {IMPACT.map((item) => (
                <div key={item.label}>
                  <p className="text-lg font-semibold tabular-nums text-[#F4B942] sm:text-xl">
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-white/55">{item.label}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#028090]">
            Inside the hub
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Scholar-first product. Capstone AI underneath.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#0D1B2A]/70 sm:text-base">
            Canva defines how the scholar experience should feel. Capstone modules power ranking,
            mentor assignment, soft coaching, and Advisor answers — without exposing surveillance
            tooling to students.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <article
                key={mod.title}
                className="rounded-2xl border border-[#0D1B2A]/10 bg-white p-5 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#028090]/10 text-[#028090]">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-base font-semibold">{mod.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#0D1B2A]/70">{mod.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[#0D1B2A]/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#028090]">
            Try the demo
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Three steps for Capstone judges
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n} className="rounded-2xl border border-[#0D1B2A]/10 bg-[#F4F7F7] p-5">
                <p className="text-xs font-semibold tabular-nums text-[#F4B942]">{step.n}</p>
                <h3 className="mt-2 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#0D1B2A]/70">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#0D1B2A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#162a3d]"
            >
              Open demo login
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/prototype"
              className="inline-flex items-center gap-2 rounded-full border border-[#0D1B2A]/15 px-5 py-3 text-sm font-semibold text-[#0D1B2A] transition hover:border-[#028090]/40"
            >
              Canva design reference
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#0D1B2A]/10 bg-[#0D1B2A] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>SimpleJoint Trust · Kigali · Lead with service. Build with trust.</p>
          <p className="text-xs">
            Partners: British Council · ALX · Hood.D · A4 · ALU · Creative backbone: Hood & Dot
          </p>
        </div>
      </footer>
    </main>
  );
}
