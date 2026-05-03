import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { dashboardPathForRole } from "@/lib/auth/paths";

export const dynamic = "force-dynamic";

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/host");
  if (profile.role !== "host") redirect(dashboardPathForRole(profile.role));

  return <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>;
}
