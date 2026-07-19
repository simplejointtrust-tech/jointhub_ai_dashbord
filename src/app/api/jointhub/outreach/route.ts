import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/jointhub/auth";
import { getRiskRows } from "@/lib/jointhub/data-store";

export const runtime = "nodejs";

/**
 * Demo outreach trigger for Capstone risk module.
 * Does not send email (operating constraint). Records a client-visible status payload.
 */
export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json(
      { error: "Admin role required to trigger outreach." },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as { student_id?: string } | null;
  const studentId = body?.student_id;
  if (!studentId) {
    return NextResponse.json({ error: "student_id required" }, { status: 400 });
  }

  const row = getRiskRows().find((item) => item.student_id === studentId);
  if (!row) {
    return NextResponse.json({ error: "Student not found in risk model output." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    student_id: studentId,
    full_name: row.full_name,
    risk_probability: row.risk_probability,
    outreach_prompt: row.outreach_prompt,
    status: "queued_for_mentor",
    note: "Email delivery is intentionally disabled in this demo. Prompt is ready for mentor staff.",
    triggered_at: new Date().toISOString(),
  });
}
