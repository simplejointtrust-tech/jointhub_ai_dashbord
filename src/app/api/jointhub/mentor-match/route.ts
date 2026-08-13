import { NextResponse } from "next/server";
import { describeQuizAnswers, matchMentors, type QuizAnswers } from "@/lib/jointhub/esl-mentors";

const GOALS = new Set(["career", "academic", "startup", "leadership", "creative", "community"]);
const STYLES = new Set(["hands-on", "reflective", "structured", "conversational"]);
const AVAIL = new Set(["weekdays", "evenings", "weekends", "async"]);

function isQuizAnswers(value: unknown): value is QuizAnswers {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.goal === "string" &&
    GOALS.has(v.goal) &&
    typeof v.learningStyle === "string" &&
    STYLES.has(v.learningStyle) &&
    typeof v.availability === "string" &&
    AVAIL.has(v.availability)
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isQuizAnswers(body)) {
    return NextResponse.json(
      {
        error: "Answer all three questions: goal, learningStyle, and availability.",
      },
      { status: 400 },
    );
  }

  const matches = matchMentors(body, 3);

  return NextResponse.json({
    coach: "Kay",
    summary: `Based on ${describeQuizAnswers(body)}, here are your strongest mentor fits.`,
    answers: body,
    matches: matches.map((match) => ({
      id: match.id,
      name: match.name,
      role: match.role,
      location: match.location,
      blurb: match.blurb,
      image: match.image,
      linkedInUrl: match.linkedInUrl,
      match_score: match.score,
      reasons: match.reasons,
    })),
  });
}
