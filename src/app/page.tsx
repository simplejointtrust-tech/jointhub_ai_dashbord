import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const CANVA_PROTOTYPE_URL = "https://canva.link/tawbtl3fowjdafd";
const CANVA_EMBED_URL =
  "https://www.canva.com/design/DAHPdX_cD54/onR4VikDE4v8lmd7Hk-vtQ/view?embed";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0D1B2A] text-white">
      <header className="shrink-0 border-b border-white/10">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F4B942]">
              SimpleJoint Trust · JointHub Africa
            </p>
            <p className="truncate text-sm text-white/70">
              Mentor Hub for ESL scholars and mentors
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Sign Up
            </Link>
            <Link
              href="/dashboard/login"
              className="rounded-full bg-[#F4B942] px-4 py-2 text-sm font-semibold text-[#0D1B2A] hover:bg-[#e0a836]"
            >
              Sign in
            </Link>
            <a
              href={CANVA_PROTOTYPE_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Open in Canva
            </a>
          </div>
        </div>
      </header>

      <section className="relative min-h-0 flex-1 bg-white">
        <iframe
          title="JointHub Africa home"
          src={CANVA_EMBED_URL}
          loading="eager"
          allowFullScreen
          allow="fullscreen"
          className="absolute inset-0 h-full w-full border-0"
        />
      </section>
    </main>
  );
}
