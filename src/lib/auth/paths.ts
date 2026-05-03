import type { UserRole } from "@/lib/types/database";

export function dashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "traveler":
      return "/traveler";
    case "host":
      return "/host";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}
