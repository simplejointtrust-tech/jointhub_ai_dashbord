/**
 * Server-only sample data store for JointHub Capstone modules.
 * Adapts generator JSON into stable dashboard shapes.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
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
    programme: student.programme ?? "JointHub Scholar",
    campus: student.campus ?? "ALU",
  }));
}

export function getMentors(): MentorProfile[] {
  return readJson<MentorProfile[]>("mentors.json").map((mentor) => ({
    ...mentor,
    title: mentor.title ?? `${mentor.industry} mentor`,
    bio: mentor.bio ?? "Professional mentor supporting African scholars on JointHub Africa.",
  }));
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
  const mentors = (raw.mentors?.length ? raw.mentors : getMentors()).map((mentor) => ({
    ...mentor,
    title: mentor.title ?? `${mentor.industry} mentor`,
    bio: mentor.bio ?? "Professional mentor supporting African scholars on JointHub Africa.",
  }));
  const mentorById = new Map(mentors.map((mentor) => [mentor.mentor_id, mentor]));

  const assignments: MentorAssignment[] = raw.assignments.map((row) => {
    const mentor = mentorById.get(row.mentor_id);
    return {
      student_id: row.student_id,
      student_name: row.student_name,
      mentor_id: row.mentor_id,
      mentor_name: row.mentor_name,
      mentor_title: mentor?.title ?? `${row.mentor_industry} mentor`,
      mentor_industry: row.mentor_industry,
      mentor_country: row.mentor_country,
      compatibility: row.compatibility_score,
      languages: mentor?.languages ?? ["English"],
    };
  });

  const top3: Record<string, MentorTop3[]> = {};
  for (const entry of raw.top3_by_student) {
    top3[entry.student_id] = entry.recommendations.map((item) => {
      const mentor = mentorById.get(item.mentor_id);
      return {
        mentor_id: item.mentor_id,
        mentor_name: item.mentor_name,
        title: item.title ?? mentor?.title ?? `${item.industry} mentor`,
        industry: item.industry,
        country: item.country,
        score: item.compatibility_score,
        skills_offered: item.skills_offered ?? mentor?.skills_offered ?? [],
        availability_hrs_per_month: item.availability_hrs_per_month,
      };
    });
  }

  const sessions: SessionLog[] = raw.sessions.map((session) => ({
    session_id: session.session_id,
    student_id: session.student_id,
    mentor_id: session.mentor_id,
    session_date: session.session_date,
    session_duration_mins: session.session_duration_mins,
    topics_discussed: session.topics_discussed,
    student_rating: session.student_rating,
    goals_set: session.goals_set,
    days_since_last_session: session.days_since_last_session,
    status: session.status ?? "completed",
  }));

  return {
    assignments,
    top3,
    heatmap: {
      student_ids: assignments.map((row) => row.student_id),
      student_names: raw.student_labels,
      mentor_ids: mentors.map((mentor) => mentor.mentor_id),
      mentor_names: raw.mentor_labels,
      matrix: raw.matrix,
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
