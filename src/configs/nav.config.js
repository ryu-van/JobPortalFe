import { roles } from "../constants/roles";
import {
  Building2,
  Users,
  BriefcaseBusiness,
  UserRoundSearch,
  Cog,
  LayoutDashboard,
  ChartBarStacked,
  Mail,
} from "lucide-react";

export const NAV_ITEMS = [
  // ===== DASHBOARD =====
  {
    label: "Dashboard",
    path: "/hr/dashboard",
    roles: [roles.HR],
    icon: LayoutDashboard,
  },
  {
    label: "Dashboard",
    path: "/company-admin/dashboard",
    roles: [roles.COMPANY_ADMIN],
    icon: LayoutDashboard,
  },
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    roles: [roles.ADMIN],
    icon: LayoutDashboard,
  },

  // ===== HR =====
  {
    label: "Jobs",
    path: "/hr/jobs",
    roles: [roles.HR],
    icon: BriefcaseBusiness,
  },
  {
    label: "Candidates",
    path: "/hr/candidates",
    roles: [roles.HR],
    icon: UserRoundSearch,
  },

  // ===== COMPANY ADMIN =====
  {
    label: "Jobs",
    path: "/company-admin/jobs",
    roles: [roles.COMPANY_ADMIN],
    icon: BriefcaseBusiness,
  },
  {
    label: "Candidates",
    path: "/company-admin/candidates",
    roles: [roles.COMPANY_ADMIN],
    icon: UserRoundSearch,
  },
  {
    label: "Company Profile",
    path: "/company-admin/company-profile",
    roles: [roles.COMPANY_ADMIN],
    icon: Building2,
  },
  {
    label: "Team",
    path: "/company-admin/team",
    roles: [roles.COMPANY_ADMIN],
    icon: Users,
  },
  {
    label: "Invitations",
    path: "/company-admin/invitations",
    roles: [roles.COMPANY_ADMIN],
    icon: Mail,
  },

  // ===== ADMIN =====
  {
    label: "Categories & Industries",
    path: "/admin/categories",
    roles: [roles.ADMIN],
    icon: ChartBarStacked
  },
  {
    label: "Users",
    path: "/admin/users",
    roles: [roles.ADMIN],
    icon: Users
  },
  {
    label: "Companies",
    path: "/admin/companies",
    roles: [roles.ADMIN],
    icon: Building2,
  },
  {
    label: "Jobs",
    path: "/admin/jobs",
    roles: [roles.ADMIN],
    icon: BriefcaseBusiness,
  },
  {
    label: "Systems",
    path: "/systems",
    roles: [roles.HR, roles.COMPANY_ADMIN, roles.ADMIN],
    icon: Cog,
  }
];
