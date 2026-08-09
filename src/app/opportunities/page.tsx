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
                Opportunity board · SimpleJoint Trust
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <ThemeToggle />
            <Link
              href="/mentors"
              className="inline-flex rounded-full bg-[#0F3D2E] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0A2A20] sm:px-4"
            >
              ESL Mentors
            </Link>
            <Link
              href="https://staging.app.simplejoint-trust-4b4a02.cofounder.company/login"
              className="inline-flex rounded-full border border-[rgba(15,61,46,0.18)] px-3 py-2 text-sm font-semibold text-[#0F3D2E] transition hover:border-[#0F3D2E]/40 hover:bg-[#FBF7F0] sm:px-4"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-8 pb-14 sm:px-6 sm:pt-10">
        <PublicOpportunitiesBoard items={opportunities} />

        <div className="mt-10 rounded-2xl border border-[rgba(15,61,46,0.10)] bg-[#FBF7F0] px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0F3D2E] sm:text-2xl">
                Want personalised matches?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[rgba(26,21,16,0.68)]">
                Sign in as a leader to see ranked fits, mentor guidance, and Kay coaching grounded in
                your profile.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="https://staging.app.simplejoint-trust-4b4a02.cofounder.company/login?role=leader"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#E07020] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c9611a]"
              >
                Join as Leader
              </Link>
              <Link
                href="/mentors"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(15,61,46,0.18)] px-5 py-3 text-sm font-semibold text-[#0F3D2E] transition hover:bg-white"
              >
                Browse mentors
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[rgba(15,61,46,0.10)] bg-[#0F3D2E] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/jointhub-logo.png"
              alt="JointHub Africa"
              width={52}
              height={52}
              className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain p-1"
            />
            <div>
              <p className="text-sm font-semibold">
                © {new Date().getFullYear()} JointHub Africa | Powered by SimpleJoint Trust
              </p>
              <p className="text-xs text-white/70">All rights reserved.</p>
            </div>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-white/70 sm:text-right">
            Always confirm deadlines and eligibility on each official listing page before applying.
          </p>
        </div>
      </footer>
    </main>
  );
}
