import { redirect } from "next/navigation";
import { DashboardApp } from "@/components/jointhub/DashboardApp";
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
import type { DashboardBundle } from "@/lib/jointhub/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.role === "admin";
  const isMentor = session.role === "mentor";
  const mentorId = session.mentor_id ?? null;
  const mentorOverview = isMentor ? getMentorOverview(mentorId) : null;
  const menteeIds = new Set(mentorOverview?.mentees.map((row) => row.student_id) ?? []);

  const focusStudentId =
    session.student_id ??
    (isMentor ? (mentorOverview?.mentees[0]?.student_id ?? null) : null);

  const student = findStudent(focusStudentId);
  const recommendationsMap = getRecommendationsMap();
  const sentenceMap = getRecommendationSentenceMap();
  const nlpRows = getNlpRows();
  const riskRows = getRiskRows();
  const mentorshipRaw = getMentorship();

  const recommendations =
    isAdmin && !focusStudentId
      ? Object.values(recommendationsMap).flat().slice(0, 40)
      : isMentor
        ? Array.from(menteeIds).flatMap((id) => recommendationsMap[id] ?? []).slice(0, 40)
        : (recommendationsMap[focusStudentId ?? ""] ?? []);

  const nlp =
    isAdmin && !focusStudentId
      ? nlpRows
      : isMentor
        ? nlpRows.filter((row) => menteeIds.has(row.student_id))
        : nlpRows.filter((row) => row.student_id === focusStudentId);

  const risk = isAdmin
    ? riskRows
    : isMentor
      ? riskRows.filter((row) => menteeIds.has(row.student_id))
      : riskRows.filter((row) => row.student_id === focusStudentId);

  const mentorship = isAdmin
    ? mentorshipRaw
    : isMentor && mentorId
      ? {
          assignments: mentorshipRaw.assignments.filter((row) => row.mentor_id === mentorId),
          top3: Object.fromEntries(
            Array.from(menteeIds).map((id) => [id, mentorshipRaw.top3[id] ?? []]),
          ),
          heatmap: mentorshipRaw.heatmap,
          sessions: mentorshipRaw.sessions.filter((row) => row.mentor_id === mentorId),
          mentors: mentorshipRaw.mentors.filter((row) => row.mentor_id === mentorId),
        }
      : {
          assignments: mentorshipRaw.assignments.filter(
            (row) => row.student_id === focusStudentId,
          ),
          top3:
            focusStudentId != null
              ? { [focusStudentId]: mentorshipRaw.top3[focusStudentId] ?? [] }
              : {},
          heatmap: mentorshipRaw.heatmap,
          sessions: mentorshipRaw.sessions.filter((row) => row.student_id === focusStudentId),
          mentors: mentorshipRaw.mentors,
        };

  const personalised =
    (focusStudentId ? sentenceMap[focusStudentId] : null) ??
    nlp[0]?.recommendation_sentence ??
    null;

  const overviewStudentId =
    focusStudentId ?? (isAdmin ? getStudents()[0]?.student_id : null);

  const initialData: DashboardBundle & {
    students?: Array<{ student_id: string; full_name: string; email: string; country: string }>;
    overview?: ReturnType<typeof getLeaderOverview> | null;
    mentor_overview?: ReturnType<typeof getMentorOverview> | null;
    applications?: ReturnType<typeof getLeaderApplications>;
    community?: ReturnType<typeof getCommunityFeed>;
  } = {
    student,
    kpis: getKpis(),
    metrics: getMetrics(),
    recommendations,
    mentorship,
    risk,
    nlp,
    role: session.role,
    auth_email: session.email,
    personalised_sentence: personalised,
    students:
      isAdmin || isMentor
        ? (isMentor
            ? mentorOverview?.mentees.map((item) => ({
                student_id: item.student_id,
                full_name: item.full_name,
                email:
                  getStudents().find((row) => row.student_id === item.student_id)?.email ?? "",
                country: item.country,
              })) ?? []
            : getStudents().map((item) => ({
                student_id: item.student_id,
                full_name: item.full_name,
                email: item.email,
                country: item.country,
              })))
        : undefined,
    overview: !isMentor && overviewStudentId ? getLeaderOverview(overviewStudentId) : null,
    mentor_overview: mentorOverview,
    applications: overviewStudentId ? getLeaderApplications(overviewStudentId) : [],
    community: getCommunityFeed(overviewStudentId),
  };

  return <DashboardApp initialData={initialData} />;
}
