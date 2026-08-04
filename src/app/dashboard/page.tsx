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
  getScholarApplications,
  getScholarOverview,
} from "@/lib/jointhub/scholar-experience";
import type { DashboardBundle } from "@/lib/jointhub/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/dashboard/login");
  }

  const isAdmin = session.role === "admin";
  const student = findStudent(session.student_id);
  const recommendationsMap = getRecommendationsMap();
  const sentenceMap = getRecommendationSentenceMap();
  const nlpRows = getNlpRows();
  const riskRows = getRiskRows();
  const mentorshipRaw = getMentorship();

  const focusStudentId = session.student_id;

  const recommendations =
    isAdmin && !focusStudentId
      ? Object.values(recommendationsMap).flat().slice(0, 12)
      : (recommendationsMap[focusStudentId ?? ""] ?? []);

  const nlp =
    isAdmin && !focusStudentId
      ? nlpRows
      : nlpRows.filter((row) => row.student_id === focusStudentId);

  const risk = isAdmin ? riskRows : riskRows.filter((row) => row.student_id === focusStudentId);

  const mentorship = {
    assignments: isAdmin
      ? mentorshipRaw.assignments
      : mentorshipRaw.assignments.filter((row) => row.student_id === focusStudentId),
    top3:
      isAdmin || !focusStudentId
        ? mentorshipRaw.top3
        : { [focusStudentId]: mentorshipRaw.top3[focusStudentId] ?? [] },
    heatmap: mentorshipRaw.heatmap,
    sessions: isAdmin
      ? mentorshipRaw.sessions
      : mentorshipRaw.sessions.filter((row) => row.student_id === focusStudentId),
    mentors: mentorshipRaw.mentors,
  };

  const personalised =
    (focusStudentId ? sentenceMap[focusStudentId] : null) ??
    nlp[0]?.recommendation_sentence ??
    null;

  const overviewStudentId = focusStudentId ?? (isAdmin ? getStudents()[0]?.student_id : null);

  const initialData: DashboardBundle & {
    students?: Array<{ student_id: string; full_name: string; email: string; country: string }>;
    overview?: ReturnType<typeof getScholarOverview> | null;
    applications?: ReturnType<typeof getScholarApplications>;
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
    students: isAdmin
      ? getStudents().map((item) => ({
          student_id: item.student_id,
          full_name: item.full_name,
          email: item.email,
          country: item.country,
        }))
      : undefined,
    overview: overviewStudentId ? getScholarOverview(overviewStudentId) : null,
    applications: overviewStudentId ? getScholarApplications(overviewStudentId) : [],
    community: getCommunityFeed(overviewStudentId),
  };

  return <DashboardApp initialData={initialData} />;
}
