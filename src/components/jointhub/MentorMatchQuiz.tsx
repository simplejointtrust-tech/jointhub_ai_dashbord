"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { QuizAnswers } from "@/lib/jointhub/esl-mentors";

type MatchResult = {
  id: string;
  name: string;
  role: string;
  location: string;
  blurb: string;
  image: string;
  linkedInUrl: string;
  match_score: number;
  reasons: string[];
};

type ApiResponse = {
  coach?: string;
  summary?: string;
  matches?: MatchResult[];
  error?: string;
};

const GOAL_OPTIONS: Array<{ value: QuizAnswers["goal"]; label: string; hint: string }> = [
  { value: "career", label: "Career growth", hint: "Roles, portfolios, and next jobs" },
  { value: "academic", label: "Academic path", hint: "Research, publishing, scholarships" },
  { value: "startup", label: "Startups", hint: "Ideas, fundraising, building" },
  { value: "leadership", label: "Leadership", hint: "Presence, strategy, service" },
  { value: "creative", label: "Creative work", hint: "Brand, design, storytelling" },
  { value: "community", label: "Community impact", hint: "Networks and social initiatives" },
];

const STYLE_OPTIONS: Array<{
  value: QuizAnswers["learningStyle"];
  label: string;
  hint: string;
}> = [
  { value: "hands-on", label: "Hands-on", hint: "Build, ship, and iterate together" },
  { value: "reflective", label: "Reflective", hint: "Think deeply, then decide" },
  { value: "structured", label: "Structured", hint: "Plans, frameworks, clear steps" },
  { value: "conversational", label: "Conversational", hint: "Open dialogue and coaching" },
];

const AVAIL_OPTIONS: Array<{
  value: QuizAnswers["availability"];
  label: string;
  hint: string;
}> = [
  { value: "weekdays", label: "Weekdays", hint: "Daytime check-ins" },
  { value: "evenings", label: "Evenings", hint: "After work or class" },
  { value: "weekends", label: "Weekends", hint: "Saturday or Sunday slots" },
  { value: "async", label: "Async", hint: "Messages and async reviews" },
];

function formatPct(score: number) {
  return `${Math.round(score * 100)}%`;
}

function OptionButton({
  selected,
  label,
  hint,
  onClick,
}: {
  selected: boolean;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left transition ${
        selected
          ? "border-white bg-white text-[#142033] shadow-sm"
          : "border-white/20 bg-white/5 text-white hover:bg-white/10"
      }`}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className={`mt-1 block text-xs ${selected ? "text-[#2F739E]" : "text-white/70"}`}>
        {hint}
      </span>
    </button>
  );
}

export function MentorMatchQuiz() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(answers.goal);
    if (step === 1) return Boolean(answers.learningStyle);
    if (step === 2) return Boolean(answers.availability);
    return false;
  }, [answers, step]);

  function resetQuiz() {
    setStep(0);
    setAnswers({});
    setError(null);
    setSummary(null);
    setMatches([]);
    setLoading(false);
  }

  function openQuiz() {
    resetQuiz();
    setOpen(true);
  }

  async function runMatch(finalAnswers: QuizAnswers) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/jointhub/mentor-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.matches?.length) {
        throw new Error(data.error || "Matching failed. Try again.");
      }
      setSummary(data.summary ?? "Here are your strongest mentor fits.");
      setMatches(data.matches);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Matching failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleNext() {
    if (step < 2) {
      setStep((current) => current + 1);
      return;
    }
    if (!answers.goal || !answers.learningStyle || !answers.availability) {
      setError("Please answer all three questions.");
      return;
    }
    await runMatch({
      goal: answers.goal,
      learningStyle: answers.learningStyle,
      availability: answers.availability,
    });
  }

  return (
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
        <button
          type="button"
          onClick={openQuiz}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25"
        >
          Start Quiz
        </button>
      </div>

      {open ? (
        <div className="mt-6 rounded-[1.2rem] border border-white/15 bg-black/15 p-4 sm:p-5">
          {step < 3 ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-[0.14em] text-[#A9D7F2] uppercase">
                  Question {step + 1} of 3
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs font-medium text-white/70 transition hover:text-white"
                >
                  Close
                </button>
              </div>

              <h3 className="mt-3 text-lg font-semibold tracking-tight">
                {step === 0 && "What do you want help with most right now?"}
                {step === 1 && "How do you learn best with a mentor?"}
                {step === 2 && "When can you usually meet?"}
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {step === 0
                  ? GOAL_OPTIONS.map((option) => (
                      <OptionButton
                        key={option.value}
                        selected={answers.goal === option.value}
                        label={option.label}
                        hint={option.hint}
                        onClick={() => setAnswers((prev) => ({ ...prev, goal: option.value }))}
                      />
                    ))
                  : null}
                {step === 1
                  ? STYLE_OPTIONS.map((option) => (
                      <OptionButton
                        key={option.value}
                        selected={answers.learningStyle === option.value}
                        label={option.label}
                        hint={option.hint}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, learningStyle: option.value }))
                        }
                      />
                    ))
                  : null}
                {step === 2
                  ? AVAIL_OPTIONS.map((option) => (
                      <OptionButton
                        key={option.value}
                        selected={answers.availability === option.value}
                        label={option.label}
                        hint={option.hint}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, availability: option.value }))
                        }
                      />
                    ))
                  : null}
              </div>

              {error ? <p className="mt-4 text-sm text-[#FFD0CE]">{error}</p> : null}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((current) => Math.max(0, current - 1))}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                    disabled={loading}
                  >
                    Back
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleNext()}
                  disabled={!canContinue || loading}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#142033] transition hover:bg-[#EAF6FC] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Matching…" : step === 2 ? "See my matches" : "Continue"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.14em] text-[#A9D7F2] uppercase">
                    AI Coach Kay
                  </p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">
                    Your top mentor matches
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">{summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs font-medium text-white/70 transition hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {matches.map((match, index) => (
                  <article
                    key={match.id}
                    className="overflow-hidden rounded-2xl border border-white/15 bg-white text-[#142033] shadow-sm"
                  >
                    <div className="relative aspect-[5/4] bg-[#E8EEF3]">
                      <Image
                        src={match.image}
                        alt={match.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover object-center"
                      />
                      <span className="absolute top-3 left-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">
                        #{index + 1} · {formatPct(match.match_score)} fit
                      </span>
                    </div>
                    <div className="px-4 py-4">
                      <h4 className="text-base font-semibold tracking-tight">{match.name}</h4>
                      <p className="mt-1 text-sm font-medium text-[#2F739E]">
                        {match.role} · {match.location}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[rgba(20,32,51,0.68)]">
                        {match.blurb}
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {match.reasons.map((reason) => (
                          <li
                            key={reason}
                            className="text-xs leading-relaxed text-[rgba(20,32,51,0.72)]"
                          >
                            • {reason}
                          </li>
                        ))}
                      </ul>
                      <a
                        href={match.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-[#D7EEF8] px-4 py-2 text-sm font-semibold text-[#2B6F9C] transition hover:bg-[#C4E5F5]"
                      >
                        View profile
                      </a>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openQuiz}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Retake quiz
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#142033] transition hover:bg-[#EAF6FC]"
                >
                  Browse all mentors
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
