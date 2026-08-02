"use client";

import {
  AlertTriangle,
  BookOpen,
  Calendar,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type {
  DashboardBundle,
  MentorAssignment,
  ModelMetrics,
  NlpRow,
  Recommendation,
  RiskRow,
  SessionLog,
} from "@/lib/jointhub/types";
import { cn } from "@/lib/utils";

type TabId = "opportunities" | "mentorship" | "risk" | "analytics";

type DashboardResponse = DashboardBundle & {
  students?: Array<{
    student_id: string;
    full_name: string;
    email: string;
    country: string;
  }>;
};

const TABS: Array<{ id: TabId; label: string; icon: typeof Target }> = [
  { id: "opportunities", label: "Opportunities", icon: Target },
  { id: "mentorship", label: "Mentor Hub", icon: Users },
  { id: "risk", label: "Dropout risk", icon: AlertTriangle },
  { id: "analytics", label: "Analytics", icon: LayoutDashboard },
];

function formatPct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function scoreTone(score: number): string {
  if (score >= 0.75) return "bg-[#F4B942] text-[#0D1B2A]";
  if (score >= 0.55) return "bg-[#028090]/15 text-[#028090]";
  return "bg-[#0D1B2A]/10 text-[#0D1B2A]";
}

function riskTone(level: RiskRow["risk_level"]): string {
  if (level === "high") return "bg-[#C0392B]/12 text-[#C0392B] border-[#C0392B]/30";
  if (level === "medium") return "bg-[#F57F17]/12 text-[#F57F17] border-[#F57F17]/30";
  return "bg-[#1B5E20]/12 text-[#1B5E20] border-[#1B5E20]/30";
}

function KpiCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-[#0D1B2A]/10 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0D1B2A]/55">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-[#0D1B2A]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#0D1B2A]/55">{hint}</p> : null}
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
      <div className="rounded-2xl border border-[#028090]/20 bg-gradient-to-r from-[#028090]/10 to-white p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-[#028090]" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#028090]">
              Curated for you
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#0D1B2A]/80">
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
            className="grid gap-3 rounded-2xl border border-[#0D1B2A]/10 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-[#0D1B2A]">{item.title}</h3>
                {item.is_verified ? (
                  <span className="rounded-full bg-[#028090]/12 px-2 py-0.5 text-[11px] font-semibold text-[#028090]">
                    Verified
                  </span>
                ) : null}
                {item.is_scam_flag ? (
                  <span className="rounded-full bg-[#C0392B]/12 px-2 py-0.5 text-[11px] font-semibold text-[#C0392B]">
                    Scam flag
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-[#0D1B2A]/65">
                {item.org_name} · {item.type} · Deadline {item.deadline}
              </p>
              {item.description ? (
                <p className="mt-2 text-sm leading-relaxed text-[#0D1B2A]/75">{item.description}</p>
              ) : null}
              {item.interest_overlap?.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.interest_overlap.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#0D1B2A]/10 bg-[#0D1B2A]/[0.03] px-2 py-0.5 text-[11px] text-[#0D1B2A]/70"
                    >
                      {tag.replaceAll("_", " ")}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex flex-row items-center gap-3 md:flex-col md:items-end">
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
                className="inline-flex items-center gap-1 rounded-full bg-[#028090] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#026f7d]"
              >
                Apply
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </article>
        ))}
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#0D1B2A]/15 bg-white p-6 text-sm text-[#0D1B2A]/65">
            No ranked opportunities for this profile yet.
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
    <div className="overflow-x-auto rounded-2xl border border-[#0D1B2A]/10 bg-white p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#0D1B2A]/55">
        Matching matrix (cosine compatibility)
      </p>
      <table className="min-w-full border-separate border-spacing-1 text-left text-[11px]">
        <thead>
          <tr>
            <th className="p-1 font-medium text-[#0D1B2A]/50">Scholar \\ Mentor</th>
            {mentorNames.map((name) => (
              <th
                key={name}
                className="max-w-20 truncate p-1 font-medium text-[#0D1B2A]/60"
                title={name}
              >
                {name.split(" ")[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, rowIndex) => {
            const studentKey = studentNames[rowIndex] ?? `student-${rowIndex}`;
            return (
              <tr key={studentKey}>
                <th className="whitespace-nowrap p-1 text-left font-medium text-[#0D1B2A]/70">
                  {studentKey.split(" ")[0]}
                </th>
                {row.map((value, colIndex) => {
                  const mentorKey = mentorNames[colIndex] ?? `mentor-${colIndex}`;
                  const intensity = Math.max(0.08, Math.min(1, value));
                  return (
                    <td
                      key={`${studentKey}__${mentorKey}`}
                      className="rounded-md p-2 text-center font-semibold tabular-nums text-[#0D1B2A]"
                      style={{
                        backgroundColor: `rgba(2, 128, 144, ${intensity * 0.85})`,
                        color: intensity > 0.45 ? "#fff" : "#0D1B2A",
                      }}
                      title={`${studentKey} × ${mentorKey}: ${formatPct(value)}`}
                    >
                      {Math.round(value * 100)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MentorshipPanel({
  assignment,
  top3,
  sessions,
  heatmap,
  mentors,
}: {
  assignment: MentorAssignment | undefined;
  top3: Array<{
    mentor_id: string;
    mentor_name: string;
    title?: string;
    industry: string;
    country: string;
    score: number;
    skills_offered?: string[];
    availability_hrs_per_month: number;
  }>;
  sessions: SessionLog[];
  heatmap: DashboardBundle["mentorship"]["heatmap"];
  mentors: DashboardBundle["mentorship"]["mentors"];
}) {
  const [bookingTopic, setBookingTopic] = useState("Career pathing");
  const [bookingNote, setBookingNote] = useState("");
  const [booked, setBooked] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-[#0D1B2A]/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#028090]">
            Assigned mentor
          </p>
          {assignment ? (
            <div className="mt-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-[#0D1B2A]">{assignment.mentor_name}</h3>
                  <p className="text-sm text-[#0D1B2A]/65">
                    {[
                      assignment.mentor_title,
                      assignment.mentor_industry,
                      assignment.mentor_country,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-semibold",
                    scoreTone(assignment.compatibility),
                  )}
                >
                  {formatPct(assignment.compatibility)} fit
                </span>
              </div>
              <p className="mt-3 text-sm text-[#0D1B2A]/70">
                Optimal assignment from cosine similarity + Hungarian algorithm across the cohort
                matrix.
                {assignment.languages?.length
                  ? ` Shared languages: ${assignment.languages.join(", ")}.`
                  : ""}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#0D1B2A]/65">
              No global assignment for this scholar yet.
            </p>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {top3.map((mentor, index) => (
              <article
                key={mentor.mentor_id}
                className="rounded-xl border border-[#0D1B2A]/10 bg-[#F8FAFA] p-3"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0D1B2A]/50">
                  Alt #{index + 1}
                </p>
                <h4 className="mt-1 text-sm font-semibold text-[#0D1B2A]">{mentor.mentor_name}</h4>
                <p className="text-xs text-[#0D1B2A]/60">{mentor.title || mentor.industry}</p>
                <p className="mt-2 text-sm font-semibold text-[#028090]">
                  {formatPct(mentor.score)}
                </p>
                <p className="mt-1 text-[11px] text-[#0D1B2A]/55">
                  {mentor.availability_hrs_per_month}h / month · {mentor.country}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#0D1B2A]/10 bg-[#0D1B2A] p-5 text-white shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#F4B942]" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F4B942]">
              Session booking
            </p>
          </div>
          <p className="mt-2 text-sm text-white/75">
            Book a 30–45 minute check-in with your assigned mentor. Demo mode logs the request
            in-session.
          </p>
          <label className="mt-4 block text-xs font-medium text-white/70" htmlFor="topic">
            Topic
          </label>
          <select
            id="topic"
            value={bookingTopic}
            onChange={(event) => setBookingTopic(event.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#F4B942]"
          >
            <option className="text-[#0D1B2A]">Career pathing</option>
            <option className="text-[#0D1B2A]">Application review</option>
            <option className="text-[#0D1B2A]">Skills portfolio</option>
            <option className="text-[#0D1B2A]">Scholarship strategy</option>
          </select>
          <label className="mt-3 block text-xs font-medium text-white/70" htmlFor="note">
            Note
          </label>
          <textarea
            id="note"
            value={bookingNote}
            onChange={(event) => setBookingNote(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#F4B942]"
            placeholder="What should we cover?"
          />
          <button
            type="button"
            onClick={() => setBooked(`${bookingTopic}${bookingNote ? ` — ${bookingNote}` : ""}`)}
            className="mt-4 w-full rounded-full bg-[#F4B942] px-4 py-2.5 text-sm font-semibold text-[#0D1B2A] transition hover:bg-[#e0a836]"
          >
            Request session
          </button>
          {booked ? (
            <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-xs text-[#F4B942]">
              Request logged: {booked}
            </p>
          ) : null}
        </section>
      </div>

      <Heatmap
        matrix={heatmap.matrix}
        studentNames={heatmap.student_names}
        mentorNames={heatmap.mentor_names}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#0D1B2A]/10 bg-white p-5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#028090]" aria-hidden />
            <h3 className="text-sm font-semibold text-[#0D1B2A]">Session log</h3>
          </div>
          <ul className="mt-3 space-y-2">
            {sessions.slice(0, 8).map((session) => (
              <li
                key={session.session_id}
                className="rounded-xl border border-[#0D1B2A]/08 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-[#0D1B2A]">{session.session_date}</p>
                  <span className="text-xs uppercase tracking-wide text-[#0D1B2A]/50">
                    {session.status ?? (session.goals_set ? "completed" : "logged")}
                  </span>
                </div>
                <p className="text-xs text-[#0D1B2A]/65">
                  {session.session_duration_mins} min · rating {session.student_rating}/5 ·{" "}
                  {session.topics_discussed.join(", ")}
                </p>
              </li>
            ))}
            {sessions.length === 0 ? (
              <li className="text-sm text-[#0D1B2A]/55">No sessions logged yet.</li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#0D1B2A]/10 bg-white p-5">
          <h3 className="text-sm font-semibold text-[#0D1B2A]">Mentor roster</h3>
          <ul className="mt-3 space-y-2">
            {mentors.slice(0, 8).map((mentor) => (
              <li
                key={mentor.mentor_id}
                className="flex items-start justify-between gap-3 rounded-xl border border-[#0D1B2A]/08 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-[#0D1B2A]">{mentor.name}</p>
                  <p className="text-xs text-[#0D1B2A]/60">
                    {mentor.industry} · {mentor.country} · {mentor.availability_hrs_per_month}h/mo
                  </p>
                </div>
                <span className="text-[11px] text-[#028090]">{mentor.languages.join(" / ")}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function RiskPanel({
  rows,
  isAdmin,
  onOutreach,
  outreachStatus,
}: {
  rows: RiskRow[];
  isAdmin: boolean;
  onOutreach: (studentId: string) => void;
  outreachStatus: Record<string, string>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#0D1B2A]/10 bg-white shadow-sm">
      <div className="border-b border-[#0D1B2A]/08 px-4 py-3">
        <h3 className="text-sm font-semibold text-[#0D1B2A]">Dropout risk dashboard</h3>
        <p className="text-xs text-[#0D1B2A]/60">
          Logistic regression probability · threshold 0.65 · RF feature importance for top factor
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#0D1B2A]/[0.03] text-[11px] uppercase tracking-[0.12em] text-[#0D1B2A]/55">
            <tr>
              <th className="px-4 py-3 font-semibold">Scholar</th>
              <th className="px-4 py-3 font-semibold">Risk</th>
              <th className="px-4 py-3 font-semibold">Probability</th>
              <th className="px-4 py-3 font-semibold">Top factor</th>
              <th className="px-4 py-3 font-semibold">Signals</th>
              {isAdmin ? <th className="px-4 py-3 font-semibold">Action</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.student_id} className="border-t border-[#0D1B2A]/08 align-top">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#0D1B2A]">{row.full_name}</p>
                  <p className="text-xs text-[#0D1B2A]/55">{row.country}</p>
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
                <td className="px-4 py-3 tabular-nums font-semibold text-[#0D1B2A]">
                  {formatPct(row.risk_probability)}
                </td>
                <td className="px-4 py-3 text-[#0D1B2A]/75">
                  {row.top_risk_factor.replaceAll("_", " ")}
                </td>
                <td className="px-4 py-3 text-xs text-[#0D1B2A]/65">
                  login {row.features.days_since_last_login}d · gpa{" "}
                  {row.features.gpa_score.toFixed(2)} · attend{" "}
                  {Math.round(row.features.attendance_rate * 100)}% · mentor{" "}
                  {row.features.days_since_last_mentor_session}d
                </td>
                {isAdmin ? (
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onOutreach(row.student_id)}
                      className="rounded-full bg-[#C0392B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#a93226]"
                    >
                      Trigger outreach
                    </button>
                    {outreachStatus[row.student_id] ? (
                      <p className="mt-1 max-w-48 text-[11px] text-[#0D1B2A]/60">
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
      label: "Rec. Precision@5",
      value: formatPct(metrics.recommendation_precision_at_5),
      target: `target ≥ ${formatPct(metrics.recommendation_target)}`,
      pass: metrics.recommendation_precision_at_5 >= metrics.recommendation_target,
    },
    {
      label: "Mentor match F1",
      value: formatPct(metrics.mentor_match_f1),
      target: `target ≥ ${formatPct(metrics.mentor_match_target)}`,
      pass: metrics.mentor_match_f1 >= metrics.mentor_match_target,
    },
    {
      label: "Dropout AUC-ROC",
      value: metrics.dropout_auc_roc.toFixed(2),
      target: `target ≥ ${metrics.dropout_target.toFixed(2)}`,
      pass: metrics.dropout_auc_roc >= metrics.dropout_target,
    },
    {
      label: "NLP entity recall",
      value: formatPct(metrics.nlp_entity_recall_estimate),
      target: `target ≥ ${formatPct(metrics.nlp_target)}`,
      pass: metrics.nlp_entity_recall_estimate >= metrics.nlp_target,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-[#0D1B2A]/10 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0D1B2A]/55">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[#0D1B2A]">{card.value}</p>
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                card.pass ? "text-[#1B5E20]" : "text-[#C0392B]",
              )}
            >
              {card.pass ? "On target" : "Below target"} · {card.target}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#0D1B2A]/10 bg-white p-5">
          <h3 className="text-sm font-semibold text-[#0D1B2A]">
            Feature importance (Random Forest)
          </h3>
          <ul className="mt-3 space-y-2">
            {Object.entries(metrics.random_forest_feature_importance)
              .sort((a, b) => b[1] - a[1])
              .map(([feature, weight]) => (
                <li key={feature}>
                  <div className="mb-1 flex justify-between text-xs text-[#0D1B2A]/70">
                    <span>{feature.replaceAll("_", " ")}</span>
                    <span className="tabular-nums">{formatPct(weight)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#0D1B2A]/10">
                    <div
                      className="h-full rounded-full bg-[#028090]"
                      style={{ width: `${Math.round(weight * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#0D1B2A]/10 bg-white p-5">
          <h3 className="text-sm font-semibold text-[#0D1B2A]">NLP goal extracts</h3>
          <ul className="mt-3 space-y-3">
            {nlp.slice(0, 6).map((row) => (
              <li key={row.student_id} className="rounded-xl border border-[#0D1B2A]/08 p-3">
                <p className="text-sm font-medium text-[#0D1B2A]">{row.full_name}</p>
                <p className="mt-1 text-xs text-[#0D1B2A]/65">{row.career_goal_text}</p>
                <p className="mt-2 text-xs text-[#028090]">{row.recommendation_sentence}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {[...row.entities.ORG, ...row.entities.SKILL, ...row.entities.GPE]
                    .slice(0, 6)
                    .map((entity) => (
                      <span
                        key={`${row.student_id}-${entity}`}
                        className="rounded-full bg-[#0D1B2A]/[0.04] px-2 py-0.5 text-[11px] text-[#0D1B2A]/70"
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
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState<TabId>("opportunities");
  const [selectedStudent, setSelectedStudent] = useState(initialData.student?.student_id ?? "");
  const [outreachStatus, setOutreachStatus] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const assignment = useMemo(() => {
    if (data.role === "admin" && selectedStudent) {
      return data.mentorship.assignments.find((row) => row.student_id === selectedStudent);
    }
    return data.mentorship.assignments[0];
  }, [data, selectedStudent]);

  const top3 = useMemo(() => {
    const key = selectedStudent || data.student?.student_id || Object.keys(data.mentorship.top3)[0];
    return key ? (data.mentorship.top3[key] ?? []) : [];
  }, [data, selectedStudent]);

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

  return (
    <div className="min-h-screen bg-[#F4F7F7] text-[#0D1B2A]">
      <header className="border-b border-white/10 bg-[#0D1B2A] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F4B942]">
              JointHub Africa
            </p>
            <h1 className="text-lg font-semibold sm:text-xl">Mentor Hub</h1>
            <p className="text-xs text-[#0D1B2A]/55">
              <a href="/prototype" className="font-medium text-[#028090] underline-offset-2 hover:underline">
                View Canva prototype
              </a>
            </p>
            <p className="text-xs text-[#0D1B2A]/55">
            </p>
            <p className="text-xs text-white/65">
              {data.student
                ? `${data.student.full_name} · ${data.student.programme}`
                : "Admin cohort view"}{" "}
              · {data.auth_email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Registered users" value={data.kpis.registered_users} />
          <KpiCard label="Opportunities matched" value={data.kpis.opportunities_matched} />
          <KpiCard label="Active mentor pairs" value={data.kpis.active_mentor_pairs} />
          <KpiCard label="At-risk students flagged" value={data.kpis.at_risk_students_flagged} />
        </div>

        {data.role === "admin" && data.students ? (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#0D1B2A]/10 bg-white p-3">
            <label
              htmlFor="student-filter"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0D1B2A]/55"
            >
              Focus scholar
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
              className="min-w-56 rounded-lg border border-[#0D1B2A]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#028090]"
            >
              <option value="">All scholars (admin)</option>
              {data.students.map((student) => (
                <option key={student.student_id} value={student.student_id}>
                  {student.full_name} · {student.country}
                </option>
              ))}
            </select>
            {isPending ? <span className="text-xs text-[#0D1B2A]/50">Updating…</span> : null}
          </div>
        ) : null}

        <nav className="flex flex-wrap gap-2" aria-label="Dashboard modules">
          {TABS.map((item) => {
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
                    ? "bg-[#028090] text-white"
                    : "bg-white text-[#0D1B2A]/75 border border-[#0D1B2A]/10 hover:border-[#028090]/40",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </nav>

        {tab === "opportunities" ? (
          <OpportunitiesPanel items={data.recommendations} sentence={data.personalised_sentence} />
        ) : null}
        {tab === "mentorship" ? (
          <MentorshipPanel
            assignment={assignment}
            top3={top3}
            sessions={data.mentorship.sessions}
            heatmap={data.mentorship.heatmap}
            mentors={data.mentorship.mentors}
          />
        ) : null}
        {tab === "risk" ? (
          <RiskPanel
            rows={data.risk}
            isAdmin={data.role === "admin"}
            onOutreach={handleOutreach}
            outreachStatus={outreachStatus}
          />
        ) : null}
        {tab === "analytics" ? (
          <AnalyticsPanel metrics={data.metrics} nlp={data.nlp} kpis={data.kpis} />
        ) : null}
      </main>
    </div>
  );
}
