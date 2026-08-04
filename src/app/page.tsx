import { ArrowRight, Compass, MessageSquareText, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const IMPACT = [
  { label: "Scholarships & grants", value: "$158,000+" },
  { label: "Students supported", value: "85+" },
  { label: "Countries reached", value: "6+" },
];

const PATHS = [
  {
    title: "Find opportunities",
    body: "Scholarships, fellowships, and programmes ranked to your goals — not a generic feed.",
    icon: Compass,
  },
  {
    title: "Meet your mentor",
    body: "See your assigned mentor, why you match, and book a check-in in one step.",
    icon: Users,
  },
  {
    title: "Ask Kay",
    body: "Eligibility, deadlines, and next steps grounded in your profile — not chatbot filler.",
    icon: MessageSquareText,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#1A1510]">
      <header className="sticky top-0 z-30 border-b border-[rgba(15,61,46,0.10)] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/brand/jointhub-logo.png"
              alt="JointHub Africa"
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 object-contain"
              priority
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold tracking-tight text-[#0F3D2E]">
                JointHub Africa
              </p>
              <p className="truncate text-xs text-[rgba(26,21,16,0.55)]">
                SimpleJoint Trust · Mentor Hub
              </p>
            </div>
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ThemeToggle />
            <Link
              href="/login?role=mentor"
              className="inline-flex rounded-full border border-[rgba(15,61,46,0.18)] px-3 py-2 text-sm font-semibold text-[#0F3D2E] transition hover:border-[#0F3D2E]/40 hover:bg-[#FBF7F0] sm:px-4"
            >
              Join as Mentor
            </Link>
            <Link
              href="/login?role=scholar"
              className="inline-flex rounded-full border border-[rgba(15,61,46,0.18)] px-3 py-2 text-sm font-semibold text-[#0F3D2E] transition hover:border-[#0F3D2E]/40 hover:bg-[#FBF7F0] sm:px-4"
            >
              Join as scholar
            </Link>
          </div>
        </div>
      </header>

      {/* Photo-led hero — white page, real cohort image, logo colours */}
      <section className="border-b border-[rgba(15,61,46,0.10)] bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-14">
          <div className="order-2 lg:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E07020]">
              Pan-African youth platform · Kigali
            </p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-[#0F3D2E] sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
              Mentors, scholarships, and a clear next step for African scholars.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[rgba(26,21,16,0.72)] sm:text-lg">
              JointHub Africa is where ESL scholars discover opportunities, meet mentors, and stay
              on track - built by SimpleJoint Trust with an AI companion to match and coach.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="https://jointhub.simplejoint.org/"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#E07020] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c9611a]"
              >
                Explore Opportunities
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <figure className="overflow-hidden rounded-2xl border border-[rgba(15,61,46,0.12)] bg-[#FBF7F0] shadow-[0_20px_50px_-28px_rgba(58,36,24,0.45)]">
              <div className="relative aspect-[3/2] w-full">
                <Image
                  src="/brand/scholars-hero.jpg"
                  alt="JointHub Africa scholars and partners gathered on a staircase, smiling and waving"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover object-[50%_35%]"
                />
              </div>
              <figcaption className="flex items-center gap-3 border-t border-[rgba(15,61,46,0.08)] px-4 py-3">
                <Image
                  src="/brand/simplejoint-trust-logo.png"
                  alt="SimpleJoint Trust"
                  width={48}
                  height={45}
                  className="h-10 w-auto shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0F3D2E]">Our ESL community</p>
                  <p className="text-xs text-[rgba(26,21,16,0.55)]">
                    Scholars, mentors, and partners — lead with service, build with trust
                  </p>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Impact — quiet numbers, not metric-card grid */}
      <section className="border-b border-[rgba(15,61,46,0.10)] bg-[#FBF7F0]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0F3D2E]/70">
              Impact to date
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[rgba(26,21,16,0.68)]">
              Real outcomes from SimpleJoint Trust programmes across Africa — not demo stats.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-6 sm:gap-10">
            {IMPACT.map((item) => (
              <div key={item.label}>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-[rgba(26,21,16,0.5)]">
                  {item.label}
                </dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-[#0F3D2E] sm:text-3xl">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* What you get — open layout, not deck slides */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E8A317]">
              Inside the Mentor Hub
            </p>
            <h2 className="mt-2 text-nowrap text-[1.35rem] font-semibold tracking-tight text-[#0F3D2E] sm:text-2xl lg:text-3xl">
              Built for ESL scholars first. Meet your AI Coach (Kay).
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[rgba(26,21,16,0.68)]">
              Kay helps with opportunity ranking, mentor matching, soft coaching, and Advisor
              answers — without turning students into a surveillance dashboard.
            </p>
          </div>

          <ul className="mt-10 divide-y divide-[rgba(15,61,46,0.10)] border-y border-[rgba(15,61,46,0.10)]">
            {PATHS.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="grid gap-3 py-6 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F3D2E]/[0.08] text-[#0F3D2E]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0F3D2E]">{item.title}</h3>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[rgba(26,21,16,0.68)] sm:text-base">
                      {item.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Try path + logo brand block */}
      <section className="border-t border-[rgba(15,61,46,0.10)] bg-[#FBF7F0]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex justify-center lg:justify-start">
            <Image
              src="/brand/jointhub-logo-mark.png"
              alt="JointHub Africa logo — puzzle pieces and Africa mark with JOINT HUB wordmark"
              width={500}
              height={500}
              className="h-auto w-full max-w-[240px] object-contain drop-shadow-sm sm:max-w-[280px]"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E07020]">
              Capstone preview
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0F3D2E] sm:text-3xl">
              Walk the ESL scholar path in three minutes.
            </h2>
            <ol className="mt-6 space-y-4 text-sm leading-relaxed text-[rgba(26,21,16,0.75)] sm:text-base">
              <li className="flex gap-3">
                <span className="font-semibold tabular-nums text-[#E8A317]">01</span>
                <span>
                  Open <strong className="font-semibold text-[#0F3D2E]">Sign In</strong> and enter
                  as a scholar.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold tabular-nums text-[#E8A317]">02</span>
                <span>
                  Review Overview: mentor, ranked opportunities, and applications in progress.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold tabular-nums text-[#E8A317]">03</span>
                <span>
                  Ask <strong className="font-semibold text-[#0F3D2E]">Kay</strong> for a
                  personalised next action.
                </span>
              </li>
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard/login"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0F3D2E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0A2A20]"
              >
                Sign In
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/prototype"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgba(15,61,46,0.2)] px-5 py-3 text-sm font-semibold text-[#0F3D2E] transition hover:bg-white"
              >
                Canva design reference
              </Link>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-[rgba(26,21,16,0.5)]">
              Register for our ESL Bootcamp: CreativeTech × SoCreative · 24th - 25th August 2026 ·
              ALX, Kigali, Rwanda
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-black text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/simplejoint-trust-logo.png"
              alt="SimpleJoint Trust"
              width={52}
              height={49}
              className="h-11 w-auto shrink-0 object-contain"
            />
            <div>
              <p className="text-sm font-semibold">SimpleJoint Trust · JointHub Africa</p>
              <p className="text-xs text-white/65">Kigali · Lead with service. Build with trust.</p>
            </div>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-white/60 sm:text-right">
            Partners: British Council · ALX · Hood.D · A4 · ALU · Creative backbone: Hood & Dot
          </p>
        </div>
      </footer>
    </main>
  );
}
