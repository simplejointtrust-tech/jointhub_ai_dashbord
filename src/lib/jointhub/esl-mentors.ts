export type MentorCard = {
  id: string;
  name: string;
  role: string;
  location: string;
  blurb: string;
  image: string;
  /** Public LinkedIn profile URL opened by View profile */
  linkedInUrl: string;
  /** Optional Calendly scheduling URL for Book a session */
  calendlyUrl?: string;
  /** Optional mentor email for Google Calendar session invites */
  bookingEmail?: string;
  /** Tags used by AI Coach Kay for mentor matching */
  focusAreas: string[];
  learningStyles: Array<"hands-on" | "reflective" | "structured" | "conversational">;
  availability: Array<"weekdays" | "evenings" | "weekends" | "async">;
};

export type QuizAnswers = {
  goal: "career" | "academic" | "startup" | "leadership" | "creative" | "community";
  learningStyle: "hands-on" | "reflective" | "structured" | "conversational";
  availability: "weekdays" | "evenings" | "weekends" | "async";
};

export type MentorMatch = MentorCard & {
  score: number;
  reasons: string[];
};

export const ESL_MENTORS: MentorCard[] = [
  {
    id: "jane-obed",
    name: "Jane Obel",
    role: "Product leader",
    location: "Rwanda",
    blurb: "Design strategy, research craft, and confident portfolios.",
    image: "/brand/mentors/jane-obed.jpg",
    linkedInUrl: "https://www.linkedin.com/in/jane-obel/",
    focusAreas: ["career", "creative", "leadership"],
    learningStyles: ["structured", "conversational", "reflective"],
    availability: ["weekdays", "evenings", "async"],
  },
  {
    id: "edafe-akpovwa",
    name: "Edafe Akpovwa",
    role: "Engineering mentor",
    location: "Rwanda",
    blurb: "Technical career choices, prototypes, and practical problem-solving.",
    image: "/brand/mentors/edafe-akpovwa.jpg",
    linkedInUrl: "https://www.linkedin.com/in/edafe-akpovwa-643738193",
    focusAreas: ["career", "startup", "leadership"],
    learningStyles: ["hands-on", "structured"],
    availability: ["evenings", "weekends", "async"],
  },
  {
    id: "bothlale-mdluli",
    name: "Botlhale Mdhluli",
    role: "Career strategist",
    location: "South Africa",
    blurb: "Career narratives, pivots, and networking with purpose.",
    image: "/brand/mentors/bothlale-mdluli.jpg",
    linkedInUrl: "https://www.linkedin.com/in/botlhale-mdhluli-511549287/",
    focusAreas: ["career", "leadership", "community"],
    learningStyles: ["conversational", "reflective", "structured"],
    availability: ["weekdays", "evenings", "async"],
  },
  {
    id: "ololade-oloniyo",
    name: "Ololade Oloniyo",
    role: "Creative director",
    location: "Nigeria",
    blurb: "Emerging creators, visual strategy, and distinctive brand identity.",
    image: "/brand/mentors/ololade-oloniyo.jpg",
    linkedInUrl: "https://www.linkedin.com/in/oloniyoololade",
    focusAreas: ["creative", "startup", "career"],
    learningStyles: ["hands-on", "conversational", "reflective"],
    availability: ["evenings", "weekends", "async"],
  },
  {
    id: "isaiah-kporon",
    name: "Isaiah Kporon",
    role: "Executive coach",
    location: "Rwanda",
    blurb: "Leadership acceleration, strategic thinking, and executive presence.",
    image: "/brand/mentors/isaiah-kporon.jpg",
    linkedInUrl: "https://www.linkedin.com/in/isaiahkporon",
    bookingEmail: "simplejoint.info@gmail.com",
    focusAreas: ["leadership", "community", "career"],
    learningStyles: ["conversational", "reflective", "structured"],
    availability: ["weekdays", "evenings", "async"],
  },
  {
    id: "chengetai-chikadaya",
    name: "Chengetai Chikadaya",
    role: "Academic coach",
    location: "Zimbabwe",
    blurb: "Scholarly research, academic publishing, and confident pathways.",
    image: "/brand/mentors/chengetai-chikadaya.jpg",
    linkedInUrl: "https://www.linkedin.com/in/chengetaichikadaya",
    focusAreas: ["academic", "career", "leadership"],
    learningStyles: ["structured", "reflective"],
    availability: ["weekdays", "async", "evenings"],
  },
  {
    id: "michael-adeniyi",
    name: "Michael Adeniyi",
    role: "Entrepreneurship mentor",
    location: "Nigeria",
    blurb: "Idea validation, fundraising, and building resilient startups.",
    image: "/brand/mentors/michael-adeniyi.jpg",
    linkedInUrl: "https://www.linkedin.com/search/results/people/?keywords=Michael%20Adeniyi",
    bookingEmail: "mentor1@jointhub.demo",
    focusAreas: ["startup", "leadership", "community"],
    learningStyles: ["hands-on", "conversational"],
    availability: ["evenings", "weekends", "async"],
  },
  {
    id: "blessing-matiro",
    name: "Blessing Matiro",
    role: "Data science mentor",
    location: "South Africa",
    blurb: "Analytical skills, research publishing, and meaningful technical roles.",
    image: "/brand/mentors/blessing-matiro.jpg",
    linkedInUrl: "https://www.linkedin.com/in/blessing-matiro-5618b3143",
    focusAreas: ["career", "academic", "startup"],
    learningStyles: ["structured", "hands-on", "reflective"],
    availability: ["weekdays", "evenings", "async"],
  },
  {
    id: "stephen-david",
    name: "Stephen David",
    role: "Community builder",
    location: "Rwanda",
    blurb: "Social impact initiatives, network building, and community engagement.",
    image: "/brand/mentors/stephen-david.jpg",
    linkedInUrl: "https://www.linkedin.com/in/stephen-david-mhya",
    focusAreas: ["community", "leadership", "career"],
    learningStyles: ["conversational", "hands-on", "reflective"],
    availability: ["weekends", "evenings", "async"],
  },
];

