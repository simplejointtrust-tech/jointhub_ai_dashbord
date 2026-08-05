"use client";

import {
  AlertTriangle,
  BookOpen,
  Calendar,
  ChevronRight,
  Compass,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Send,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type {
  ApplicationStage,
  CommunityPost,
  LeaderApplication,
  LeaderOverview,
  MentorOverview,
} from "@/lib/jointhub/leader-experience";
import type {
  DashboardBundle,
  MentorAssignment,
  MentorProfile,
  MentorTop3,
  ModelMetrics,
  NlpRow,
  Recommendation,
  RiskRow,
  SessionLog,
} from "@/lib/jointhub/types";
import { cn } from "@/lib/utils";

type LeaderTabId =
  | "overview"
  | "caseload"
  | "opportunities"
  | "mentors"
  | "applications"
  | "community"
  | "coaching"
  | "risk"
  | "sessions"
  | "analytics";

type DashboardResponse = DashboardBundle & {
  students?: Array<{
    student_id: string;
    full_name: string;
    email: string;
    country: string;
  }>;
  overview?: LeaderOverview | null;
  mentor_overview?: MentorOverview | null;
  applications?: LeaderApplication[];
  community?: CommunityPost[];
};

type AdvisorMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  suggested_actions?: string[];
  follow_ups?: string[];
};

const LEADER_TABS: Array<{ id: LeaderTabId; label: string; icon: typeof Target }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "opportunities", label: "Opportunities", icon: Target },
  { id: "mentors", label: "ESL Mentors", icon: Users },
  { id: "applications", label: "Applications", icon: BookOpen },
  { id: "community", label: "Community", icon: Compass },
  { id: "coaching", label: "Stay on track", icon: Sparkles },
  { id: "risk", label: "Dropout risk", icon: AlertTriangle },
];

const ADMIN_TABS: Array<{ id: LeaderTabId; label: string; icon: typeof Target }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "opportunities", label: "Opportunities", icon: Target },
  { id: "mentors", label: "ESL Mentors", icon: Users },
  { id: "risk", label: "Dropout risk", icon: AlertTriangle },
  { id: "analytics", label: "Analytics", icon: LayoutDashboard },
];

const MENTOR_TABS: Array<{ id: LeaderTabId; label: string; icon: typeof Target }> = [
  { id: "caseload", label: "My caseload", icon: LayoutDashboard },
  { id: "sessions", label: "Sessions", icon: Calendar },
  { id: "risk", label: "Mentee risk", icon: AlertTriangle },
  { id: "community", label: "Community", icon: Compass },
];

const STAGE_LABEL: Record<ApplicationStage, string> = {
  active: "Active",
  under_review: "Under review",
  interview: "Interview",
  accepted: "Accepted",
};

function formatPct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function scoreTone(score: number): string {
  if (score >= 0.75) return "bg-[#B47828] text-[#142033]";
  if (score >= 0.55) return "bg-[#3A87B8]/15 text-[#3A87B8]";
  return "bg-[#142033]/10 text-[#142033]";
}

function riskTone(level: RiskRow["risk_level"]): string {
  if (level === "high") return "bg-[#E0312E]/12 text-[#E0312E] border-[#E0312E]/30";
  if (level === "medium") return "bg-[#DC6414]/12 text-[#DC6414] border-[#DC6414]/30";
  return "bg-[#1B5E20]/12 text-[#1B5E20] border-[#1B5E20]/30";
}

function stageTone(stage: ApplicationStage): string {
  if (stage === "accepted") return "bg-[#1B5E20]/12 text-[#1B5E20]";
  if (stage === "interview") return "bg-[#3A87B8]/15 text-[#3A87B8]";
  if (stage === "under_review") return "bg-[#B47828]/25 text-[#142033]";
  return "bg-[#142033]/08 text-[#142033]/75";
}

function KpiCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-[#142033]/10 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#142033]/55">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-[#142033]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#142033]/55">{hint}</p> : null}
    </div>
  );
}

