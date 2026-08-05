import { Bell, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = {
  title: "ESL Mentors · JointHub Africa",
  description:
    "Meet ESL mentors on JointHub Africa — practitioners ready to help Emerging Servant Leaders take the next step with clarity.",
};

type MentorCard = {
  id: string;
  name: string;
  role: string;
  location: string;
  blurb: string;
  image: string;
  imagePosition?: string;
};

const MENTORS: MentorCard[] = [
  {
    id: "amina-njoroge",
    name: "Amina Njoroge",
    role: "Product leader",
    location: "Kenya",
    blurb: "Design strategy, research craft, and confident portfolios.",
    image: "/brand/mentors/amina-njoroge.jpg",
  },
  {
    id: "edafe-akpovwa",
    name: "Edafe Akpovwa",
    role: "Engineering mentor",
    location: "Rwanda",
    blurb: "Technical career choices, prototypes, and practical problem-solving.",
    image: "/brand/mentors/edafe-akpovwa.jpg",
  },
  {
    id: "bothlale-mdluli",
    name: "Bothlale Mdluli",
    role: "Career strategist",
    location: "South Africa",
    blurb: "Career narratives, pivots, and networking with purpose.",
    image: "/brand/mentors/bothlale-mdluli.jpg",
  },
  {
    id: "ololade-oloniyo",
    name: "Ololade Oloniyo",
    role: "Creative director",
    location: "Nigeria",
    blurb: "Emerging creators, visual strategy, and distinctive brand identity.",
    image: "/brand/mentors/ololade-oloniyo.jpg",
  },
  {
    id: "isaiah-kporon",
    name: "Isaiah Kporon",
    role: "Executive coach",
    location: "Rwanda",
    blurb: "Leadership acceleration, strategic thinking, and executive presence.",
    image: "/brand/mentors/isaiah-kporon.jpg",
  },
  {
    id: "chengetai-chikadaya",
    name: "Chengetai Chikadaya",
    role: "Academic coach",
    location: "Zimbabwe",
    blurb: "Scholarly research, academic publishing, and confident pathways.",
    image: "/brand/mentors/chengetai-chikadaya.jpg",
  },
  {
    id: "michael-adeniyi",
    name: "Michael Adeniyi",
    role: "Entrepreneurship mentor",
    location: "Nigeria",
    blurb: "Idea validation, fundraising, and building resilient startups.",
    image: "/brand/mentors/michael-adeniyi.jpg",
  },
  {
    id: "blessing-matiro",
    name: "Blessing Matiro",
    role: "Data science mentor",
    location: "South Africa",
    blurb: "Analytical skills, research publishing, and meaningful technical roles.",
    image: "/brand/mentors/blessing-matiro.jpg",
  },
  {
    id: "amara-okafor",
    name: "Amara Okafor",
    role: "Community builder",
    location: "Kenya",
    blurb: "Social impact initiatives, network building, and community engagement.",
    image: "/brand/mentors/amara-okafor.jpg",
  },
  {
    id: "simeon-mwale",
    name: "Simeon Mwale",
    role: "Design systems mentor",
    location: "Lusaka",
    blurb: "Scalable design systems, documentation, and cross-functional leadership.",
    image: "/brand/mentors/simeon-mwale.jpg",
    imagePosition: "left center",
  },
];

export default function EslMentorsPage() {
  return (
    <main className="min-h-screen bg-[#F4F0E6] text-[#142033]">
      <header className="sticky top-0 z-30 border-b border-[rgba(20,32,51,0.08)] bg-[#F4F0E6]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/brand/jointhub-logo.png"
              alt="JointHub Africa"
              width={48}
              height={48}
              className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11"
              priority
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold tracking-tight text-[#142033]">
                Meet your mentors
              </p>
              <p className="truncate text-xs text-[rgba(20,32,51,0.55)]">
                JointHub Africa · ESL Mentors
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="relative hidden min-w-[13rem] md:block">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[rgba(20,32,51,0.45)]"
                aria-hidden
              />
              <label htmlFor="mentor-search" className="sr-only">
                Search opportunities
              </label>
              <input
                id="mentor-search"
                type="search"
                placeholder="Search opportunities"
                className="h-10 w-full rounded-full border border-[rgba(20,32,51,0.10)] bg-white pr-4 pl-9 text-sm text-[#142033] outline-none placeholder:text-[rgba(20,32,51,0.42)] focus:border-[#3A87B8] focus:ring-2 focus:ring-[rgba(58,135,184,0.18)]"
              />
            </div>
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(20,32,51,0.10)] bg-white text-[#142033] transition hover:bg-white/80"
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
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
          <div className="flex items-center gap-3">
            <Image
              src="/brand/simplejoint-puzzle-logo.png"
              alt="SimpleJoint Trust"
              width={72}
              height={72}
              className="h-14 w-14 rounded-2xl bg-black object-contain p-1.5 sm:h-16 sm:w-16"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-[#142033]">SimpleJoint Trust</p>
              <p className="text-xs text-[rgba(20,32,51,0.55)]">ESL Mentors · JointHub Africa</p>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.35rem] bg-[#2B6F9C] px-5 py-6 text-white shadow-[0_18px_40px_rgba(20,32,51,0.12)] sm:px-7 sm:py-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.18em] text-[#A9D7F2] uppercase">
                AI pairing
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
                Find your ideal mentor match
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-base">
                To discover your generous mentor, answer three quick questions about your goals,
                learning style, and availability. Our AI Coach (Kay) will recommend your best fit.
              </p>
            </div>
            <Link
              href="/dashboard/login"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25"
            >
              Start Quiz
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MENTORS.map((mentor) => (
            <article
              key={mentor.id}
              className="flex flex-col overflow-hidden rounded-[1.35rem] border border-[rgba(20,32,51,0.06)] bg-white shadow-[0_10px_30px_rgba(20,32,51,0.05)]"
            >
              <div className="relative aspect-[4/4.2] overflow-hidden bg-[#E8EEF3]">
                <Image
                  src={mentor.image}
                  alt={mentor.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                  style={
                    mentor.imagePosition
                      ? { objectPosition: mentor.imagePosition }
                      : { objectPosition: "center top" }
                  }
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
                <Link
                  href="/dashboard/login"
                  className="mt-4 inline-flex min-h-10 w-fit items-center justify-center rounded-full bg-[#D7EEF8] px-4 py-2 text-sm font-semibold text-[#2B6F9C] transition hover:bg-[#C4E5F5]"
                >
                  View profile
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[1.35rem] border border-[rgba(20,32,51,0.08)] bg-white px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-[#E0312E] uppercase">
                Join the circle
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#142033] sm:text-2xl">
                Ready to meet your mentor?
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
