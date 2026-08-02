import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const CANVA_PROTOTYPE_URL = "https://canva.link/tawbtl3fowjdafd";
const CANVA_EMBED_URL =
  "https://www.canva.com/design/DAHPdX_cD54/onR4VikDE4v8lmd7Hk-vtQ/view?embed";

export const metadata = {
  title: "Mentor Hub prototype · JointHub Africa",
  description: "Design prototype for JointHub Africa Mentor Hub.",
};

export default function PrototypePage() {
  return (
    <main className="min-h-screen bg-[#F4F7F7] text-[#0D1B2A]">
      <div className="border-b border-[#0D1B2A]/10 bg-[#0D1B2A] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F4B942]">
              SimpleJoint Trust · JointHub Africa
            </p>
            <h1 className="text-lg font-semibold sm:text-xl">Mentor Hub prototype</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Home
            </Link>
            <Link
              href="/dashboard/login"
              className="rounded-full bg-[#F4B942] px-4 py-2 text-sm font-semibold text-[#0D1B2A] hover:bg-[#e0a836]"
            >
              Open Mentor Hub
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
      </div>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <p className="max-w-3xl text-sm leading-relaxed text-[#0D1B2A]/70">
          This page embeds the shared design prototype so the team can review it inside the product
          app. Use Open in Canva if the embed is blocked by browser permissions.
        </p>

        <div className="mt-6 overflow-hidden rounded-3xl border border-[#0D1B2A]/10 bg-white shadow-sm">
          <div className="relative w-full" style={{ paddingTop: "66.66%" }}>
            <iframe
              title="Mentor Hub prototype"
              src={CANVA_EMBED_URL}
              loading="lazy"
              allowFullScreen
              allow="fullscreen"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>

        <p className="mt-4 text-xs text-[#0D1B2A]/55">Source: {CANVA_PROTOTYPE_URL}</p>
      </section>
    </main>
  );
}
