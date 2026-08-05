/**
 * Leader-facing experience helpers derived from Capstone sample data.
 * Applications and community are deterministic demo surfaces so judges can
 * walk Canva/tunnel IA without a separate backend.
 */

import {
  getMentorship,
  getNlpRows,
  getRecommendationSentenceMap,
  getRecommendationsMap,
  getRiskRows,
  getStudents,
} from "@/lib/jointhub/data-store";
import type {
  MentorAssignment,
  MentorTop3,
  Recommendation,
  RiskRow,
  SessionLog,
  StudentProfile,
} from "@/lib/jointhub/types";

export type ApplicationStage = "active" | "under_review" | "interview" | "accepted";

export type LeaderApplication = {
  application_id: string;
  opp_id: string;
  title: string;
  org_name: string;
  type: string;
  stage: ApplicationStage;
  match_score: number;
  deadline: string;
  updated_label: string;
  is_verified: boolean;
};

export type CommunityPost = {
  post_id: string;
  author: string;
  role_label: string;
  title: string;
  body: string;
  tag: string;
  when: string;
};

export type LeaderOverview = {
  greeting_name: string;
  goal_text: string;
  interest_tags: string[];
  next_session: SessionLog | null;
  assigned_mentor: MentorAssignment | null;
  top_opportunities: Recommendation[];
  worth_a_look: Recommendation[];
  personalised_sentence: string | null;
  coaching: {
    level: RiskRow["risk_level"] | "steady";
    message: string;
    cta: string;
  };
  coaching_nudge: string | null;
  activity_stats: Array<{ label: string; value: string | number; hint?: string }>;
  stats: {
    ranked_opportunities: number;
    applications_in_flight: number;
    mentor_fit_pct: number | null;
    days_to_next_deadline: number | null;
  };
  starter_prompts: string[];
};

const STAGE_CYCLE: ApplicationStage[] = [
  "active",
  "under_review",
  "interview",
  "accepted",
  "under_review",
];

const STAGE_LABEL: Record<ApplicationStage, string> = {
  active: "Active",
  under_review: "Under review",
  interview: "Interview",
  accepted: "Accepted",
};

