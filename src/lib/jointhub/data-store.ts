/**
 * Server-only sample data store for JointHub Capstone modules.
 * Adapts generator JSON into stable dashboard shapes.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ESL_MENTORS } from "@/lib/jointhub/esl-mentors";
import type {
  AuthUser,
  MentorAssignment,
  MentorProfile,
  MentorshipPayload,
  MentorTop3,
  ModelMetrics,
  NlpRow,
  OpportunityListing,
  PlatformKpis,
  Recommendation,
  RiskRow,
  SessionLog,
  StudentProfile,
} from "@/lib/jointhub/types";

const DATA_DIR = join(process.cwd(), "src/lib/jointhub/data");

function readJson<T>(name: string): T {
  const raw = readFileSync(join(DATA_DIR, name), "utf8");
  return JSON.parse(raw) as T;
}

/** Stable hash so the same student always maps to the same ESL mentor. */
function hashToIndex(seed: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return modulo === 0 ? 0 : hash % modulo;
}

function availabilityHours(mentorId: string): number {
  const mentor = ESL_MENTORS.find((item) => item.id === mentorId);
  if (!mentor) return 6;
  if (mentor.availability.includes("weekdays") && mentor.availability.includes("evenings")) {
    return 8;
  }
  if (mentor.availability.includes("async")) return 7;
  return 6;
}

function eslMentorProfiles(): MentorProfile[] {
  return ESL_MENTORS.map((mentor) => ({
    mentor_id: mentor.id,
    name: mentor.name,
    country: mentor.location,
    industry: mentor.role,
    skills_offered: mentor.focusAreas,
    skills_vector: mentor.focusAreas.map(() => 1),
    career_stage_mentor: 5,
    availability_hrs_per_month: availabilityHours(mentor.id),
    languages: ["English"],
    title: mentor.role,
    bio: mentor.blurb,
    image: mentor.image,
    linkedInUrl: mentor.linkedInUrl,
  }));
}

function pickEslMentorsForStudent(studentId: string, count = 3): MentorProfile[] {
  const roster = eslMentorProfiles();
  if (roster.length === 0) return [];
  const start = hashToIndex(studentId, roster.length);
  const picks: MentorProfile[] = [];
  for (let i = 0; i < Math.min(count, roster.length); i += 1) {
    picks.push(roster[(start + i) % roster.length]!);
  }
  return picks;
}

type RawRecommendationBundle = {
  student_id: string;
  full_name: string;
  email: string;
  top5: Array<{
    opp_id: string;
    title: string;
    org_name: string;
    type: string;
    deadline: string;
    match_score: number;
    is_verified: boolean;
    is_scam_flag?: boolean;
    description?: string;
    eligible_countries?: string[];
    interest_overlap?: string[];
  }>;
  recommendation_sentence?: string;
};

type RawMentorship = {
  assignments: Array<{
    student_id: string;
    student_name: string;
    mentor_id: string;
    mentor_name: string;
    compatibility_score: number;
    mentor_industry: string;
    mentor_country: string;
    shared_skills?: string[];
  }>;
  top3_by_student: Array<{
    student_id: string;
    recommendations: Array<{
      mentor_id: string;
      mentor_name: string;
      compatibility_score: number;
      industry: string;
      country: string;
      availability_hrs_per_month: number;
      skills_offered?: string[];
      title?: string;
    }>;
  }>;
  sessions: Array<{
    session_id: string;
    student_id: string;
    mentor_id: string;
    session_date: string;
    session_duration_mins: number;
    topics_discussed: string[];
    student_rating: number;
    goals_set: boolean;
    days_since_last_session: number;
    status?: "completed" | "scheduled";
    student_name?: string;
    mentor_name?: string;
  }>;
  mentors: MentorProfile[];
  matrix: number[][];
  student_labels: string[];
  mentor_labels: string[];
};

type RawRisk = {
  predictions: Array<{
    student_id: string;
    full_name: string;
    email: string;
    features: RiskRow["features"];
    risk_probability: number;
    at_risk: boolean;
    risk_level: "low" | "medium" | "high";
    top_risk_factor: string;
    outreach_prompt: string;
  }>;
};

export function getStudents(): StudentProfile[] {
  return readJson<StudentProfile[]>("students.json").map((student) => ({
    ...student,
    programme: student.programme ?? "JointHub Leader",
    campus: student.campus ?? "ALU",
  }));
}

export function getMentors(): MentorProfile[] {
  // Single source of truth with the public ESL Mentors page / Kay matching quiz.
  return eslMentorProfiles();
}

export function getOpportunities(): OpportunityListing[] {
  return readJson<OpportunityListing[]>("opportunities.json");
}

export function getAuthUsers(): AuthUser[] {
  return readJson<AuthUser[]>("auth_users.json");
}

export function getKpis(): PlatformKpis {
  return readJson<PlatformKpis>("kpis.json");
}

export function getMetrics(): ModelMetrics {
  return readJson<ModelMetrics>("metrics.json");
}

export function getRecommendationsMap(): Record<string, Recommendation[]> {
  const rows = readJson<RawRecommendationBundle[]>("recommendations.json");
  const map: Record<string, Recommendation[]> = {};
  for (const row of rows) {
    map[row.student_id] = row.top5.map((item) => ({
      opp_id: item.opp_id,
      title: item.title,
      org_name: item.org_name,
      type: item.type,
      deadline: item.deadline,
      match_score: item.match_score,
      is_verified: item.is_verified,
      is_scam_flag: item.is_scam_flag ?? false,
      description: item.description ?? `${item.type} from ${item.org_name}`,
      interest_overlap: item.interest_overlap ?? [],
    }));
  }
  return map;
}