function OpportunitiesPanel({
  items,
  sentence,
}: {
  items: Recommendation[];
  sentence: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#3A87B8]/20 bg-gradient-to-r from-[#3A87B8]/10 to-white p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-[#3A87B8]" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3A87B8]">
              Curated for you
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#142033]/80">
              {sentence ??
                "Content-based cosine similarity ranks verified opportunities against your interest vector and career stage."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <article
            key={item.opp_id}
            className="grid gap-3 rounded-2xl border border-[#142033]/10 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-[#142033]">{item.title}</h3>
                {item.is_verified ? (
                  <span className="rounded-full bg-[#1B5E20]/10 px-2 py-0.5 text-[11px] font-semibold text-[#1B5E20]">
                    Verified
                  </span>
                ) : null}
                {item.is_scam_flag ? (
                  <span className="rounded-full bg-[#E0312E]/10 px-2 py-0.5 text-[11px] font-semibold text-[#E0312E]">
                    Review carefully
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-[#142033]/65">
                {item.org_name} · {item.type} · deadline {item.deadline}
              </p>
              {item.description ? (
                <p className="mt-2 text-sm leading-relaxed text-[#142033]/75">{item.description}</p>
              ) : null}
              {item.interest_overlap && item.interest_overlap.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.interest_overlap.map((tag) => (
                    <span
                      key={`${item.opp_id}-${tag}`}
                      className="rounded-full bg-[#142033]/[0.04] px-2 py-0.5 text-[11px] text-[#142033]/70"
                    >
                      {tag.replaceAll("_", " ")}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-semibold tabular-nums",
                  scoreTone(item.match_score),
                )}
              >
                {formatPct(item.match_score)} match
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-[#142033]/15 px-3 py-1.5 text-xs font-semibold text-[#142033] hover:border-[#3A87B8]/50"
              >
                Save / apply
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </article>
        ))}
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#142033]/15 bg-white p-6 text-sm text-[#142033]/60">
            No ranked opportunities for this view yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Heatmap({
  matrix,
  studentNames,
  mentorNames,
}: {
  matrix: number[][];
  studentNames: string[];
  mentorNames: string[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#142033]/10 bg-white">
      <div className="border-b border-[#142033]/08 px-4 py-3">
        <h3 className="text-sm font-semibold text-[#142033]">Matching matrix</h3>
        <p className="text-xs text-[#142033]/55">
          Cosine compatibility · darker teal = stronger fit
        </p>
      </div>
      <div className="overflow-x-auto p-3">
        <table className="min-w-full border-separate border-spacing-1 text-left text-[11px]">
          <thead>
            <tr>
              <th className="px-2 py-1 font-medium text-[#142033]/50">Leader</th>
              {mentorNames.map((name) => (
                <th
                  key={name}
                  className="max-w-16 truncate px-1 py-1 font-medium text-[#142033]/50"
                >
                  {name.split(" ").slice(-1)[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rowIndex) => {
              const studentKey = studentNames[rowIndex] ?? `student-${rowIndex}`;
              return (
                <tr key={studentKey}>
                  <td className="whitespace-nowrap px-2 py-1 font-medium text-[#142033]/70">
                    {studentKey.split(" ")[0]}
                  </td>
                  {row.map((value, colIndex) => {
                    const intensity = Math.max(0.08, Math.min(1, value));
                    const mentorKey = mentorNames[colIndex] ?? `mentor-${colIndex}`;
                    return (
                      <td key={`${studentKey}-${mentorKey}`} className="px-0.5 py-0.5">
                        <div
                          className="flex h-8 w-12 items-center justify-center rounded-md text-[10px] font-semibold tabular-nums text-white"
                          style={{ backgroundColor: `rgba(2, 128, 144, ${intensity})` }}
                          title={`${formatPct(value)}`}
                        >
                          {Math.round(value * 100)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MentorshipPanel({
  assignment,
  top3,
  sessions,
  heatmap,
  mentors,
  showHeatmap,
}: {
  assignment?: MentorAssignment;
  top3: MentorTop3[];
  sessions: SessionLog[];
  heatmap: DashboardBundle["mentorship"]["heatmap"];
  mentors: MentorProfile[];
  showHeatmap: boolean;
}) {
  const [bookingTopic, setBookingTopic] = useState("Career pathing");
  const [bookingNote, setBookingNote] = useState("");
  const [booked, setBooked] = useState<string | null>(null);
  const mentorById = useMemo(
    () => new Map(mentors.map((mentor) => [mentor.mentor_id, mentor])),
    [mentors],
  );
  const assignedPortrait = assignment ? mentorById.get(assignment.mentor_id) : undefined;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-[#142033]/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3A87B8]">
            Your ESL mentor match
          </p>
          {assignment ? (
            <>
              <div className="mt-3 flex items-start gap-3">
                {assignedPortrait?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={assignedPortrait.image}
                    alt={assignment.mentor_name}
                    className="h-16 w-16 shrink-0 rounded-full object-cover"
                    width={64}
                    height={64}
                  />
                ) : null}
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold text-[#142033]">{assignment.mentor_name}</h3>
                  <p className="mt-1 text-sm text-[#142033]/65">
                    {assignment.mentor_title ?? assignment.mentor_industry} ·{" "}
                    {assignment.mentor_country}
                  </p>
                  {assignedPortrait?.bio ? (
                    <p className="mt-2 text-sm leading-relaxed text-[#142033]/70">
                      {assignedPortrait.bio}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-semibold tabular-nums",
                    scoreTone(assignment.compatibility),
                  )}
                >
                  {formatPct(assignment.compatibility)} fit
                </span>
                {(assignment.languages ?? []).map((language) => (
                  <span
                    key={language}
                    className="rounded-full bg-[#142033]/[0.04] px-2.5 py-1 text-xs text-[#142033]/70"
                  >
                    {language}
                  </span>
                ))}
                {assignedPortrait?.linkedInUrl ? (
                  <a
                    href={assignedPortrait.linkedInUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[#142033]/15 px-2.5 py-1 text-xs font-semibold text-[#3A87B8] hover:border-[#3A87B8]/40"
                  >
                    LinkedIn
                  </a>
                ) : null}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-[#142033]/60">No mentor assignment in this view yet.</p>
          )}

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-[#142033]">Strong alternatives</h4>
            <ul className="mt-3 space-y-2">
              {top3.map((mentor) => {
                const portrait = mentorById.get(mentor.mentor_id);
                return (
                  <li
                    key={mentor.mentor_id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#142033]/08 px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {portrait?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={portrait.image}
                          alt={mentor.mentor_name}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                          width={40}
                          height={40}
                        />
                      ) : null}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#142033]">{mentor.mentor_name}</p>
                        <p className="text-xs text-[#142033]/55">
                          {mentor.industry} · {mentor.country} · {mentor.availability_hrs_per_month}
                          h/mo
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-[#3A87B8]">
                      {formatPct(mentor.score)}
                    </span>
                  </li>
                );
              })}
              {top3.length === 0 ? (
                <li className="text-sm text-[#142033]/55">No alternatives ranked yet.</li>
              ) : null}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl bg-[#142033] p-5 text-white shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#B47828]" aria-hidden />
            <h3 className="text-sm font-semibold">Book a session</h3>
          </div>
          <p className="mt-2 text-sm text-white/70">
            Request time with your assigned mentor. Demo mode logs the request in-session.
          </p>
          <label className="mt-4 block text-xs font-medium text-white/70" htmlFor="topic">
            Topic
          </label>
          <select
            id="topic"
            value={bookingTopic}
            onChange={(event) => setBookingTopic(event.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#B47828]"
          >
            <option className="text-[#142033]">Career pathing</option>
            <option className="text-[#142033]">Application review</option>
            <option className="text-[#142033]">Skills portfolio</option>
            <option className="text-[#142033]">Scholarship strategy</option>
          </select>
          <label className="mt-3 block text-xs font-medium text-white/70" htmlFor="note">
            Note
          </label>
          <textarea
            id="note"
            value={bookingNote}
            onChange={(event) => setBookingNote(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#B47828]"
            placeholder="What should we cover?"
          />
          <button
            type="button"
            onClick={() => setBooked(`${bookingTopic}${bookingNote ? ` — ${bookingNote}` : ""}`)}
            className="mt-4 w-full rounded-full bg-[#B47828] px-4 py-2.5 text-sm font-semibold text-[#142033] transition hover:bg-[#B47828]"
          >
            Request session
          </button>
          {booked ? (
            <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-xs text-[#B47828]">
              Request logged: {booked}
            </p>
          ) : null}
        </section>
      </div>

      {showHeatmap ? (
        <Heatmap
          matrix={heatmap.matrix}
          studentNames={heatmap.student_names}
          mentorNames={heatmap.mentor_names}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#142033]/10 bg-white p-5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#3A87B8]" aria-hidden />
            <h3 className="text-sm font-semibold text-[#142033]">Session log</h3>
          </div>
          <ul className="mt-3 space-y-2">
            {sessions.slice(0, 8).map((session) => (
              <li
                key={session.session_id}
                className="rounded-xl border border-[#142033]/08 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-[#142033]">{session.session_date}</p>
                  <span className="text-xs uppercase tracking-wide text-[#142033]/50">
                    {session.status ?? (session.goals_set ? "completed" : "logged")}
                  </span>
                </div>
                <p className="text-xs text-[#142033]/65">
                  {session.session_duration_mins} min · rating {session.student_rating}/5 ·{" "}
                  {session.topics_discussed.join(", ")}
                </p>
              </li>
            ))}
            {sessions.length === 0 ? (
              <li className="text-sm text-[#142033]/55">No sessions logged yet.</li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#142033]/10 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#142033]">ESL mentor roster</h3>
            <Link
              href="/mentors"
              className="text-xs font-semibold text-[#3A87B8] hover:underline"
            >
              Open public directory
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {mentors.map((mentor) => (
              <li
                key={mentor.mentor_id}
                className="flex items-start justify-between gap-3 rounded-xl border border-[#142033]/08 px-3 py-2"
              >
                <div className="flex min-w-0 items-start gap-3">
                  {mentor.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mentor.image}
                      alt={mentor.name}
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                      width={44}
                      height={44}
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#142033]">{mentor.name}</p>
                    <p className="text-xs text-[#142033]/60">
                      {mentor.industry} · {mentor.country} · {mentor.availability_hrs_per_month}h/mo
                    </p>
                    {mentor.bio ? (
                      <p className="mt-1 line-clamp-2 text-xs text-[#142033]/55">{mentor.bio}</p>
                    ) : null}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] text-[#3A87B8]">
                  {mentor.languages.join(" / ")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function OverviewPanel({
  overview,
  recommendations,
  applications,
  onOpenTab,
  isAdmin,
}: {
  overview: LeaderOverview | null | undefined;
  recommendations: Recommendation[];
  applications: LeaderApplication[];
  onOpenTab: (tab: LeaderTabId) => void;
  isAdmin: boolean;
}) {
  if (!overview) {
    return (
      <div className="rounded-2xl border border-dashed border-[#142033]/15 bg-white p-6 text-sm text-[#142033]/65">
        {isAdmin
          ? "Select a focus leader above to open a personal Overview, or stay on Opportunities / Risk / Analytics for cohort evidence."
          : "Overview is not available for this account yet."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#142033]/10 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3A87B8]">
          Welcome back
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#142033]">Hi, {overview.greeting_name}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#142033]/75">
          {overview.goal_text}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {overview.interest_tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#142033]/[0.04] px-2.5 py-1 text-xs text-[#142033]/70"
            >
              {tag.replaceAll("_", " ")}
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overview.activity_stats.map((stat) => (
          <KpiCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#142033]/10 bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#142033]">Upcoming mentor session</h3>
            <button
              type="button"
              onClick={() => onOpenTab("mentors")}
              className="text-xs font-semibold text-[#3A87B8] hover:underline"
            >
              Open Mentors
            </button>
          </div>
          {overview.next_session ? (
            <div className="mt-3 rounded-xl border border-[#3A87B8]/20 bg-[#3A87B8]/[0.06] p-4">
              <p className="text-sm font-semibold text-[#142033]">
                {overview.next_session.session_date}
              </p>
              <p className="mt-1 text-xs text-[#142033]/65">
                {overview.next_session.session_duration_mins} min ·{" "}
                {overview.next_session.topics_discussed.join(", ")} ·{" "}
                {overview.assigned_mentor?.mentor_name ?? "Assigned mentor"}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#142033]/60">
              No upcoming session yet. Book one from ESL Mentors when you are ready.
            </p>
          )}
          {overview.assigned_mentor ? (
            <p className="mt-3 text-xs text-[#142033]/55">
              Match fit {formatPct(overview.assigned_mentor.compatibility)} with{" "}
              {overview.assigned_mentor.mentor_name}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-[#142033]/10 bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#142033]">Worth a closer look</h3>
            <button
              type="button"
              onClick={() => onOpenTab("opportunities")}
              className="text-xs font-semibold text-[#3A87B8] hover:underline"
            >
              All opportunities
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {(overview.worth_a_look.length ? overview.worth_a_look : recommendations)
              .slice(0, 3)
              .map((item) => (
                <li key={item.opp_id} className="rounded-xl border border-[#142033]/08 px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-[#142033]">{item.title}</p>
                      <p className="text-xs text-[#142033]/55">
                        {item.org_name} · due {item.deadline}
                      </p>
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-[#3A87B8]">
                      {formatPct(item.match_score)}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
          {overview.coaching_nudge ? (
            <button
              type="button"
              onClick={() => onOpenTab("coaching")}
              className="mt-4 w-full rounded-xl border border-[#DC6414]/30 bg-[#DC6414]/10 px-3 py-2 text-left text-xs font-medium text-[#142033]"
            >
              {overview.coaching_nudge}
            </button>
          ) : null}
        </section>
      </div>

      <section className="rounded-2xl border border-[#142033]/10 bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#142033]">Saved & in progress</h3>
          <button
            type="button"
            onClick={() => onOpenTab("applications")}
            className="text-xs font-semibold text-[#3A87B8] hover:underline"
          >
            Applications
          </button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {applications.slice(0, 4).map((item) => (
            <div
              key={item.application_id}
              className="rounded-xl border border-[#142033]/08 px-3 py-2"
            >
              <p className="text-sm font-medium text-[#142033]">{item.title}</p>
              <p className="text-xs text-[#142033]/55">
                {STAGE_LABEL[item.stage]} · {item.updated_label}
              </p>
            </div>
          ))}
          {applications.length === 0 ? (
            <p className="text-sm text-[#142033]/55">No saved applications yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ApplicationsPanel({ applications }: { applications: LeaderApplication[] }) {
  const stages: ApplicationStage[] = ["active", "under_review", "interview", "accepted"];
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#142033]/70">
        Your application pipeline across Active, Under review, Interview, and Accepted. Demo stages
        are derived from your ranked opportunities so Capstone judges can walk the Canva flow.
      </p>
      <div className="grid gap-3 lg:grid-cols-4">
        {stages.map((stage) => {
          const rows = applications.filter((item) => item.stage === stage);
          return (
            <section
              key={stage}
              className="rounded-2xl border border-[#142033]/10 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#142033]">{STAGE_LABEL[stage]}</h3>
                <span className="rounded-full bg-[#142033]/[0.05] px-2 py-0.5 text-xs font-semibold tabular-nums text-[#142033]">
                  {rows.length}
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {rows.map((item) => (
                  <li
                    key={item.application_id}
                    className="rounded-xl border border-[#142033]/08 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-[#142033]">{item.title}</p>
                    <p className="text-xs text-[#142033]/55">
                      {item.org_name} · {item.updated_label}
                    </p>
                    <span
                      className={cn(
                        "mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        stageTone(item.stage),
                      )}
                    >
                      {formatPct(item.match_score)} match
                    </span>
                  </li>
                ))}
                {rows.length === 0 ? (
                  <li className="text-xs text-[#142033]/50">Nothing in this stage yet.</li>
                ) : null}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CommunityPanel({ posts }: { posts: CommunityPost[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#3A87B8]/20 bg-[#3A87B8]/[0.06] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3A87B8]">
          ESL Community
        </p>
        <p className="mt-2 text-sm text-[#142033]/75">
          Peer posts, masterclasses, and light accountability energy. This is a product surface for
          leaders — not Capstone model evidence.
        </p>
      </div>
      <div className="grid gap-3">
        {posts.map((post) => (
          <article
            key={post.post_id}
            className="rounded-2xl border border-[#142033]/10 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#142033]/[0.05] px-2.5 py-0.5 text-[11px] font-semibold text-[#142033]/70">
                {post.tag}
              </span>
              <span className="text-xs text-[#142033]/50">{post.when}</span>
            </div>
            <h3 className="mt-2 text-base font-semibold text-[#142033]">{post.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#142033]/75">{post.body}</p>
            <p className="mt-3 text-xs font-medium text-[#3A87B8]">
              {post.author} · {post.role_label}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function CoachingPanel({ risk }: { risk: RiskRow | null | undefined }) {
  if (!risk) {
    return (
      <div className="rounded-2xl border border-[#142033]/10 bg-white p-6 text-sm text-[#142033]/65">
        No personal coaching signal for this view. Keep applying and meeting your mentor on a steady
        rhythm.
      </div>
    );
  }

  const isHigh = risk.risk_level === "high" || risk.risk_level === "medium";
  return (
    <div className="space-y-4">
      <section
        className={cn(
          "rounded-2xl border p-5",
          isHigh
            ? "border-[#DC6414]/30 bg-[#DC6414]/10"
            : "border-[#1B5E20]/25 bg-[#1B5E20]/[0.08]",
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#142033]/60">
          Soft coaching only
        </p>
        <h3 className="mt-2 text-lg font-semibold text-[#142033]">
          {isHigh ? "You may be falling behind — book a check-in" : "You are in a healthy rhythm"}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#142033]/75">
          {risk.outreach_prompt ??
            "Keep logging sessions and finishing applications. Small weekly actions compound."}
        </p>
        <p className="mt-3 text-xs text-[#142033]/55">
          Leaders never see the full cohort risk table. This card is personal guidance only.
        </p>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          label="Days since login"
          value={risk.features.days_since_last_login}
          hint="Lower is better"
        />
        <KpiCard
          label="Days since mentor session"
          value={risk.features.days_since_last_mentor_session}
          hint="Aim under 14"
        />
        <KpiCard
          label="Profile completeness"
          value={formatPct(risk.features.profile_completeness)}
          hint="Fill interests & goals"
        />
      </div>
    </div>
  );
}

function AiCoachPopup({
  open,
  onClose,
  studentId,
  studentName,
  starterPrompts,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  studentId: string | null;
  studentName: string | null;
  starterPrompts: string[];
  onNavigate?: (tab: LeaderTabId) => void;
}) {
  const welcomeContent = studentName
    ? `Hi ${studentName.split(" ")[0]} — I am Kay, JointHub Agent in AI Coach mode. Ask me anything about opportunities, ESL mentors, applications, risk coaching, essays, or your week plan. Tap a prompt or keep the conversation going.`
    : "Select a leader focus (admin) or sign in as a leader to chat with Kay, the JointHub Agent coach.";

  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: welcomeContent,
      follow_ups: starterPrompts.slice(0, 3),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const latestFollowUps = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const msg = messages[i];
      if (msg.role === "assistant" && msg.follow_ups && msg.follow_ups.length > 0) {
        return msg.follow_ups;
      }
    }
    return starterPrompts.slice(0, 3);
  }, [messages, starterPrompts]);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: studentName
          ? `Hi ${studentName.split(" ")[0]} — I am Kay, JointHub Agent in AI Coach mode. Ask me anything about opportunities, ESL mentors, applications, risk coaching, essays, or your week plan. Tap a prompt or keep the conversation going.`
          : "Select a leader focus (admin) or sign in as a leader to chat with Kay, the JointHub Agent coach.",
        follow_ups: starterPrompts.slice(0, 3),
      },
    ]);
    setInput("");
    setError(null);
  }, [studentName, starterPrompts]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const node = scrollRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, open, isSending]);

  function actionToTab(action: string): LeaderTabId | null {
    const lower = action.toLowerCase();
    if (lower.includes("opportunit")) return "opportunities";
    if (lower.includes("mentor")) return "mentors";
    if (lower.includes("application")) return "applications";
    if (lower.includes("stay on track") || lower.includes("coaching")) return "coaching";
    if (lower.includes("dropout") || lower.includes("risk")) return "risk";
    if (lower.includes("overview")) return "overview";
    if (lower.includes("community")) return "community";
    if (lower.includes("analytics")) return "analytics";
    return null;
  }

  async function sendMessage(raw: string) {
    const message = raw.trim();
    if (!message || isSending) return;
    if (!studentId) {
      setError("A leader context is required before chatting.");
      return;
    }

    const history = messagesRef.current
      .filter((item) => item.id !== "welcome")
      .map((item) => ({ role: item.role, content: item.content }))
      .slice(-12);

    const userMessage: AdvisorMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/jointhub/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          student_id: studentId,
          history,
        }),
      });
      const payload = (await response.json()) as {
        answer?: string;
        citations?: string[];
        suggested_actions?: string[];
        follow_ups?: string[];
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error ?? "Kay could not answer just now.");
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: payload.answer ?? "No answer returned.",
          citations: payload.citations,
          suggested_actions: payload.suggested_actions,
          follow_ups: payload.follow_ups,
        },
      ]);
    } catch {
      setError("Could not reach the AI Coach.");
    } finally {
      setIsSending(false);
    }
  }

  if (!open) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end p-4 sm:p-6">
      <div
        role="dialog"
        aria-modal="false"
        aria-label="AI Coach Kay, JointHub Agent"
        className="pointer-events-auto flex h-[min(36rem,calc(100vh-5.5rem))] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-[#142033]/12 bg-white shadow-[0_20px_60px_rgba(20,32,51,0.28)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#142033]/08 bg-[#142033] px-4 py-3 text-white">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B47828]">
              AI Coach
            </p>
            <p className="mt-1 text-sm font-semibold">Kay · JointHub Agent</p>
            <p className="mt-0.5 text-xs text-white/70">
              Live coaching on opportunities, ESL mentors, applications, and next steps.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
            aria-label="Close AI Coach"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                message.role === "user"
                  ? "ml-auto bg-[#3A87B8] text-white"
                  : "bg-[#142033]/[0.04] text-[#142033]",
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.citations && message.citations.length > 0 ? (
                <ul className="mt-2 space-y-1 border-t border-[#142033]/10 pt-2 text-[11px] text-[#142033]/60">
                  {message.citations.map((citation) => (
                    <li key={citation}>• {citation}</li>
                  ))}
                </ul>
              ) : null}
              {message.suggested_actions && message.suggested_actions.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {message.suggested_actions.map((action) => {
                    const tab = actionToTab(action);
                    if (tab && onNavigate) {
                      return (
                        <button
                          key={action}
                          type="button"
                          onClick={() => {
                            onNavigate(tab);
                            onClose();
                          }}
                          className="rounded-full bg-white px-2 py-0.5 text-left text-[11px] font-medium text-[#3A87B8] underline-offset-2 hover:underline"
                        >
                          {action}
                        </button>
                      );
                    }
                    return (
                      <span
                        key={action}
                        className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[#3A87B8]"
                      >
                        {action}
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ))}
          {isSending ? (
            <p className="text-xs font-medium text-[#142033]/55" aria-live="polite">
              Kay is thinking…
            </p>
          ) : null}
        </div>

        <div className="border-t border-[#142033]/08 px-3 pt-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#142033]/45">
            Keep talking
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {latestFollowUps.slice(0, 4).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendMessage(prompt)}
                disabled={!studentId || isSending}
                className="shrink-0 rounded-full border border-[#142033]/10 bg-[#F4F0E6] px-3 py-1.5 text-[11px] font-medium text-[#142033] hover:border-[#3A87B8]/40 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <form
          className="border-t border-[#142033]/08 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage(input);
          }}
        >
          {error ? (
            <p
              className="mb-2 rounded-lg bg-[#E0312E]/10 px-3 py-2 text-xs text-[#E0312E]"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="flex items-end gap-2">
            <label className="sr-only" htmlFor="ai-coach-input">
              Ask AI Coach Kay
            </label>
            <textarea
              id="ai-coach-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(input);
                }
              }}
              rows={2}
              disabled={!studentId || isSending}
              placeholder={
                studentId
                  ? "Message Kay — try “why this mentor?” or “plan my week”"
                  : "Leader context required"
              }
              className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-[#142033]/15 px-3 py-2 text-sm outline-none focus:border-[#3A87B8] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!studentId || isSending || !input.trim()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3A87B8] text-white transition hover:bg-[#2F739E] disabled:opacity-50"
              aria-label="Send message to AI Coach"
            >
              <Send className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MentorCaseloadPanel({
  overview,
  onSelectMentee,
  selectedStudentId,
}: {
  overview: MentorOverview | null | undefined;
  onSelectMentee: (studentId: string) => void;
  selectedStudentId: string;
}) {
  if (!overview) {
    return (
      <div className="rounded-2xl border border-[#142033]/10 bg-white p-6 text-sm text-[#142033]/70">
        No mentor caseload is loaded for this demo account.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#142033]/10 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3A87B8]">
          Mentor workspace
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[#142033]">
          Welcome back, {overview.greeting_name}
        </h2>
        <p className="mt-1 text-sm text-[#142033]/65">
          {overview.mentor_title} · {overview.mentor_industry} · {overview.mentor_country}
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#142033]/75]">
          {overview.focus_note}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Assigned leaders" value={overview.mentee_count} hint="Active caseload" />
          <KpiCard
            label="High-risk mentees"
            value={overview.high_risk_count}
            hint="Need check-in soon"
          />
          <KpiCard
            label="Sessions logged"
            value={overview.sessions_logged}
            hint="Demo session history"
          />
          <KpiCard
            label="Average fit"
            value={overview.average_fit_pct != null ? `${overview.average_fit_pct}%` : "—"}
            hint="Match compatibility"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#142033]/10 bg-white shadow-sm">
        <div className="border-b border-[#142033]/08 px-4 py-3">
          <h3 className="text-sm font-semibold text-[#142033]">Your ESL leaders</h3>
          <p className="text-xs text-[#142033]/60">
            Select a mentee to focus coaching, sessions, and Kay prompts on their profile.
          </p>
        </div>
        <div className="divide-y divide-[#142033]/08">
          {overview.mentees.map((mentee) => {
            const active = selectedStudentId === mentee.student_id;
            return (
              <button
                key={mentee.student_id}
                type="button"
                onClick={() => onSelectMentee(mentee.student_id)}
                className={cn(
                  "flex w-full flex-col gap-2 px-4 py-4 text-left transition sm:flex-row sm:items-center sm:justify-between",
                  active ? "bg-[#3A87B8]/08" : "hover:bg-[#142033]/[0.03]",
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#142033]">{mentee.full_name}</p>
                    {mentee.risk_level ? (
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize",
                          riskTone(mentee.risk_level),
                        )}
                      >
                        {mentee.risk_level} risk
                      </span>
                    ) : null}
                    {active ? (
                      <span className="rounded-full bg-[#3A87B8] px-2 py-0.5 text-[11px] font-semibold text-white">
                        Focused
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-[#142033]/65">
                    {mentee.country} · {mentee.programme} · {formatPct(mentee.compatibility)} fit
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-[#142033]/70]">
                    {mentee.career_goal_text}
                  </p>
                  {mentee.top_opportunity ? (
                    <p className="mt-1 text-xs text-[#3A87B8]">
                      Top opportunity: {mentee.top_opportunity}
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0 text-xs text-[#142033]/55 sm:text-right">
                  <p>
                    {mentee.days_since_last_session != null
                      ? `${mentee.days_since_last_session}d since session`
                      : "No session logged"}
                  </p>
                  <p className="mt-1">{mentee.applications_in_flight} apps in flight</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function MentorSessionsPanel({ sessions }: { sessions: SessionLog[] }) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-[#142033]/10 bg-white p-6 text-sm text-[#142033]/70">
        No sessions are logged for this mentor caseload yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <article
          key={session.session_id}
          className="rounded-2xl border border-[#142033]/10 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[#142033]">
                Session · {session.session_date}
              </p>
              <p className="mt-1 text-xs text-[#142033]/60">
                Leader {session.student_id.slice(0, 8)} · {session.session_duration_mins} mins ·{" "}
                {session.status ?? "logged"}
              </p>
            </div>
            <span className="rounded-full bg-[#142033]/[0.05] px-2.5 py-1 text-xs font-semibold tabular-nums text-[#142033]">
              ★ {session.student_rating.toFixed(1)}
            </span>
          </div>
          <p className="mt-2 text-sm text-[#142033]/75">
            Topics: {session.topics_discussed.join(", ") || "General check-in"}
          </p>
          <p className="mt-1 text-xs text-[#142033]/55">
            {session.goals_set ? "Goals set" : "No goals captured"} ·{" "}
            {session.days_since_last_session}d since prior touchpoint
          </p>
        </article>
      ))}
    </div>
  );
}

function RiskPanel({
  rows,
  isAdmin,
  isMentor,
  onOutreach,
  outreachStatus,
}: {
  rows: RiskRow[];
  isAdmin: boolean;
  isMentor?: boolean;
  onOutreach: (studentId: string) => void;
  outreachStatus: Record<string, string>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#142033]/10 bg-white shadow-sm">
      <div className="border-b border-[#142033]/08 px-4 py-3">
        <h3 className="text-sm font-semibold text-[#142033]">
          {isAdmin
            ? "Cohort dropout risk"
            : isMentor
              ? "Mentee dropout risk"
              : "Your dropout risk"}
        </h3>
        <p className="text-xs text-[#142033]/60">
          {isAdmin
            ? "Full cohort view · logistic regression probability · threshold 0.65 · RF feature importance for top factor"
            : isMentor
              ? "Leaders assigned to you · soft coaching signals only · no public scoreboard"
              : "Personal risk signal for students and mentors · probability threshold 0.65 · top factor from model features"}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#142033]/[0.03] text-[11px] uppercase tracking-[0.12em] text-[#142033]/55">
            <tr>
              <th className="px-4 py-3 font-semibold">Leader</th>
              <th className="px-4 py-3 font-semibold">Risk</th>
              <th className="px-4 py-3 font-semibold">Probability</th>
              <th className="px-4 py-3 font-semibold">Top factor</th>
              <th className="px-4 py-3 font-semibold">Signals</th>
              {isAdmin ? <th className="px-4 py-3 font-semibold">Action</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.student_id} className="border-t border-[#142033]/08 align-top">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#142033]">{row.full_name}</p>
                  <p className="text-xs text-[#142033]/55">{row.country}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                      riskTone(row.risk_level),
                    )}
                  >
                    {row.risk_level}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold tabular-nums text-[#142033]">
                  {formatPct(row.risk_probability)}
                </td>
                <td className="px-4 py-3 text-[#142033]/75">
                  {row.top_risk_factor.replaceAll("_", " ")}
                </td>
                <td className="px-4 py-3 text-xs text-[#142033]/65">
                  login {row.features.days_since_last_login}d · mentor{" "}
                  {row.features.days_since_last_mentor_session}d · GPA{" "}
                  {row.features.gpa_score.toFixed(2)}
                </td>
                {isAdmin ? (
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onOutreach(row.student_id)}
                      className="rounded-full bg-[#3A87B8] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2F739E]"
                    >
                      Queue outreach
                    </button>
                    {outreachStatus[row.student_id] ? (
                      <p className="mt-1 max-w-40 text-[11px] text-[#142033]/55">
                        {outreachStatus[row.student_id]}
                      </p>
                    ) : null}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsPanel({
  metrics,
  nlp,
  kpis,
}: {
  metrics: ModelMetrics;
  nlp: NlpRow[];
  kpis: DashboardBundle["kpis"];
}) {
  const metricCards = [
    {
      label: "Precision@5",
      value: formatPct(metrics.recommendation_precision_at_5),
      target: `target ${formatPct(metrics.recommendation_target)}`,
      pass: metrics.recommendation_precision_at_5 >= metrics.recommendation_target,
    },
    {
      label: "Mentor match F1",
      value: formatPct(metrics.mentor_match_f1),
      target: `target ${formatPct(metrics.mentor_match_target)}`,
      pass: metrics.mentor_match_f1 >= metrics.mentor_match_target,
    },
    {
      label: "Dropout AUC-ROC",
      value: metrics.dropout_auc_roc.toFixed(2),
      target: `target ${metrics.dropout_target.toFixed(2)}`,
      pass: metrics.dropout_auc_roc >= metrics.dropout_target,
    },
    {
      label: "NLP entity recall",
      value: formatPct(metrics.nlp_entity_recall_estimate),
      target: `target ${formatPct(metrics.nlp_target)}`,
      pass: metrics.nlp_entity_recall_estimate >= metrics.nlp_target,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-[#142033]/10 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#142033]/55">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[#142033]">{card.value}</p>
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                card.pass ? "text-[#1B5E20]" : "text-[#E0312E]",
              )}
            >
              {card.pass ? "On target" : "Below target"} · {card.target}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Registered users" value={kpis.registered_users} />
        <KpiCard label="Opportunities matched" value={kpis.opportunities_matched} />
        <KpiCard label="Active mentor pairs" value={kpis.active_mentor_pairs} />
        <KpiCard label="At-risk flagged" value={kpis.at_risk_students_flagged} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#142033]/10 bg-white p-5">
          <h3 className="text-sm font-semibold text-[#142033]">
            Feature importance (Random Forest)
          </h3>
          <ul className="mt-3 space-y-2">
            {Object.entries(metrics.random_forest_feature_importance)
              .sort((a, b) => b[1] - a[1])
              .map(([feature, weight]) => (
                <li key={feature}>
                  <div className="mb-1 flex justify-between text-xs text-[#142033]/70">
                    <span>{feature.replaceAll("_", " ")}</span>
                    <span className="tabular-nums">{formatPct(weight)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#142033]/10">
                    <div
                      className="h-full rounded-full bg-[#3A87B8]"
                      style={{ width: `${Math.round(weight * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#142033]/10 bg-white p-5">
          <h3 className="text-sm font-semibold text-[#142033]">NLP goal extracts</h3>
          <ul className="mt-3 space-y-3">
            {nlp.slice(0, 6).map((row) => (
              <li key={row.student_id} className="rounded-xl border border-[#142033]/08 p-3">
                <p className="text-sm font-medium text-[#142033]">{row.full_name}</p>
                <p className="mt-1 text-xs text-[#142033]/65">{row.career_goal_text}</p>
                <p className="mt-2 text-xs text-[#3A87B8]">{row.recommendation_sentence}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {[...row.entities.ORG, ...row.entities.SKILL, ...row.entities.GPE]
                    .slice(0, 6)
                    .map((entity) => (
                      <span
                        key={`${row.student_id}-${entity}`}
                        className="rounded-full bg-[#142033]/[0.04] px-2 py-0.5 text-[11px] text-[#142033]/70"
                      >
                        {entity}
                      </span>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export function DashboardApp({ initialData }: { initialData: DashboardResponse }) {
  const router = useRouter();
  const isAdmin = initialData.role === "admin";
  const isMentor = initialData.role === "mentor";
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState<LeaderTabId>(
    isAdmin ? "risk" : isMentor ? "caseload" : "overview",
  );
  const [selectedStudent, setSelectedStudent] = useState(
    initialData.student?.student_id ??
      initialData.mentor_overview?.mentees[0]?.student_id ??
      "",
  );
  const [outreachStatus, setOutreachStatus] = useState<Record<string, string>>({});
  const [coachOpen, setCoachOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const tabs = isAdmin ? ADMIN_TABS : isMentor ? MENTOR_TABS : LEADER_TABS;

  const assignment = useMemo(() => {
    if ((data.role === "admin" || data.role === "mentor") && selectedStudent) {
      return data.mentorship.assignments.find((row) => row.student_id === selectedStudent);
    }
    return data.mentorship.assignments[0];
  }, [data, selectedStudent]);

  const top3 = useMemo(() => {
    const key = selectedStudent || data.student?.student_id || Object.keys(data.mentorship.top3)[0];
    const ranked = key ? (data.mentorship.top3[key] ?? []) : [];
    const assignedId = assignment?.mentor_id;
    if (!assignedId) return ranked;
    // Keep alternatives distinct from the assigned ESL mentor for matching consistency.
    const distinct = ranked.filter((item) => item.mentor_id !== assignedId);
    return distinct.length > 0 ? distinct : ranked.slice(1);
  }, [assignment?.mentor_id, data, selectedStudent]);

  const leaderRisk =
    data.risk.find((row) => row.student_id === selectedStudent) ?? data.risk[0] ?? null;
  const advisorStudentId = selectedStudent || data.student?.student_id || null;
  const advisorName =
    data.students?.find((row) => row.student_id === advisorStudentId)?.full_name ??
    data.student?.full_name ??
    null;
  const starterPrompts =
    data.mentor_overview?.starter_prompts ??
    data.overview?.starter_prompts ??
    [
      "What should I apply to next?",
      "Who is my mentor and why?",
      "Am I falling behind?",
    ];

  async function reload(studentId?: string) {
    const query = studentId ? `?student_id=${encodeURIComponent(studentId)}` : "";
    const response = await fetch(`/api/jointhub/dashboard${query}`, { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const next = (await response.json()) as DashboardResponse;
    setData(next);
  }

  async function handleSignOut() {
    await fetch("/api/jointhub/auth", { method: "DELETE" });
    router.push("/dashboard/login");
    router.refresh();
  }

  async function handleOutreach(studentId: string) {
    const response = await fetch("/api/jointhub/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: studentId }),
    });
    const payload = (await response.json()) as { status?: string; note?: string; error?: string };
    setOutreachStatus((prev) => ({
      ...prev,
      [studentId]:
        payload.error ?? `${payload.status ?? "queued"} — ${payload.note ?? "Outreach prepared."}`,
    }));
  }

  function handleSelectMentee(studentId: string) {
    setSelectedStudent(studentId);
    startTransition(() => {
      void reload(studentId);
    });
  }

  const roleLabel = isAdmin
    ? "Programme admin"
    : isMentor
      ? "Mentor workspace"
      : "Leader workspace";

  return (
    <div className="min-h-screen bg-[#F4F0E6] text-[#142033]">
      <header className="border-b border-white/10 bg-black text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/simplejoint-puzzle-logo.png"
              alt="SimpleJoint Trust"
              className="h-10 w-10 shrink-0 rounded-lg bg-black object-contain"
              width={40}
              height={40}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-white">Dashboard</p>
              <p className="truncate text-xs text-white/65">{roleLabel}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/mentors"
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
            >
              ESL Mentors
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
        {isAdmin ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Registered users" value={data.kpis.registered_users} />
            <KpiCard label="Opportunities matched" value={data.kpis.opportunities_matched} />
            <KpiCard label="Active mentor pairs" value={data.kpis.active_mentor_pairs} />
            <KpiCard label="At-risk students flagged" value={data.kpis.at_risk_students_flagged} />
          </div>
        ) : null}

        {(isAdmin || isMentor) && data.students ? (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#142033]/10 bg-white p-3">
            <label
              htmlFor="student-filter"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[#142033]/55"
            >
              {isMentor ? "Focus mentee" : "Focus leader"}
            </label>
            <select
              id="student-filter"
              value={selectedStudent}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedStudent(value);
                startTransition(() => {
                  void reload(value || undefined);
                });
              }}
              className="min-w-56 rounded-lg border border-[#142033]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#3A87B8]"
            >
              {isAdmin ? <option value="">All leaders (admin)</option> : null}
              {data.students.map((student) => (
                <option key={student.student_id} value={student.student_id}>
                  {student.full_name} · {student.country}
                </option>
              ))}
            </select>
            {isPending ? <span className="text-xs text-[#142033]/50">Updating…</span> : null}
          </div>
        ) : null}

        <nav className="flex flex-wrap gap-2" aria-label="Dashboard modules">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-[#3A87B8] text-white"
                    : "border border-[#142033]/10 bg-white text-[#142033]/75 hover:border-[#3A87B8]/40",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </nav>

        {tab === "overview" ? (
          <OverviewPanel
            overview={data.overview}
            recommendations={data.recommendations}
            applications={data.applications ?? []}
            onOpenTab={setTab}
            isAdmin={isAdmin}
          />
        ) : null}
        {tab === "caseload" ? (
          <MentorCaseloadPanel
            overview={data.mentor_overview}
            onSelectMentee={handleSelectMentee}
            selectedStudentId={selectedStudent}
          />
        ) : null}
        {tab === "sessions" ? (
          <MentorSessionsPanel sessions={data.mentorship.sessions} />
        ) : null}
        {tab === "opportunities" ? (
          <OpportunitiesPanel items={data.recommendations} sentence={data.personalised_sentence} />
        ) : null}
        {tab === "mentors" ? (
          <MentorshipPanel
            assignment={assignment}
            top3={top3}
            sessions={data.mentorship.sessions}
            heatmap={data.mentorship.heatmap}
            mentors={data.mentorship.mentors}
            showHeatmap={isAdmin}
          />
        ) : null}
        {tab === "applications" ? (
          <ApplicationsPanel applications={data.applications ?? []} />
        ) : null}
        {tab === "community" ? <CommunityPanel posts={data.community ?? []} /> : null}
        {tab === "coaching" ? <CoachingPanel risk={leaderRisk} /> : null}
        {tab === "risk" ? (
          <RiskPanel
            rows={data.risk}
            isAdmin={isAdmin}
            isMentor={isMentor}
            onOutreach={handleOutreach}
            outreachStatus={outreachStatus}
          />
        ) : null}
        {tab === "analytics" ? (
          <AnalyticsPanel metrics={data.metrics} nlp={data.nlp} kpis={data.kpis} />
        ) : null}
      </main>

      {!coachOpen ? (
        <button
          type="button"
          onClick={() => setCoachOpen(true)}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#3A87B8] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(58,135,184,0.45)] transition hover:bg-[#2F739E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A87B8] sm:bottom-6 sm:right-6"
          aria-haspopup="dialog"
          aria-expanded={false}
        >
          <MessageSquareText className="h-4 w-4" aria-hidden />
          AI Coach
        </button>
      ) : null}

      <AiCoachPopup
        open={coachOpen}
        onClose={() => setCoachOpen(false)}
        studentId={advisorStudentId}
        studentName={advisorName}
        starterPrompts={starterPrompts}
        onNavigate={setTab}
      />
    </div>
  );
}
