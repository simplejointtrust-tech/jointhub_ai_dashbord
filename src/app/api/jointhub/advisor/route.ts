import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/jointhub/auth";
import { findStudent } from "@/lib/jointhub/data-store";
import { answerAdvisor } from "@/lib/jointhub/leader-experience";

export const runtime = "nodejs";

type AdvisorBody = {
  message?: string;
  student_id?: string;
};

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: AdvisorBody;
  try {
    body = (await request.json()) as AdvisorBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = body.message?.trim() ?? "";
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }
  if (message.length > 800) {
    return NextResponse.json({ error: "Keep questions under 800 characters." }, { status: 400 });
  }

  const isAdmin = session.role === "admin";
  let studentId = session.student_id;
  if (isAdmin && body.student_id) {
    studentId = body.student_id;
  }

  if (!studentId) {
    return NextResponse.json(
      {
        error:
          "Pick a focus leader first (admin), or sign in as a leader demo account to chat with the AI Coach.",
      },
      { status: 400 },
    );
  }

  const student = findStudent(studentId);
  if (!student) {
    return NextResponse.json({ error: "Leader profile not found." }, { status: 404 });
  }

  const payload = answerAdvisor(studentId, message);
  return NextResponse.json({
    ...payload,
    student: {
      student_id: student.student_id,
      full_name: student.full_name,
      country: student.country,
    },
    role: session.role,
  });
}
