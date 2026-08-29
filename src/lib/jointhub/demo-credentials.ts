/**
 * Capstone demo accounts for Leader / Mentor / Admin role-based access.
 * Passwords are intentional demo secrets for judges and walkthroughs — not production IAM.
 */

export type DemoRole = "leader" | "mentor" | "admin";

export type DemoCredential = {
  email: string;
  password: string;
  role: DemoRole;
  label: string;
  fullName: string;
  dashboardHint: string;
};

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    email: "leader1@jointhub.demo",
    password: "LeaderDemo2026!",
    role: "leader",
    label: "Leader",
    fullName: "Callie Davis",
    dashboardHint: "ESL survey scholar workspace, opportunities, and AI Coach Kay",
  },
  {
    email: "mentor1@jointhub.demo",
    password: "MentorDemo2026!",
    role: "mentor",
    label: "Mentor",
    fullName: "Michael Adeniyi",
    dashboardHint: "ESL caseload, sessions, and mentee risk signals",
  },
  {
    email: "admin@jointhub.demo",
    password: "AdminDemo2026!",
    role: "admin",
    label: "Admin",
    fullName: "JointHub Admin",
    dashboardHint: "Full cohort + ESL survey insights, risk, and analytics",
  },
];

const byEmail = new Map(
  DEMO_CREDENTIALS.map((account) => [account.email.toLowerCase(), account]),
);

export function findDemoCredential(email: string): DemoCredential | undefined {
  return byEmail.get(email.trim().toLowerCase());
}

export function authenticateDemoCredential(
  email: string,
  password: string,
): DemoCredential | null {
  const account = findDemoCredential(email);
  if (!account || account.password !== password) {
    return null;
  }
  return account;
}

export function defaultEmailForRole(role: string | null | undefined): string {
  const normalized = (role ?? "").trim().toLowerCase();
  if (normalized === "mentor") return "mentor1@jointhub.demo";
  if (normalized === "admin") return "admin@jointhub.demo";
  if (normalized === "leader" || normalized === "student") {
    return "leader1@jointhub.demo";
  }
  return "leader1@jointhub.demo";
}

export const STAGING_LOGIN_URL =
  "https://staging.app.simplejoint-trust-4b4a02.cofounder.company/login";
