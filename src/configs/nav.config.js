import { roles } from "../constants/roles";
import {
  Building2,
  Users,
  BriefcaseBusiness,
  UserRoundSearch,
  Cog,
  LayoutDashboard,
  BarChart3,
  ChartBarStacked
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
    roles: [roles.ADMIN_COMPANY],
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
    label: "Jobs", // Fallback for Company Admin if they have this feature
    path: "/jobs",
    roles: [roles.ADMIN_COMPANY],
    icon: BriefcaseBusiness,
  },
  {
    label: "Candidates",
    path: "/candidates",
    roles: [roles.HR, roles.ADMIN_COMPANY],
    icon: UserRoundSearch,
  },

  // ===== ADMIN COMPANY =====
  {
    label: "Company Profile",
    path: "/company-profile",
    roles: [roles.ADMIN_COMPANY],
    icon: Building2,
  },
  {
    label: "Team Management",
    path: "/team-management",
    roles: [roles.ADMIN_COMPANY],
    icon: Users,
  },
  {
    label: "Analytics",
    path: "/analytics",
    roles: [roles.ADMIN_COMPANY],
    icon: BarChart3,
  },
  
  // ===== ADMIN =====
  {
    label: "Categories",
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
    label: "Systems",
    path: "/systems",
    roles: [roles.HR, roles.ADMIN_COMPANY, roles.ADMIN],
    icon: Cog,
  }
];
