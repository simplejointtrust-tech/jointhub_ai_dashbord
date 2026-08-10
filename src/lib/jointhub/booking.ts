/**
 * Build a working mentor session booking URL.
 * Prefer Calendly when a mentor link exists; otherwise open a Google Calendar
 * event template the leader can send to the mentor.
 */

export type MentorBookingInput = {
  mentorName: string;
  topic: string;
  note?: string;
  /** Public Calendly scheduling link when the mentor has one */
  calendlyUrl?: string | null;
  /** Mentor email used as Google Calendar guest when Calendly is unavailable */
  bookingEmail?: string | null;
  /** Optional student/leader name for Calendly prefills */
  requesterName?: string | null;
  /** Optional student/leader email for Calendly prefills */
  requesterEmail?: string | null;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Next weekday at 15:00–16:00 UTC as Google Calendar compact timestamps. */
export function nextWeekdaySessionWindow(from = new Date()): { start: string; end: string } {
  const start = new Date(from);
  start.setUTCMinutes(0, 0, 0);
  start.setUTCHours(15);

  // Move to tomorrow first so "book now" never targets a half-finished hour.
  start.setUTCDate(start.getUTCDate() + 1);
  while (start.getUTCDay() === 0 || start.getUTCDay() === 6) {
    start.setUTCDate(start.getUTCDate() + 1);
  }

  const end = new Date(start);
  end.setUTCHours(16);

  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

  return { start: fmt(start), end: fmt(end) };
}

function appendCalendlyPrefill(baseUrl: string, input: MentorBookingInput): string {
  try {
    const url = new URL(baseUrl);
    if (input.requesterName) url.searchParams.set("name", input.requesterName);
    if (input.requesterEmail) url.searchParams.set("email", input.requesterEmail);
    const a1Parts = [input.topic.trim(), input.note?.trim()].filter(Boolean);
    if (a1Parts.length > 0) url.searchParams.set("a1", a1Parts.join(" — "));
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function buildGoogleCalendarSessionUrl(input: MentorBookingInput): string {
  const { start, end } = nextWeekdaySessionWindow();
  const title = `JointHub mentor session · ${input.topic} · ${input.mentorName}`;
  const details = [
    "Session request from JointHub Africa Mentor Hub.",
    `Mentor: ${input.mentorName}`,
    `Topic: ${input.topic}`,
    input.note?.trim() ? `Note: ${input.note.trim()}` : null,
    input.requesterName ? `Requested by: ${input.requesterName}` : null,
    "Please confirm or propose another time if needed.",
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details,
    dates: `${start}/${end}`,
  });
  if (input.bookingEmail?.trim()) {
    params.set("add", input.bookingEmail.trim());
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildMentorSessionBookingUrl(input: MentorBookingInput): {
  url: string;
  channel: "calendly" | "google_calendar";
} {
  const calendly = input.calendlyUrl?.trim();
  if (calendly) {
    return {
      url: appendCalendlyPrefill(calendly, input),
      channel: "calendly",
    };
  }
  return {
    url: buildGoogleCalendarSessionUrl(input),
    channel: "google_calendar",
  };
}

/** Demo / roster booking contacts. Calendly wins when present. */
export const MENTOR_BOOKING_CONTACTS: Record<
  string,
  { bookingEmail?: string; calendlyUrl?: string }
> = {
  "michael-adeniyi": {
    bookingEmail: "mentor1@jointhub.demo",
  },
  "isaiah-kporon": {
    bookingEmail: "simplejoint.info@gmail.com",
  },
};

export function resolveMentorBookingContact(mentorId?: string | null): {
  bookingEmail?: string;
  calendlyUrl?: string;
} {
  if (!mentorId) return {};
  return MENTOR_BOOKING_CONTACTS[mentorId] ?? {};
}
