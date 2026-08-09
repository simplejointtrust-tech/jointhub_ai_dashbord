import { redirect } from "next/navigation";

/** Keep legacy path; primary role login is /login with email + password. */
export default function DashboardLoginRedirectPage() {
  redirect("/login");
}
