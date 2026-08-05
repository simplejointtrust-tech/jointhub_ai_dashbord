import { Bell, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MentorMatchQuiz } from "@/components/jointhub/MentorMatchQuiz";
import { ThemeToggle } from "@/components/theme-toggle";
import { ESL_MENTORS } from "@/lib/jointhub/esl-mentors";

export const metadata = {
  title: "ESL Mentors · JointHub Africa",
  description:
    "Meet ESL mentors on JointHub Africa — practitioners ready to help Emerging Servant Leaders take the next step with clarity.",
};

export default function EslMentorsPage() {
  return (
    <main className="min-h-screen bg-[#F4F0E6] text-[#142033]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/brand/simplejoint-puzzle-logo.png"
              alt="SimpleJoint Trust"
              width={48}
              height={48}
              className="h-10 w-10 shrink-0 rounded-xl bg-black object-contain p-0.5 sm:h-11 sm:w-11"
              priority
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold tracking-tight text-white">
                SimpleJoint Trust
              </p>
              <p className="truncate text-xs text-white/60">ESL Mentors · JointHub Africa</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="relative hidden min-w-[13rem] md:block">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/45"
                aria-hidden
              />
              <label htmlFor="mentor-search" className="sr-only">
                Search opportunities
              </label>
              <input
                id="mentor-search"
                type="search"
                placeholder="Search opportunities"
                className="h-10 w-full rounded-full border border-white/15 bg-white/10 pr-4 pl-9 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#3A87B8] focus:ring-2 focus:ring-[rgba(58,135,184,0.35)]"
              />
            </div>
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" aria-hidden />
            </button>
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E0312E] text-sm font-semibold text-white"
              aria-hidden
            >
              AM
            </span>
            <Link
              href="/login?role=leader"
              className="inline-flex min-h-10 items-center rounded-full bg-[#3A87B8] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#2F739E] sm:px-4"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-8 pb-6 sm:px-6 sm:pt-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-[rgba(20,32,51,0.48)] uppercase">
            Human guidance
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-[#142033] sm:text-4xl">
            Meet people who have made the path
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-[rgba(20,32,51,0.68)] sm:text-lg">
            A small circle of practitioners ready to help you make your next move with clarity.
          </p>
        </div>

        <div className="mt-8">
          <MentorMatchQuiz />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[rgba(20,32,51,0.48)] uppercase">
              Mentor directory
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#142033]">
              Browse every ESL mentor
            </h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ESL_MENTORS.map((mentor) => (
            <article
              key={mentor.id}
              id={`mentor-${mentor.id}`}
              className="flex flex-col overflow-hidden rounded-[1.35rem] border border-[rgba(20,32,51,0.06)] bg-white shadow-[0_10px_30px_rgba(20,32,51,0.05)]"
            >
              <div className="relative aspect-square overflow-hidden bg-[#E8EEF3]">
                <Image
                  src={mentor.image}
                  alt={mentor.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="flex flex-1 flex-col px-4 pt-4 pb-5">
                <h3 className="text-lg font-semibold tracking-tight text-[#142033]">
                  {mentor.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-[#2F739E]">
                  {mentor.role} · {mentor.location}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[rgba(20,32,51,0.68)]">
                  {mentor.blurb}
                </p>
                <a
                  href={mentor.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-10 w-fit items-center justify-center rounded-full bg-[#D7EEF8] px-4 py-2 text-sm font-semibold text-[#2B6F9C] transition hover:bg-[#C4E5F5]"
                >
                  View profile
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[1.35rem] border border-[rgba(20,32,51,0.08)] bg-white px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#142033] sm:text-2xl">
                Ready to meet your mentor? Join the hub
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[rgba(20,32,51,0.68)]">
                Sign in as a leader to open Mentor Hub, or apply to guide ESL leaders as a mentor.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/login"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#E0312E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C42825]"
              >
                Sign in to Mentor Hub
              </Link>
              <Link
                href="/login?role=mentor"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(20,32,51,0.14)] px-5 py-3 text-sm font-semibold text-[#142033] transition hover:bg-[#F4F0E6]"
              >
                Become an ESL Mentor
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/simplejoint-puzzle-logo.png"
              alt="SimpleJoint Trust"
              width={52}
              height={52}
              className="h-11 w-11 shrink-0 rounded-xl bg-black object-contain"
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