const GOAL_LABELS: Record<QuizAnswers["goal"], string> = {
  career: "career growth",
  academic: "academic pathways",
  startup: "entrepreneurship",
  leadership: "leadership development",
  creative: "creative practice",
  community: "community impact",
};

const STYLE_LABELS: Record<QuizAnswers["learningStyle"], string> = {
  "hands-on": "hands-on practice",
  reflective: "reflective coaching",
  structured: "structured guidance",
  conversational: "open conversation",
};

const AVAIL_LABELS: Record<QuizAnswers["availability"], string> = {
  weekdays: "weekday sessions",
  evenings: "evening check-ins",
  weekends: "weekend sessions",
  async: "async mentoring",
};

export function matchMentors(answers: QuizAnswers, limit = 3): MentorMatch[] {
  return ESL_MENTORS.map((mentor) => {
    let score = 0.18;
    const reasons: string[] = [];

    if (mentor.focusAreas.includes(answers.goal)) {
      score += 0.42;
      reasons.push(`Strong fit for ${GOAL_LABELS[answers.goal]}`);
    } else if (
      mentor.focusAreas.some(
        (area) =>
          ["career", "leadership"].includes(area) &&
          ["career", "leadership", "academic"].includes(answers.goal),
      )
    ) {
      score += 0.18;
      reasons.push(`Adjacent support for ${GOAL_LABELS[answers.goal]}`);
    }

    if (mentor.learningStyles.includes(answers.learningStyle)) {
      score += 0.24;
      reasons.push(`Matches your preference for ${STYLE_LABELS[answers.learningStyle]}`);
    }

    if (mentor.availability.includes(answers.availability)) {
      score += 0.16;
      reasons.push(`Available for ${AVAIL_LABELS[answers.availability]}`);
    }

    if (reasons.length === 0) {
      reasons.push(`${mentor.role} with practical guidance for ESL leaders`);
    }

    return {
      ...mentor,
      score: Math.min(0.97, Number(score.toFixed(2))),
      reasons: reasons.slice(0, 3),
    };
  })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function describeQuizAnswers(answers: QuizAnswers): string {
  return `${GOAL_LABELS[answers.goal]}, ${STYLE_LABELS[answers.learningStyle]}, ${AVAIL_LABELS[answers.availability]}`;
}
