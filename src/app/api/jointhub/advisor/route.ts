import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/jointhub/auth";
import { findStudent } from "@/lib/jointhub/data-store";
import {
  answerAdvisor,
  getMentorOverview,
  type AdvisorChatTurn,
} from "@/lib/jointhub/leader-experience";

export const runtime = "nodejs";

type AdvisorBody = {
  message?: string;
  student_id?: string;
  history?: AdvisorChatTurn[];
};

function sanitizeHistory(raw: unknown): AdvisorChatTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is AdvisorChatTurn => {
      if (!item || typeof item !== "object") return false;
      const turn = item as AdvisorChatTurn;
      return (
        (turn.role === "user" || turn.role === "assistant") &&
        typeof turn.content === "string" &&
        turn.content.trim().length > 0
      );
    })
    .map((turn) => ({
      role: turn.role,
      content: turn.content.trim().slice(0, 800),
    }))
    .slice(-12);
}

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
  const isMentor = session.role === "mentor";
  const mentorOverview = isMentor ? getMentorOverview(session.mentor_id ?? null) : null;
  const menteeIds = new Set(mentorOverview?.mentees.map((row) => row.student_id) ?? []);

  let studentId = session.student_id;
  if (isAdmin && body.student_id) {
    studentId = body.student_id;
  }
  if (isMentor) {
    if (body.student_id && menteeIds.has(body.student_id)) {
      studentId = body.student_id;
    } else {
      studentId = mentorOverview?.mentees[0]?.student_id ?? null;
    }
  }

  if (!studentId) {
    return NextResponse.json(
      {
        error: isMentor
          ? "No mentee is assigned to this mentor demo account yet."
          : "Pick a focus leader first (admin), or sign in as a leader demo account to chat with the AI Coach.",
      },
      { status: 400 },
    );
  }

  const student = findStudent(studentId);
  if (!student) {
    return NextResponse.json({ error: "Leader profile not found." }, { status: 404 });
  }

  const history = sanitizeHistory(body.history);
  const payload = answerAdvisor(studentId, message, history, session.role);
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