export function applicationStageLabel(stage: ApplicationStage): string {
  return STAGE_LABEL[stage];
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getLeaderApplications(studentId: string): LeaderApplication[] {
  const recs = getRecommendationsMap()[studentId] ?? [];
  return recs.slice(0, 4).map((item, index) => {
    const stage = STAGE_CYCLE[(hashSeed(studentId) + index) % STAGE_CYCLE.length];
    const daysAgo = 2 + ((hashSeed(item.opp_id) + index) % 12);
    return {
      application_id: `${studentId}-${item.opp_id}`,
      opp_id: item.opp_id,
      title: item.title,
      org_name: item.org_name,
      type: item.type,
      stage,
      match_score: item.match_score,
      deadline: item.deadline,
      updated_label: `${daysAgo}d ago`,
      is_verified: item.is_verified,
    };
  });
}

export function getCommunityPosts(student: StudentProfile | null): CommunityPost[] {
  const country = student?.country ?? "Africa";
  const firstName = student?.full_name?.split(" ")[0] ?? "Leader";
  return [
    {
      post_id: "c1",
      author: "ESL Peer Circle",
      role_label: "Community",
      title: "Essay review pods this Friday",
      body: `Leaders in ${country} are pairing for 25-minute essay reviews before the next fellowship wave. Bring one paragraph and one question.`,
      tag: "Masterclass",
      when: "Today",
    },
    {
      post_id: "c2",
      author: "Isaiah Kporon",
      role_label: "ESL Mentor",
      title: "How I structure a 20-minute check-in",
      body: "Open with one win, one blocker, one ask. End with a written next step your mentor can hold you to.",
      tag: "Mentorship",
      when: "Yesterday",
    },
    {
      post_id: "c3",
      author: `${firstName}'s cohort`,
      role_label: "Peers",
      title: "CreativeTech X SoCreative countdown",
      body: "Bootcamp is tentatively 10–11 August 2026 at ALX Kigali. Share one prototype idea in the thread before the weekend.",
      tag: "Events",
      when: "2d ago",
    },
  ];
}

function daysUntil(deadline: string): number | null {
  const target = Date.parse(deadline);
  if (Number.isNaN(target)) {
    return null;
  }
  const diff = Math.ceil((target - Date.UTC(2026, 7, 4)) / (1000 * 60 * 60 * 24));
  return diff;
}

export function getLeaderOverview(studentId: string | null): LeaderOverview | null {
  if (!studentId) {
    return null;
  }

  const student = getStudents().find((row) => row.student_id === studentId) ?? null;
  if (!student) {
    return null;
  }

  const mentorship = getMentorship();
  const assigned = mentorship.assignments.find((row) => row.student_id === studentId) ?? null;
  const sessions = mentorship.sessions
    .filter((row) => row.student_id === studentId)
    .slice()
    .sort((a, b) => b.session_date.localeCompare(a.session_date));
  const nextSession = sessions.find((row) => row.status === "scheduled") ?? sessions[0] ?? null;
  const recommendations = getRecommendationsMap()[studentId] ?? [];
  const applications = getLeaderApplications(studentId);
  const risk = getRiskRows().find((row) => row.student_id === studentId);
  const sentence =
    getRecommendationSentenceMap()[studentId] ??
    getNlpRows().find((row) => row.student_id === studentId)?.recommendation_sentence ??
    null;

  const nearestDeadline = recommendations
    .map((item) => daysUntil(item.deadline))
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b)[0];

  let coaching: LeaderOverview["coaching"] = {
    level: "steady",
    message: "You are on track. Keep one application moving and book your next mentor touchpoint.",
    cta: "Review opportunities",
  };

  if (risk?.risk_level === "high") {
    coaching = {
      level: "high",
      message:
        risk.outreach_prompt ||
        "You may be falling behind. Book a short mentor check-in this week and reopen one saved opportunity.",
      cta: "Book a check-in",
    };
  } else if (risk?.risk_level === "medium") {
    coaching = {
      level: "medium",
      message:
        "A few signals suggest friction. Protect one focused hour this week for applications or mentor prep.",
      cta: "Open mentor hub",
    };
  }

  const stats = {
    ranked_opportunities: recommendations.length,
    applications_in_flight: applications.filter((item) => item.stage !== "accepted").length,
    mentor_fit_pct: assigned ? Math.round(assigned.compatibility * 100) : null,
    days_to_next_deadline: nearestDeadline ?? null,
  };

  return {
    greeting_name: student.full_name.split(" ")[0] ?? student.full_name,
    goal_text: student.career_goal_text,
    interest_tags: student.interest_tags,
    next_session: nextSession,
    assigned_mentor: assigned,
    top_opportunities: recommendations.slice(0, 3),
    worth_a_look: recommendations.slice(0, 3),
    personalised_sentence: sentence,
    coaching,
    coaching_nudge: coaching.level === "steady" ? null : coaching.message,
    activity_stats: [
      {
        label: "Ranked for you",
        value: stats.ranked_opportunities,
        hint: "AI-matched opportunities",
      },
      {
        label: "Applications live",
        value: stats.applications_in_flight,
        hint: "Demo pipeline stages",
      },
      {
        label: "Mentor fit",
        value: stats.mentor_fit_pct !== null ? `${stats.mentor_fit_pct}%` : "—",
        hint: assigned?.mentor_name ?? "No assignment yet",
      },
      {
        label: "Next deadline",
        value:
          stats.days_to_next_deadline === null
            ? "—"
            : stats.days_to_next_deadline < 0
              ? "Past due"
              : `${stats.days_to_next_deadline}d`,
        hint: "Nearest ranked opportunity",
      },
    ],
    stats,
    starter_prompts: [
      "What should I apply to next?",
      "Who is my mentor and why?",
      "When is my nearest deadline?",
      "Am I falling behind?",
      "What should I do this week?",
    ],
  };
}

export function getCommunityFeed(studentId: string | null): CommunityPost[] {
  const student = studentId
    ? (getStudents().find((row) => row.student_id === studentId) ?? null)
    : null;
  return getCommunityPosts(student);
}

export function getMentorAlternatives(studentId: string | null): MentorTop3[] {
  if (!studentId) {
    return [];
  }
  const mentorship = getMentorship();
  const assignedId =
    mentorship.assignments.find((row) => row.student_id === studentId)?.mentor_id ?? null;
  const ranked = mentorship.top3[studentId] ?? [];
  // Prefer distinct ESL mentors (exclude the assigned match) for Kay and UI alternatives.
  const distinct = ranked.filter((item) => item.mentor_id !== assignedId);
  return distinct.length > 0 ? distinct : ranked.slice(1);
}

