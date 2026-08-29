/**
 * Leader-facing experience helpers derived from Capstone sample data.
 * Applications and community are deterministic demo surfaces so judges can
 * walk Canva/tunnel IA without a separate backend.
 */

import {
  getAiCoachForStudent,
  getMentorship,
  getNlpRows,
  getRecommendationSentenceMap,
  getRecommendationsMap,
  getRiskRows,
  getStudents,
  getSurveyInsights,
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

export type MentorCaseloadMentee = {
  student_id: string;
  full_name: string;
  country: string;
  programme: string;
  career_goal_text: string;
  interest_tags: string[];
  compatibility: number;
  risk_level: RiskRow["risk_level"] | null;
  risk_probability: number | null;
  top_risk_factor: string | null;
  days_since_last_session: number | null;
  top_opportunity: string | null;
  applications_in_flight: number;
};

export type MentorOverview = {
  greeting_name: string;
  mentor_id: string;
  mentor_title: string;
  mentor_industry: string;
  mentor_country: string;
  availability_hrs_per_month: number;
  languages: string[];
  mentee_count: number;
  high_risk_count: number;
  sessions_logged: number;
  average_fit_pct: number | null;
  next_session: SessionLog | null;
  mentees: MentorCaseloadMentee[];
  focus_note: string;
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

  const surveyCoach = getAiCoachForStudent(studentId);
  if (risk?.risk_level === "high") {
    coaching = {
      level: "high",
      message:
        surveyCoach?.risk_note ||
        risk.outreach_prompt ||
        "You may be falling behind. Book a short mentor check-in this week and reopen one saved opportunity.",
      cta: "Book a check-in",
    };
  } else if (risk?.risk_level === "medium") {
    coaching = {
      level: "medium",
      message:
        surveyCoach?.risk_note ||
        (surveyCoach?.barriers?.[0]
          ? `Survey barrier flagged: ${surveyCoach.barriers[0]}. Protect one focused hour this week for applications or mentor prep.`
          : "A few signals suggest friction. Protect one focused hour this week for applications or mentor prep."),
      cta: "Open mentor hub",
    };
  } else if (surveyCoach?.priority_needs?.length) {
    coaching = {
      level: "steady",
      message: `Survey-backed focus: ${surveyCoach.priority_needs.slice(0, 2).join(" and ")}. Ask Kay for this week's plan.`,
      cta: "Ask Kay for a week plan",
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
    starter_prompts: (() => {
      const coach = getAiCoachForStudent(studentId);
      const needs = (coach?.priority_needs ?? student.mentor_need_labels ?? []).slice(0, 2);
      const prompts = [
        "What should I apply to next?",
        "Who is my mentor and why?",
        "When is my nearest deadline?",
        "Am I falling behind?",
        "What should I do this week?",
        "Help me draft essay talking points",
      ];
      if (needs[0]) prompts.unshift(`Help me with ${needs[0]}`);
      if (student.barriers?.[0]) prompts.splice(2, 0, `How do I handle: ${student.barriers[0]}?`);
      if (coach?.session_format) prompts.push(`Plan a ${coach.session_format} mentor session`);
      return Array.from(new Set(prompts)).slice(0, 6);
    })(),
  };
}

export function getMentorOverview(mentorId: string | null): MentorOverview | null {
  if (!mentorId) {
    return null;
  }

  const mentorship = getMentorship();
  const mentor = mentorship.mentors.find((row) => row.mentor_id === mentorId) ?? null;
  const assignments = mentorship.assignments.filter((row) => row.mentor_id === mentorId);
  const sessions = mentorship.sessions
    .filter((row) => row.mentor_id === mentorId)
    .slice()
    .sort((a, b) => b.session_date.localeCompare(a.session_date));
  const nextSession =
    sessions.find((row) => row.status === "scheduled") ?? sessions[0] ?? null;
  const riskByStudent = new Map(getRiskRows().map((row) => [row.student_id, row]));
  const studentsById = new Map(getStudents().map((row) => [row.student_id, row]));
  const recommendationsMap = getRecommendationsMap();

  const mentees: MentorCaseloadMentee[] = assignments.map((assignment) => {
    const student = studentsById.get(assignment.student_id);
    const risk = riskByStudent.get(assignment.student_id) ?? null;
    const applications = getLeaderApplications(assignment.student_id);
    const latestSession = sessions.find((row) => row.student_id === assignment.student_id) ?? null;
    const topOpp = recommendationsMap[assignment.student_id]?.[0] ?? null;

    return {
      student_id: assignment.student_id,
      full_name: student?.full_name ?? assignment.student_name,
      country: student?.country ?? "—",
      programme: student?.programme ?? "ESL Leader",
      career_goal_text: student?.career_goal_text ?? "Leadership development",
      interest_tags: student?.interest_tags ?? [],
      compatibility: assignment.compatibility,
      risk_level: risk?.risk_level ?? null,
      risk_probability: risk?.risk_probability ?? null,
      top_risk_factor: risk?.top_risk_factor ?? null,
      days_since_last_session: latestSession?.days_since_last_session ?? null,
      top_opportunity: topOpp?.title ?? null,
      applications_in_flight: applications.filter((item) => item.stage !== "accepted").length,
    };
  });

  const highRiskCount = mentees.filter((row) => row.risk_level === "high").length;
  const averageFit =
    mentees.length > 0
      ? Math.round(
          (mentees.reduce((sum, row) => sum + row.compatibility, 0) / mentees.length) * 100,
        )
      : null;

  const focusLeader = mentees.find((row) => row.risk_level === "high") ?? mentees[0] ?? null;
  const focusNote = focusLeader
    ? highRiskCount > 0
      ? `${focusLeader.full_name} shows a high coaching signal${
          focusLeader.top_risk_factor
            ? ` around ${focusLeader.top_risk_factor.replaceAll("_", " ")}`
            : ""
        }. Prioritise a check-in this week.`
      : `Start with ${focusLeader.full_name} — review their top opportunity and protect one session slot.`
    : "No mentees are assigned to this mentor in the demo caseload yet.";

  const greeting =
    mentor?.name.split(" ")[0] ??
    assignments[0]?.mentor_name.split(" ")[0] ??
    "Mentor";

  return {
    greeting_name: greeting,
    mentor_id: mentorId,
    mentor_title: mentor?.title ?? assignments[0]?.mentor_title ?? "ESL Mentor",
    mentor_industry:
      mentor?.industry ?? assignments[0]?.mentor_industry ?? "Mentorship",
    mentor_country: mentor?.country ?? assignments[0]?.mentor_country ?? "Africa",
    availability_hrs_per_month: mentor?.availability_hrs_per_month ?? 6,
    languages: mentor?.languages ?? assignments[0]?.languages ?? ["English"],
    mentee_count: mentees.length,
    high_risk_count: highRiskCount,
    sessions_logged: sessions.length,
    average_fit_pct: averageFit,
    next_session: nextSession,
    mentees,
    focus_note: focusNote,
    starter_prompts: [
      "Who on my caseload needs attention first?",
      "What should I cover with my highest-risk mentee?",
      "Summarise my mentees' top opportunities",
      "How should I structure this week's check-ins?",
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
  role: "student" | "admin" | "mentor";
  recommendations: Recommendation[];
  assignment: MentorAssignment | null;
  alternatives: MentorTop3[];
  applications: LeaderApplication[];
  risk: RiskRow | null;
  sentence: string | null;
};

export function buildAdvisorContext(
  role: "student" | "admin" | "mentor",
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

export type AdvisorChatTurn = {
  role: "user" | "assistant";
  content: string;
};

type AdvisorIntent =
  | "greeting"
  | "identity"
  | "opportunities"
  | "mentors"
  | "applications"
  | "deadlines"
  | "risk"
  | "profile"
  | "plan"
  | "essay"
  | "thanks"
  | "clarify"
  | "general";

function detectAdvisorIntent(question: string, history: AdvisorChatTurn[]): AdvisorIntent {
  const q = question.trim().toLowerCase();
  if (!q) return "clarify";
  if (/(thanks|thank you|appreciate it|that helped)/.test(q)) return "thanks";
  if (/(hello|hi\b|hey|good morning|good afternoon|good evening)/.test(q)) return "greeting";
  // Topic intents before identity so "help me draft…" is not swallowed by "help".
  if (/(essay|statement|personal statement|cover letter|write|draft|cv|resume|talking points)/.test(q)) {
    return "essay";
  }
  if (/(opportunit|scholarship|fellowship|recommend|match|rank|apply to|what should i apply)/.test(q)) {
    return "opportunities";
  }
  if (/(mentor|session|book|check-?in|esl mentor)/.test(q)) return "mentors";
  if (/(application|pipeline|status|interview|accepted|under review)/.test(q)) return "applications";
  if (/(deadline|when is|bootcamp|date|calendar)/.test(q)) return "deadlines";
  if (/(risk|dropout|behind|coaching|stuck|falling)/.test(q)) return "risk";
  if (/(goal|profile|interest|about me|my programme|my country)/.test(q)) return "profile";
  if (/(next|what should|plan|this week|today|priority)/.test(q)) return "plan";
  if (
    /(who are you|what can you|what do you do|your role|joint.?hub agent|how can you help|tell me about kay|\bkay\b)/.test(
      q,
    )
  ) {
    return "identity";
  }

  // Follow-ups: if the leader only said "why", "more", "and then", use recent topic.
  if (/(why|more|tell me more|and then|what else|continue|go on|how)/.test(q) && history.length > 0) {
    const recent = [...history]
      .reverse()
      .map((turn) => turn.content.toLowerCase())
      .join(" ");
    if (/(mentor|session)/.test(recent)) return "mentors";
    if (/(opportunit|scholarship|fellowship|match)/.test(recent)) return "opportunities";
    if (/(application|pipeline|interview)/.test(recent)) return "applications";
    if (/(deadline|bootcamp)/.test(recent)) return "deadlines";
    if (/(risk|behind|coaching)/.test(recent)) return "risk";
    if (/(week|plan|next)/.test(recent)) return "plan";
  }

  return "general";
}

function buildFollowUps(intent: AdvisorIntent, context: AdvisorContext): string[] {
  const topOpp = context.recommendations[0];
  const mentor = context.assignment;
  const base: Record<AdvisorIntent, string[]> = {
    greeting: [
      "What should I apply to next?",
      "Who is my mentor and why?",
      "What should I do this week?",
    ],
    identity: [
      "What should I apply to next?",
      "Am I falling behind?",
      "Help me plan this week",
    ],
    opportunities: [
      "Why is this my top match?",
      "Who is my mentor and why?",
      "When is my nearest deadline?",
    ],
    mentors: [
      "What should we cover in the first session?",
      "Show me a mentor alternative",
      "What should I apply to next?",
    ],
    applications: [
      "What should I do this week?",
      "When is my nearest deadline?",
      "Help me draft essay talking points",
    ],
    deadlines: [
      "What should I apply to next?",
      "What should I do this week?",
      "Am I falling behind?",
    ],
    risk: [
      "What should I do this week?",
      "Who is my mentor and why?",
      "Help me draft essay talking points",
    ],
    profile: [
      "What should I apply to next?",
      "Who is my mentor and why?",
      "What should I do this week?",
    ],
    plan: [
      "What should I apply to next?",
      "Who is my mentor and why?",
      "Am I falling behind?",
    ],
    essay: [
      "What should I apply to next?",
      "Who is my mentor and why?",
      "When is my nearest deadline?",
    ],
    thanks: [
      "What should I do this week?",
      "When is my nearest deadline?",
      "Show me a mentor alternative",
    ],
    clarify: [
      "What should I apply to next?",
      "Who is my mentor and why?",
      "What should I do this week?",
    ],
    general: [
      topOpp ? `Tell me more about ${topOpp.title}` : "What should I apply to next?",
      mentor ? `Why am I matched with ${mentor.mentor_name}?` : "Who is my mentor and why?",
      "What should I do this week?",
    ],
  };

  return base[intent].slice(0, 3);
}

export function answerAdvisorQuestion(
  question: string,
  context: AdvisorContext,
  history: AdvisorChatTurn[] = [],
): string {
  const intent = detectAdvisorIntent(question, history);
  const q = question.trim().toLowerCase();
  const student = context.student;
  const name = student?.full_name.split(" ")[0] ?? "there";
  const topOpp = context.recommendations[0];
  const mentor = context.assignment;
  const priorUserTurns = history.filter((turn) => turn.role === "user").length;
  const continuity =
    priorUserTurns > 0
      ? "I am staying with your profile context from this chat."
      : "I am Kay, your AI coach for your ESL journey.";

  if (intent === "clarify") {
    return `${continuity} Ask me about opportunities, ESL mentors, applications, deadlines, risk coaching, essays, or what to do next.`;
  }

  if (intent === "greeting") {
    const coach = student ? getAiCoachForStudent(student.student_id) : null;
    const surveyBit = coach?.priority_needs?.length
      ? ` I already loaded your ESL Mentor Needs survey — top needs: ${coach.priority_needs.slice(0, 2).join(" and ")}.`
      : "";
    return `Hi ${name}. ${continuity}${surveyBit} I can rank your next opportunity move, explain your ESL mentor fit, walk application stages, and build a week plan with you. What do you want to tackle first?`;
  }

  if (intent === "identity") {
    return `I am Kay, your AI coach inside the dashboard. I use your sample leader profile, ranked opportunities, ESL mentor roster, application pipeline, and soft coaching signals — the same product data judges and leaders see. I am interactive: ask follow-ups, tap suggested prompts, or say "why" / "what next" and I will stay on topic.`;
  }

  if (intent === "thanks") {
    return `Glad that helped, ${name}. When you are ready, we can tighten a week plan, pressure-test a mentor session agenda, or advance one application.`;
  }

  if (intent === "opportunities" || (intent === "general" && /(why|more)/.test(q) && topOpp)) {
    if (!topOpp) {
      return "I do not have ranked opportunities for this account yet. Sign in as a leader demo user to load personalised matches, then ask me again.";
    }
    const others = context.recommendations
      .slice(1, 3)
      .map((item) => `${item.title} (${Math.round(item.match_score * 100)}%)`)
      .join("; ");
    const whyMore = /(why|more|tell me more)/.test(q);
    return [
      continuity,
      context.sentence ??
        `Your strongest current match is ${topOpp.title} at ${topOpp.org_name} (${Math.round(topOpp.match_score * 100)}% fit).`,
      whyMore
        ? `Why it leads: it aligns with your goal and interest tags, sits near your timeline, and ${topOpp.is_verified ? "is verified on JointHub" : "is still worth a careful review"}.`
        : `Top pick: ${topOpp.title} · deadline ${topOpp.deadline}${topOpp.is_verified ? " · verified" : ""}.`,
      others ? `Also ranked: ${others}.` : "",
      "If you want, ask me for essay talking points for this pick, or open Opportunities and move it one stage in your pipeline.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (intent === "mentors") {
    if (!mentor) {
      return "No assigned mentor is loaded for this account. Admin can focus a leader, or sign in as leader1@jointhub.demo so I can coach against a real match.";
    }
    const coachPlan = student ? getAiCoachForStudent(student.student_id) : null;
    const surveyNeedLine = coachPlan?.priority_needs?.length
      ? ` Your survey said you most need help with ${coachPlan.priority_needs.slice(0, 3).join(", ")}.`
      : "";
    const discoverLine = coachPlan?.discover_preference
      ? ` Match discovery preference: ${coachPlan.discover_preference}.`
      : "";
    const wantsAlt = /(alternative|another|other mentor|show me a mentor)/.test(q);
    const alt =
      context.alternatives.find((item) => item.mentor_id !== mentor.mentor_id) ??
      context.alternatives.find((item) => item.mentor_name !== mentor.mentor_name);
    if (wantsAlt && alt) {
      return `${continuity} Beyond ${mentor.mentor_name}, a strong alternative is ${alt.mentor_name} in ${alt.industry} (${Math.round(alt.score * 100)}% fit, ${alt.availability_hrs_per_month}h/mo, ${alt.country}). Compare both on ESL Mentors, then ask me for a first-session agenda.`;
    }
    if (/(session|cover|agenda|first meeting|book)/.test(q)) {
      return [
        continuity,
        `For your first check-in with ${mentor.mentor_name} (${mentor.mentor_industry}), keep it to three beats:`,
        "1) Your career goal in one sentence.",
        topOpp ? `2) Whether ${topOpp.title} is the right near-term bet.` : "2) Which opportunity feels most real this month.",
        "3) One blocker you want help removing this week.",
        "Open ESL Mentors to request the session, then come back if you want a tighter script.",
      ].join(" ");
    }
    return [
      continuity,
      `You are matched with ${mentor.mentor_name} (${mentor.mentor_industry}, ${mentor.mentor_country}) at ${Math.round(mentor.compatibility * 100)}% compatibility.`,
      alt
        ? `A strong alternative is ${alt.mentor_name} in ${alt.industry} (${Math.round(alt.score * 100)}% fit, ${alt.availability_hrs_per_month}h/mo).`
        : "",
      "Ask me what to cover in the first session, or open ESL Mentors to book career pathing, application review, or scholarship strategy.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (intent === "applications") {
    if (context.applications.length === 0) {
      return "No demo applications are staged for this account yet. Start from Opportunities, then I can coach each stage with you.";
    }
    const summary = context.applications
      .map((item) => `${item.title} → ${applicationStageLabel(item.stage)}`)
      .join("; ");
    const focus = context.applications[0];
    return `${continuity} Your demo application pipeline: ${summary}. Focus ${focus.title} while it is ${applicationStageLabel(focus.stage)} — gather proof points before ${focus.deadline}, then ask me for essay talking points or a week plan around that deadline.`;
  }

  if (intent === "deadlines") {
    const nearest = context.recommendations
      .slice()
      .sort((a, b) => a.deadline.localeCompare(b.deadline))[0];
    const bootcamp = "CreativeTech × SoCreative is tentatively 10–11 August 2026 at ALX Kigali.";
    if (!nearest) {
      return `${continuity} ${bootcamp}`;
    }
    return `${continuity} ${bootcamp} Your nearest ranked opportunity deadline is ${nearest.title} on ${nearest.deadline}. Want a countdown plan from today to that date?`;
  }

  if (intent === "risk") {
    if (context.role === "admin" && !student) {
      return "Admin view: open Dropout risk for the full cohort table and outreach queue. Leaders receive soft coaching with me here — not surveillance-style cohort tools.";
    }
    if (!context.risk) {
      return "No personal risk row is loaded. In production this stays private coaching with me, never a public scoreboard.";
    }
    if (context.risk.risk_level === "high") {
      return `${continuity} ${
        context.risk.outreach_prompt ||
        "Signals suggest you may be falling behind. Book a mentor check-in and complete one application action this week."
      } Tell me if you want a recovery plan for the next 7 days.`;
    }
    if (context.risk.risk_level === "medium") {
      return `${continuity} Your coaching signal is medium, mainly around ${context.risk.top_risk_factor.replaceAll("_", " ")}. Protect one focused hour, message your mentor, and advance one application stage. I can break that into a day-by-day plan if you want.`;
    }
    return `${continuity} Your coaching signal looks steady. Keep a weekly cadence on applications and mentor sessions — ask me for a light maintenance plan if helpful.`;
  }

  if (intent === "profile") {
    if (!student) {
      return "No leader profile is in focus. Choose a demo leader or use the admin focus filter, then I can coach against that profile.";
    }
    return `${continuity} ${student.full_name} · ${student.country} · ${student.programme}. Goal: ${student.career_goal_text}. Interests: ${student.interest_tags.join(", ")}. I use this to rank opportunities and mentor fit — ask what that means for your next application.`;
  }

  if (intent === "essay") {
    if (!student) {
      return "I need a leader profile in focus before I can draft talking points.";
    }
    const target = topOpp?.title ?? "your top opportunity";
    return [
      continuity,
      `Essay / statement spine for ${target}:`,
      `1) Hook with service leadership in ${student.country}.`,
      `2) Proof from ${student.programme} tied to ${student.interest_tags.slice(0, 2).join(" and ") || "your interests"}.`,
      `3) Goal line: ${student.career_goal_text}`,
      mentor ? `4) Name how ${mentor.mentor_name} will pressure-test your plan.` : "4) Name one mentor or peer who will pressure-test your plan.",
      "Reply with the opportunity title if you want this tightened further, or ask for a week plan to finish a draft.",
    ].join(" ");
  }

  if (intent === "plan") {
    const coach = student ? getAiCoachForStudent(student.student_id) : null;
    if (coach?.weekly_plan?.length) {
      const surveySteps = coach.weekly_plan
        .slice(0, 3)
        .map((step, index) => `${index + 1}) ${step.focus}: ${step.action}`)
        .join(" ");
      const needs = coach.priority_needs.slice(0, 2).join(" and ") || "your named mentor needs";
      const barriers = coach.barriers.slice(0, 2).join(" and ");
      return [
        continuity,
        `From your ESL Mentor Needs survey, ${name}, I prioritised ${needs}.`,
        barriers ? `We also account for barriers around ${barriers}.` : "",
        `Week plan: ${surveySteps}`,
        coach.session_format
          ? `Default session format from your survey: ${coach.session_format}${coach.working_style ? ` · style: ${coach.working_style}` : ""}.`
          : "",
        topOpp ? `Opportunity tie-in: advance ${topOpp.title} before ${topOpp.deadline}.` : "",
        mentor ? `Bring one blocker to your session with ${mentor.mentor_name}.` : "",
        "Which step should we unpack first?",
      ]
        .filter(Boolean)
        .join(" ");
    }
    const steps = [
      topOpp
        ? `1) Advance ${topOpp.title} one stage before ${topOpp.deadline}.`
        : "1) Open Opportunities and pick a top match.",
      mentor
        ? `2) Request a session with ${mentor.mentor_name} and bring one blocker.`
        : "2) Review ESL mentor matches and request a session.",
      "3) Come back to me (Kay, your AI coach) if you get stuck on deadlines, essays, or sequencing.",
    ];
    return `${continuity} Here is a tight week plan, ${name}: ${steps.join(" ")} Which step should we unpack first?`;
  }

  return [
    continuity,
    "I can help with opportunities, ESL mentors, applications, deadlines, risk coaching, essay talking points, or a weekly plan.",
    topOpp ? `Right now your top match is ${topOpp.title}.` : "",
    mentor ? `Your ESL mentor is ${mentor.mentor_name}.` : "",
    "Ask a direct question or tap a follow-up prompt below.",
  ]
    .filter(Boolean)
    .join(" ");
}

export type AdvisorReply = {
  answer: string;
  citations: string[];
  suggested_actions: string[];
  follow_ups: string[];
  coach: "Kay";
  agent_role: "AI Coach";
};

export function answerAdvisor(
  studentId: string,
  message: string,
  history: AdvisorChatTurn[] = [],
  role: "student" | "admin" | "mentor" = "student",
): AdvisorReply {
  const context = buildAdvisorContext(role, studentId);
  const intent = detectAdvisorIntent(message, history);
  const answer = answerAdvisorQuestion(message, context, history);
  const citations: string[] = [];
  const suggested_actions: string[] = [];
  const follow_ups = buildFollowUps(intent, context);
  const isMentor = role === "mentor";

  citations.push(
    isMentor
      ? "Coach: Kay · AI coach (mentor caseload mode)"
      : "Coach: Kay · AI coach",
  );
  const coachPlan = getAiCoachForStudent(studentId);
  if (coachPlan) {
    citations.push(
      `ESL survey plan: ${coachPlan.priority_needs.slice(0, 2).join(", ") || "mentor needs loaded"}`,
    );
  }
  try {
    const insights = getSurveyInsights();
    if (insights?.n_responses) {
      citations.push(
        `Cohort survey n=${insights.n_responses} · top need ${insights.top_mentor_needs[0]?.label ?? "networking"}`,
      );
    }
  } catch {
    // survey file optional in some environments
  }
  if (context.recommendations[0]) {
    citations.push(
      `Top opportunity: ${context.recommendations[0].title} (${Math.round(context.recommendations[0].match_score * 100)}% match)`,
    );
    suggested_actions.push(
      isMentor
        ? "Review the mentee's top opportunity before the next session"
        : "Open Opportunities and advance your top match",
    );
  }
  if (context.assignment) {
    citations.push(
      `Assigned mentor: ${context.assignment.mentor_name} · ${Math.round(context.assignment.compatibility * 100)}% fit`,
    );
    suggested_actions.push(
      isMentor ? "Open Sessions and log the next check-in" : "Request a mentor session from ESL Mentors",
    );
  }
  if (context.sentence) {
    citations.push(`NLP note: ${context.sentence}`);
  }
  if (context.risk && context.risk.risk_level !== "low") {
    citations.push(
      `Soft coaching: ${context.risk.risk_level} signal · ${context.risk.top_risk_factor.replaceAll("_", " ")}`,
    );
    suggested_actions.push(
      isMentor ? "Open Mentee risk for this leader" : "Open Stay on track for private coaching cues",
    );
  }
  if (context.applications[0]) {
    citations.push(
      `Application focus: ${context.applications[0].title} (${applicationStageLabel(context.applications[0].stage)})`,
    );
  }
  if (suggested_actions.length === 0) {
    suggested_actions.push(
      isMentor ? "Open My caseload and pick a mentee" : "Review Overview for your next best action",
    );
  }

  return {
    answer,
    citations: citations.slice(0, 5),
    suggested_actions: suggested_actions.slice(0, 3),
    follow_ups,
    coach: "Kay",
    agent_role: "AI Coach",
  };
}
