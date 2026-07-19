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

  const recommendations =
    isAdmin && !session.student_id
      ? Object.values(recommendationsMap).flat().slice(0, 12)
      : (recommendationsMap[session.student_id ?? ""] ?? []);

  const nlp =
    isAdmin && !session.student_id
      ? nlpRows
      : nlpRows.filter((row) => row.student_id === session.student_id);

  const risk = isAdmin ? riskRows : riskRows.filter((row) => row.student_id === session.student_id);

  const mentorship = {
    assignments: isAdmin
      ? mentorshipRaw.assignments
      : mentorshipRaw.assignments.filter((row) => row.student_id === session.student_id),
    top3:
      isAdmin || !session.student_id
        ? mentorshipRaw.top3
        : { [session.student_id]: mentorshipRaw.top3[session.student_id] ?? [] },
    heatmap: mentorshipRaw.heatmap,
    sessions: isAdmin
      ? mentorshipRaw.sessions
      : mentorshipRaw.sessions.filter((row) => row.student_id === session.student_id),
    mentors: mentorshipRaw.mentors,
  };

  const personalised =
    (session.student_id ? sentenceMap[session.student_id] : null) ??
    nlp[0]?.recommendation_sentence ??
    null;

  const initialData: DashboardBundle & {
    students?: Array<{ student_id: string; full_name: string; email: string; country: string }>;
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
  };

  return <DashboardApp initialData={initialData} />;
}