export type AdvisorContext = {
  student: StudentProfile | null;
  role: "student" | "admin";
  recommendations: Recommendation[];
  assignment: MentorAssignment | null;
  alternatives: MentorTop3[];
  applications: LeaderApplication[];
  risk: RiskRow | null;
  sentence: string | null;
};

export function buildAdvisorContext(
  role: "student" | "admin",
  studentId: string | null,
): AdvisorContext {
  const student = studentId
    ? (getStudents().find((row) => row.student_id === studentId) ?? null)
    : null;
  const recommendations = studentId ? (getRecommendationsMap()[studentId] ?? []) : [];
  const assignment = studentId
    ? (getMentorship().assignments.find((row) => row.student_id === studentId) ?? null)
    : null;
  const alternatives = getMentorAlternatives(studentId);
  const applications = studentId ? getLeaderApplications(studentId) : [];
  const risk = studentId
    ? (getRiskRows().find((row) => row.student_id === studentId) ?? null)
    : null;
  const sentence = studentId ? (getRecommendationSentenceMap()[studentId] ?? null) : null;

  return {
    student,
    role,
    recommendations,
    assignment,
    alternatives,
    applications,
    risk,
    sentence,
  };
}

export function answerAdvisorQuestion(question: string, context: AdvisorContext): string {
  const q = question.trim().toLowerCase();
  const student = context.student;
  const name = student?.full_name.split(" ")[0] ?? "there";
  const topOpp = context.recommendations[0];
  const mentor = context.assignment;

  if (!q) {
    return "Ask me about opportunities, mentors, applications, deadlines, or what to do next.";
  }

  if (/(hello|hi |hey|good morning|good afternoon)/.test(q)) {
    return `Hi ${name}. I am Kay, your AI Coach on JointHub Africa. I can explain your ranked opportunities, ESL mentor match, application stages, and a sensible next step for this week.`;
  }

  if (/(who are you|what can you|help|kay)/.test(q)) {
    return "I am Kay the AI Coach — a Capstone demo guide grounded in your sample profile and the same ESL mentor roster as the public Mentors page. Ask about top opportunities, mentor fit, applications, risk coaching, or bootcamp timing.";
  }

  if (/(opportunit|scholarship|fellowship|recommend|match|rank)/.test(q)) {
    if (!topOpp) {
      return "I do not have ranked opportunities for this account yet. Sign in as a leader demo user to load personalised matches.";
    }
    const others = context.recommendations
      .slice(1, 3)
      .map((item) => item.title)
      .join("; ");
    return [
      context.sentence ??
        `Your strongest current match is ${topOpp.title} at ${topOpp.org_name} (${Math.round(topOpp.match_score * 100)}% fit).`,
      `Top pick: ${topOpp.title} · deadline ${topOpp.deadline}${topOpp.is_verified ? " · verified" : ""}.`,
      others ? `Also worth a look: ${others}.` : "",
      "Open Opportunities to save or move one into your applications pipeline.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (/(mentor|session|book|check-?in)/.test(q)) {
    if (!mentor) {
      return "No assigned mentor is loaded for this account. Admin can focus a leader, or sign in as leader1@jointhub.demo.";
    }
    // Skip the assigned mentor so Kay never names the same person twice.
    const alt =
      context.alternatives.find((item) => item.mentor_id !== mentor.mentor_id) ??
      context.alternatives.find((item) => item.mentor_name !== mentor.mentor_name);
    return [
      `You are matched with ${mentor.mentor_name} (${mentor.mentor_industry}, ${mentor.mentor_country}) at ${Math.round(mentor.compatibility * 100)}% compatibility.`,
      alt
        ? `A strong alternative is ${alt.mentor_name} in ${alt.industry} (${Math.round(alt.score * 100)}% fit, ${alt.availability_hrs_per_month}h/mo).`
        : "",
      "Open ESL Mentors to request a session on career pathing, application review, or scholarship strategy.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (/(application|pipeline|status|interview|accepted)/.test(q)) {
    if (context.applications.length === 0) {
      return "No demo applications are staged for this account yet.";
    }
    const summary = context.applications
      .map((item) => `${item.title} → ${applicationStageLabel(item.stage)}`)
      .join("; ");
    return `Your demo application pipeline: ${summary}. Focus one Active or Under review item this week and prepare materials before the nearest deadline.`;
  }

  if (/(deadline|when|bootcamp|date)/.test(q)) {
    const nearest = context.recommendations
      .slice()
      .sort((a, b) => a.deadline.localeCompare(b.deadline))[0];
    const bootcamp = "CreativeTech X SoCreative is tentatively 10–11 August 2026 at ALX Kigali.";
    if (!nearest) {
      return bootcamp;
    }
    return `${bootcamp} Your nearest ranked opportunity deadline is ${nearest.title} on ${nearest.deadline}.`;
  }

  if (/(risk|dropout|behind|coaching|stuck)/.test(q)) {
    if (context.role === "admin" && !student) {
      return "Admin view: open Dropout risk for the full cohort table and outreach queue. Leaders only receive soft coaching, not surveillance-style cohort tools.";
    }
    if (!context.risk) {
      return "No personal risk row is loaded. In production this would stay private coaching, never a public scoreboard.";
    }
    if (context.risk.risk_level === "high") {
      return (
        context.risk.outreach_prompt ||
        "Signals suggest you may be falling behind. Book a mentor check-in and complete one application action this week."
      );
    }
    if (context.risk.risk_level === "medium") {
      return `Your coaching signal is medium, mainly around ${context.risk.top_risk_factor.replaceAll("_", " ")}. Protect one focused hour and touch base with your mentor.`;
    }
    return "Your coaching signal looks steady. Keep a weekly cadence on applications and mentor sessions.";
  }

  if (/(goal|profile|interest|about me)/.test(q)) {
    if (!student) {
      return "No leader profile is in focus. Choose a demo leader or use the admin focus filter.";
    }
    return `${student.full_name} · ${student.country} · ${student.programme}. Goal: ${student.career_goal_text}. Interests: ${student.interest_tags.join(", ")}.`;
  }

  if (/(next|what should|plan|this week)/.test(q)) {
    const steps = [
      topOpp
        ? `1) Advance ${topOpp.title} one stage.`
        : "1) Open Opportunities and pick a top match.",
      mentor ? `2) Request a session with ${mentor.mentor_name}.` : "2) Review ESL mentor matches.",
      "3) Ask Kay about deadlines or essay framing if you get stuck.",
    ];
    return `Here is a tight week plan, ${name}: ${steps.join(" ")}`;
  }

  return [
    "I can help with opportunities, ESL mentors, applications, deadlines, risk coaching, or a weekly plan.",
    topOpp ? `Right now your top match is ${topOpp.title}.` : "",
    mentor ? `Your ESL mentor is ${mentor.mentor_name}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export type AdvisorReply = {
  answer: string;
  citations: string[];
  suggested_actions: string[];
};

export function answerAdvisor(studentId: string, message: string): AdvisorReply {
  const context = buildAdvisorContext("student", studentId);
  const answer = answerAdvisorQuestion(message, context);
  const citations: string[] = [];
  const suggested_actions: string[] = [];

  if (context.recommendations[0]) {
    citations.push(
      `Top opportunity: ${context.recommendations[0].title} (${Math.round(context.recommendations[0].match_score * 100)}% match)`,
    );
    suggested_actions.push("Open Opportunities and advance your top match");
  }
  if (context.assignment) {
    citations.push(
      `Assigned mentor: ${context.assignment.mentor_name} · ${Math.round(context.assignment.compatibility * 100)}% fit`,
    );
    suggested_actions.push("Request a mentor session from ESL Mentors");
  }
  if (context.sentence) {
    citations.push(`NLP note: ${context.sentence}`);
  }
  if (context.risk && context.risk.risk_level !== "low") {
    citations.push(
      `Soft coaching: ${context.risk.risk_level} signal · ${context.risk.top_risk_factor.replaceAll("_", " ")}`,
    );
    suggested_actions.push("Open Coaching / Stay on track");
  }
  if (context.applications[0]) {
    citations.push(
      `Application focus: ${context.applications[0].title} (${applicationStageLabel(context.applications[0].stage)})`,
    );
  }
  if (suggested_actions.length === 0) {
    suggested_actions.push("Review Overview for your next best action");
  }

  return {
    answer,
    citations: citations.slice(0, 4),
    suggested_actions: suggested_actions.slice(0, 3),
  };
}
