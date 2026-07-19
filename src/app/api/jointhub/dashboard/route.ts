import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/jointhub/auth";
import {
  findStudent,
  getKpis,
  getMentorship,
  getMetrics,
  getNlpRows,
  getRecommendationSentenceMap,
  getRecommendationsMap,
  getRiskRows,
  getStudents,
} from "@/lib/jointhub/data-store";
import type { DashboardBundle, MentorshipPayload } from "@/lib/jointhub/types";

export const runtime = "nodejs";

function buildMentorship(studentId: string | null, isAdmin: boolean): MentorshipPayload {
  const raw = getMentorship();

  if (isAdmin || !studentId) {
    return raw;
  }

  return {
    assignments: raw.assignments.filter((row) => row.student_id === studentId),
    top3: { [studentId]: raw.top3[studentId] ?? [] },
    heatmap: raw.heatmap,
    sessions: raw.sessions.filter((row) => row.student_id === studentId),
    mentors: raw.mentors,
  };
}

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const url = new URL(request.url);
  const requestedStudent = url.searchParams.get("student_id");
  const isAdmin = session.role === "admin";

  let studentId = session.student_id;
  if (isAdmin && requestedStudent) {
    studentId = requestedStudent;
  }

  const student = findStudent(studentId);
  const recommendationsMap = getRecommendationsMap();
  const sentenceMap = getRecommendationSentenceMap();
  const nlpRows = getNlpRows();
  const riskRows = getRiskRows();

  const recommendations =
    isAdmin && !studentId
      ? Object.values(recommendationsMap).flat().slice(0, 12)
      : (recommendationsMap[studentId ?? ""] ?? []);

  const nlp =
    isAdmin && !studentId ? nlpRows : nlpRows.filter((row) => row.student_id === studentId);

  const risk = isAdmin ? riskRows : riskRows.filter((row) => row.student_id === studentId);

  const personalised =
    (studentId ? sentenceMap[studentId] : null) ?? nlp[0]?.recommendation_sentence ?? null;

  const bundle: DashboardBundle = {
    student,
    kpis: getKpis(),
    metrics: getMetrics(),
    recommendations,
    mentorship: buildMentorship(studentId, isAdmin),
    risk,
    nlp,
    role: session.role,
    auth_email: session.email,
    personalised_sentence: personalised,
  };

  return NextResponse.json({
    ...bundle,
    students: isAdmin
      ? getStudents().map((s) => ({
          student_id: s.student_id,
          full_name: s.full_name,
          email: s.email,
          country: s.country,
        }))
      : undefined,
  });
}