export function getRecommendationSentenceMap(): Record<string, string> {
  const rows = readJson<RawRecommendationBundle[]>("recommendations.json");
  const map: Record<string, string> = {};
  for (const row of rows) {
    if (row.recommendation_sentence) {
      map[row.student_id] = row.recommendation_sentence;
    }
  }
  return map;
}

export function getMentorship(): MentorshipPayload {
  const raw = readJson<RawMentorship>("mentorship.json");
  const mentors = getMentors();

  // Remap Capstone sample pairings onto the live ESL mentor roster for consistent matching.
  const assignments: MentorAssignment[] = raw.assignments.map((row) => {
    const primary = pickEslMentorsForStudent(row.student_id, 1)[0] ?? mentors[0]!;
    const fitBase = 0.72 + (hashToIndex(row.student_id + primary.mentor_id, 20) / 100);
    return {
      student_id: row.student_id,
      student_name: row.student_name,
      mentor_id: primary.mentor_id,
      mentor_name: primary.name,
      mentor_title: primary.title ?? primary.industry,
      mentor_industry: primary.industry,
      mentor_country: primary.country,
      compatibility: Math.min(0.96, Number(fitBase.toFixed(2))),
      languages: primary.languages,
    };
  });

  const top3: Record<string, MentorTop3[]> = {};
  const studentIds = new Set<string>([
    ...raw.top3_by_student.map((entry) => entry.student_id),
    ...assignments.map((row) => row.student_id),
  ]);
  for (const studentId of studentIds) {
    const picks = pickEslMentorsForStudent(studentId, 3);
    top3[studentId] = picks.map((mentor, index) => ({
      mentor_id: mentor.mentor_id,
      mentor_name: mentor.name,
      title: mentor.title ?? mentor.industry,
      industry: mentor.industry,
      country: mentor.country,
      score: Number((0.9 - index * 0.08 + hashToIndex(studentId + mentor.mentor_id, 5) / 100).toFixed(2)),
      skills_offered: mentor.skills_offered,
      availability_hrs_per_month: mentor.availability_hrs_per_month,
    }));
  }

  const sessions: SessionLog[] = raw.sessions.map((session) => {
    const assigned =
      assignments.find((row) => row.student_id === session.student_id) ??
      assignments[hashToIndex(session.session_id, Math.max(assignments.length, 1))];
    return {
      session_id: session.session_id,
      student_id: session.student_id,
      mentor_id: assigned?.mentor_id ?? mentors[0]?.mentor_id ?? session.mentor_id,
      session_date: session.session_date,
      session_duration_mins: session.session_duration_mins,
      topics_discussed: session.topics_discussed,
      student_rating: session.student_rating,
      goals_set: session.goals_set,
      days_since_last_session: session.days_since_last_session,
      status: session.status ?? "completed",
    };
  });

  // Rebuild a compact ESL-sized heatmap from remapped assignments for admin view.
  const studentLabels = assignments.map((row) => row.student_name);
  const mentorIds = mentors.map((mentor) => mentor.mentor_id);
  const mentorNames = mentors.map((mentor) => mentor.name);
  const matrix = assignments.map((row) =>
    mentorIds.map((mentorId) => {
      if (mentorId === row.mentor_id) return row.compatibility;
      const alt = top3[row.student_id]?.find((item) => item.mentor_id === mentorId);
      return alt ? alt.score * 0.85 : 0.12 + hashToIndex(row.student_id + mentorId, 25) / 100;
    }),
  );

  return {
    assignments,
    top3,
    heatmap: {
      student_ids: assignments.map((row) => row.student_id),
      student_names: studentLabels,
      mentor_ids: mentorIds,
      mentor_names: mentorNames,
      matrix,
    },
    sessions,
    mentors,
  };
}

export function getRiskRows(): RiskRow[] {
  const raw = readJson<RawRisk>("risk.json");
  return raw.predictions.map((row) => ({
    student_id: row.student_id,
    full_name: row.full_name,
    email: row.email,
    country: getStudents().find((student) => student.student_id === row.student_id)?.country ?? "—",
    risk_probability: row.risk_probability,
    at_risk: row.at_risk,
    risk_level: row.risk_level,
    top_risk_factor: row.top_risk_factor,
    features: row.features,
    outreach_prompt: row.outreach_prompt,
  }));
}

export function getNlpRows(): NlpRow[] {
  const rows =
    readJson<
      Array<{
        student_id: string;
        full_name: string;
        career_goal_text: string;
        entities: NlpRow["entities"];
        top_tags: string[];
        recommendation_sentence: string;
        best_opp_id?: string | null;
        best_score?: number;
      }>
    >("nlp.json");

  const recMap = getRecommendationsMap();
  return rows.map((row) => {
    const top = recMap[row.student_id]?.[0];
    return {
      student_id: row.student_id,
      full_name: row.full_name,
      career_goal_text: row.career_goal_text,
      entities: row.entities,
      top_tags: row.top_tags,
      recommendation_sentence: row.recommendation_sentence,
      best_opp_id: row.best_opp_id ?? top?.opp_id ?? null,
      best_score: row.best_score ?? top?.match_score ?? 0,
    };
  });
}

export function findAuthUser(email: string): AuthUser | undefined {
  const normalized = email.trim().toLowerCase();
  return getAuthUsers().find((user) => user.email.toLowerCase() === normalized);
}

export function findStudent(studentId: string | null | undefined): StudentProfile | null {
  if (!studentId) {
    return null;
  }
  return getStudents().find((student) => student.student_id === studentId) ?? null;
}
