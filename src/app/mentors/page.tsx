import { ArrowRight, Clock3, Globe2, MapPin, Search, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { getMentors } from "@/lib/jointhub/data-store";

export const metadata = {
  title: "ESL Mentors · JointHub Africa",
  description:
    "Browse ESL mentors on JointHub Africa — industries, countries, skills, and availability for Emerging Servant Leaders.",
};

function formatSkill(skill: string): string {
  return skill
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mentorInitials(name: string): string {
  const cleaned = name.replace(/^Mentor\s+/i, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "M";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function EslMentorsPage() {
  const mentors = getMentors();
  const countries = Array.from(new Set(mentors.map((mentor) => mentor.country))).sort();
  const industries = Array.from(new Set(mentors.map((mentor) => mentor.industry))).sort();
  const totalHours = mentors.reduce((sum, mentor) => sum + mentor.availability_hrs_per_month, 0);

  return (
    <main className="min-h-screen bg-white text-[#1A1510]">
      <header className="sticky top-0 z-30 border-b border-[rgba(15,61,46,0.10)] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/brand/jointhub-logo.png"
              alt="JointHub Africa"
              width={56}
              height={56}
              className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
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
              href="/mentors"
              className="inline-flex rounded-full bg-[#0F3D2E] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0A2A20] sm:px-4"
              aria-current="page"
            >
              ESL Mentors
            </Link>
            <Link
              href="/login?role=mentor"
              className="inline-flex rounded-full border border-[rgba(15,61,46,0.18)] px-3 py-2 text-sm font-semibold text-[#0F3D2E] transition hover:border-[#0F3D2E]/40 hover:bg-[#FBF7F0] sm:px-4"
            >
              Join as Mentor
            </Link>
            <Link
              href="/login?role=leader"
              className="inline-flex rounded-full border border-[rgba(15,61,46,0.18)] px-3 py-2 text-sm font-semibold text-[#0F3D2E] transition hover:border-[#0F3D2E]/40 hover:bg-[#FBF7F0] sm:px-4"
            >
              Join as leader
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-[rgba(15,61,46,0.10)] bg-[#FBF7F0]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E07020]">
              ESL Mentors · Professional Mentor Programme
            </p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-[#0F3D2E] sm:text-4xl lg:text-[2.55rem] lg:leading-[1.12]">
              Meet the mentors guiding Emerging Servant Leaders.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[rgba(26,21,16,0.72)] sm:text-lg">
              Browse real mentor profiles by industry, country, language, and availability. Leaders
              can request a match through Mentor Hub; professionals can join the ESL mentor roster.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/dashboard/login"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#E07020] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c9611a]"
              >
                Request a mentor match
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/login?role=mentor"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgba(15,61,46,0.2)] bg-white px-5 py-3 text-sm font-semibold text-[#0F3D2E] transition hover:bg-[#FBF7F0]"
              >
                Join as Mentor
              </Link>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-3 rounded-2xl border border-[rgba(15,61,46,0.12)] bg-white p-4 shadow-[0_16px_40px_-30px_rgba(58,36,24,0.45)] sm:gap-4 sm:p-5">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-[rgba(26,21,16,0.5)]">
                Mentors
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-[#0F3D2E] sm:text-3xl">
                {mentors.length}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-[rgba(26,21,16,0.5)]">
                Countries
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-[#0F3D2E] sm:text-3xl">
                {countries.length}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-[rgba(26,21,16,0.5)]">
                Hours / mo
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-[#0F3D2E] sm:text-3xl">
                {totalHours}+
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="border-b border-[rgba(15,61,46,0.10)] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm text-[rgba(26,21,16,0.68)]">
              <Search className="h-4 w-4 text-[#0F3D2E]" aria-hidden />
              <span>
                Showing <strong className="font-semibold text-[#0F3D2E]">{mentors.length}</strong>{" "}
                ESL mentors across{" "}
                <strong className="font-semibold text-[#0F3D2E]">{industries.length}</strong>{" "}
                industries
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => (
                <span
                  key={industry}
                  className="rounded-full border border-[rgba(15,61,46,0.12)] bg-[#FBF7F0] px-3 py-1 text-xs font-medium text-[#0F3D2E]"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E8A317]">
                Mentor directory
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0F3D2E]">
                Find a mentor who fits your path
              </h2>
            </div>
            <p className="hidden max-w-xs text-right text-xs leading-relaxed text-[rgba(26,21,16,0.55)] sm:block">
              Capstone preview roster. Sign in as a leader to open your matched mentor and book a
              check-in.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mentors.map((mentor) => (
              <li
                key={mentor.mentor_id}
                className="flex h-full flex-col rounded-2xl border border-[rgba(15,61,46,0.12)] bg-white p-5 shadow-[0_12px_30px_-28px_rgba(58,36,24,0.55)]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0F3D2E] text-sm font-semibold text-white"
                    aria-hidden
                  >
                    {mentorInitials(mentor.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-[#0F3D2E]">
                      {mentor.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-[rgba(26,21,16,0.65)]">
                      {mentor.title ?? `${mentor.industry} mentor`}
                    </p>
                  </div>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[rgba(26,21,16,0.72)]">
                  {mentor.bio ??
                    "Professional mentor supporting African leaders on JointHub Africa."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-[rgba(26,21,16,0.65)]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FBF7F0] px-2.5 py-1">
                    <MapPin className="h-3.5 w-3.5 text-[#E07020]" aria-hidden />
                    {mentor.country}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FBF7F0] px-2.5 py-1">
                    <Globe2 className="h-3.5 w-3.5 text-[#0F3D2E]" aria-hidden />
                    {mentor.industry}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FBF7F0] px-2.5 py-1">
                    <Clock3 className="h-3.5 w-3.5 text-[#E8A317]" aria-hidden />
                    {mentor.availability_hrs_per_month}h / month
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {mentor.skills_offered.slice(0, 4).map((skill) => (
                    <span
                      key={`${mentor.mentor_id}-${skill}`}
                      className="rounded-full border border-[rgba(15,61,46,0.12)] px-2 py-0.5 text-[11px] font-medium text-[#0F3D2E]"
                    >
                      {formatSkill(skill)}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                  <p className="text-xs text-[rgba(26,21,16,0.55)]">
                    {mentor.languages.join(" · ")}
                  </p>
                  <Link
                    href="/dashboard/login"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#E07020] transition hover:text-[#c9611a]"
                  >
                    Connect
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-[rgba(15,61,46,0.10)] bg-[#0F3D2E] text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-[#E8A317]">
              <Sparkles className="h-4 w-4" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                How ESL mentoring works
              </p>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Leaders match. Mentors guide. Kay keeps the next step clear.
            </h2>
            <ol className="mt-6 space-y-3 text-sm leading-relaxed text-white/80 sm:text-base">
              <li className="flex gap-3">
                <span className="font-semibold tabular-nums text-[#E8A317]">01</span>
                <span>Browse ESL Mentors and note industries, skills, and availability.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold tabular-nums text-[#E8A317]">02</span>
                <span>Sign in as a leader to open your matched mentor inside Mentor Hub.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold tabular-nums text-[#E8A317]">03</span>
                <span>Book a check-in and ask Kay for a personalised follow-up action.</span>
              </li>
            </ol>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/dashboard/login"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#E07020] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c9611a]"
            >
              Sign in to Mentor Hub
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/login?role=mentor"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Users className="h-4 w-4" aria-hidden />
              Become an ESL Mentor
            </Link>
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
              <p className="text-sm font-semibold">SimpleJoint Trust</p>
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
