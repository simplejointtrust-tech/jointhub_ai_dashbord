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
import {
  getCommunityFeed,
  getLeaderApplications,
  getLeaderOverview,
  getMentorOverview,
} from "@/lib/jointhub/leader-experience";
import type { DashboardBundle, MentorshipPayload } from "@/lib/jointhub/types";

export const runtime = "nodejs";

function buildMentorship(
  studentId: string | null,
  isAdmin: boolean,
  mentorId: string | null,
  menteeIds: Set<string>,
): MentorshipPayload {
  const raw = getMentorship();

  if (isAdmin) {
    return raw;
  }

  if (mentorId) {
    return {
      assignments: raw.assignments.filter((row) => row.mentor_id === mentorId),
      top3: Object.fromEntries(
        Array.from(menteeIds).map((id) => [id, raw.top3[id] ?? []]),
      ),
      heatmap: raw.heatmap,
      sessions: raw.sessions.filter((row) => row.mentor_id === mentorId),
      mentors: raw.mentors.filter((row) => row.mentor_id === mentorId),
    };
  }

  if (!studentId) {
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
  const isMentor = session.role === "mentor";
  const mentorId = session.mentor_id ?? null;
  const mentorOverview = isMentor ? getMentorOverview(mentorId) : null;
  const menteeIds = new Set(mentorOverview?.mentees.map((row) => row.student_id) ?? []);

  let studentId = session.student_id;
  if (isAdmin && requestedStudent) {
    studentId = requestedStudent;
  }
  if (isMentor) {
    if (requestedStudent && menteeIds.has(requestedStudent)) {
      studentId = requestedStudent;
    } else {
      studentId = mentorOverview?.mentees[0]?.student_id ?? null;
    }
  }

  const student = findStudent(studentId);
  const recommendationsMap = getRecommendationsMap();
  const sentenceMap = getRecommendationSentenceMap();
  const nlpRows = getNlpRows();
  const riskRows = getRiskRows();

  const recommendations =
    isAdmin && !studentId
      ? Object.values(recommendationsMap).flat().slice(0, 40)
      : isMentor
        ? Array.from(menteeIds).flatMap((id) => recommendationsMap[id] ?? []).slice(0, 40)
        : (recommendationsMap[studentId ?? ""] ?? []);

  const nlp =
    isAdmin && !studentId
      ? nlpRows
      : isMentor
        ? nlpRows.filter((row) => menteeIds.has(row.student_id))
        : nlpRows.filter((row) => row.student_id === studentId);

  const risk = isAdmin
    ? riskRows
    : isMentor
      ? riskRows.filter((row) => menteeIds.has(row.student_id))
      : riskRows.filter((row) => row.student_id === studentId);

  const personalised =
    (studentId ? sentenceMap[studentId] : null) ?? nlp[0]?.recommendation_sentence ?? null;

  const overviewStudentId =
    studentId ?? (isAdmin ? (getStudents()[0]?.student_id ?? null) : null);

  const bundle: DashboardBundle = {
    student,
    kpis: getKpis(),
    metrics: getMetrics(),
    recommendations,
    mentorship: buildMentorship(studentId, isAdmin, isMentor ? mentorId : null, menteeIds),
    risk,
    nlp,
    role: session.role,
    auth_email: session.email,
    personalised_sentence: personalised,
  };

  return NextResponse.json({
    ...bundle,
    students:
      isAdmin || isMentor
        ? isMentor
          ? mentorOverview?.mentees.map((item) => ({
              student_id: item.student_id,
              full_name: item.full_name,
              email:
                getStudents().find((row) => row.student_id === item.student_id)?.email ?? "",
              country: item.country,
            })) ?? []
          : getStudents().map((s) => ({
              student_id: s.student_id,
              full_name: s.full_name,
              email: s.email,
              country: s.country,
            }))
        : undefined,
    overview: !isMentor && overviewStudentId ? getLeaderOverview(overviewStudentId) : null,
    mentor_overview: mentorOverview,
    applications: overviewStudentId ? getLeaderApplications(overviewStudentId) : [],
    community: getCommunityFeed(overviewStudentId),
  });
}
