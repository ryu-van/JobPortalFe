import { Bell, Briefcase, Building2, FileText, FileUser, Tag } from "lucide-react";

/**
 * Returns the lucide-react icon component for a given NotificationType.
 * Callers render it as: const Icon = getNotificationIcon(type); <Icon className="..." />
 *
 * @param {string} type - The notification type string from the backend.
 * @returns {React.ComponentType} A lucide-react icon component.
 */
export function getNotificationIcon(type) {
  if (!type) return Bell;

  if (type === "application_submitted" || type === "application_status_update") {
    return FileText;
  }

  if (type.startsWith("job_")) return Briefcase;
  if (type.startsWith("company_")) return Building2;
  if (type.startsWith("resume_")) return FileUser;
  if (type.startsWith("category_")) return Tag;

  return Bell;
}
