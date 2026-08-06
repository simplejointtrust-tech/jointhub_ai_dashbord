import Image from "next/image";
import Link from "next/link";
import { PublicOpportunitiesBoard } from "@/components/jointhub/PublicOpportunitiesBoard";
import { ThemeToggle } from "@/components/theme-toggle";
import { getOpportunities } from "@/lib/jointhub/data-store";

export const metadata = {
  title: "Explore Opportunities · JointHub Africa",
  description:
    "Browse curated scholarships, fellowships, internships, and funding opportunities for African leaders on the JointHub Africa opportunity board.",
};

export default function OpportunitiesPage() {
  const opportunities = getOpportunities();

  return (
    <main className="min-h-screen bg-[#F4F0E6] text-[#142033]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/brand/jointhub-logo.png"
              alt="JointHub Africa"
              width={48}
              height={48}
              className="h-10 w-10 shrink-0 rounded-xl bg-black object-contain p-0.5 sm:h-11 sm:w-11"
              priority
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold tracking-tight text-white">
                JointHub Africa
              </p>
              <p className="truncate text-xs text-white/60">Opportunity board · SimpleJoint Trust</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <ThemeToggle />
            <Link
              href="/mentors"
              className="inline-flex min-h-10 items-center rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15 sm:px-4"
            >
              ESL Mentors
            </Link>
            <Link
              href="/dashboard/login"
              className="inline-flex min-h-10 items-center rounded-full bg-[#3A87B8] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#2F739E] sm:px-4"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-8 pb-14 sm:px-6 sm:pt-10">
        <PublicOpportunitiesBoard items={opportunities} />

        <div className="mt-10 rounded-[1.35rem] border border-[rgba(20,32,51,0.08)] bg-white px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#142033] sm:text-2xl">
                Want personalised matches?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[rgba(20,32,51,0.68)]">
                Sign in as a leader to see ranked fits, mentor guidance, and Kay coaching grounded in
                your profile.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/login"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#E0312E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C42825]"
              >
                Join as Leader
              </Link>
              <Link
                href="/mentors"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(20,32,51,0.14)] px-5 py-3 text-sm font-semibold text-[#142033] transition hover:bg-[#F4F0E6]"
              >
                Browse mentors
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
              <p className="text-sm font-semibold">
                © {new Date().getFullYear()} JointHub Africa | Powered by SimpleJoint Trust
              </p>
              <p className="text-xs text-white/65">All rights reserved.</p>
            </div>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-white/60 sm:text-right">
            Always confirm deadlines and eligibility on each official listing page before applying.
          </p>
        </div>
      </footer>
    </main>
  );
}
