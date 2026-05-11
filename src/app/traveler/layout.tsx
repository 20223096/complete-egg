import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { dashboardPathForRole } from "@/lib/auth/paths";

export const dynamic = "force-dynamic";

export default async function TravelerLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/traveler");
  if (profile.role !== "traveler") redirect(dashboardPathForRole(profile.role));

  return <div className="mx-auto max-w-md px-4 py-8">{children}</div>;
}
