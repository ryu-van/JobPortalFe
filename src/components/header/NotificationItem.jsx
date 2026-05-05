import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale/vi";
import { getNotificationIcon } from "../../utils/notificationIcon";

/**
 * A single notification row inside the NotificationDropdown.
 *
 * @param {{ notification: object, onClick: function }} props
 */
export default function NotificationItem({ notification, onClick }) {
  const { title, message, createdAt, isRead, type } = notification;
  const Icon = getNotificationIcon(type);

  const relativeTime = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: vi })
    : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-100 transition-colors ${
        isRead === false ? "bg-blue-50" : "bg-white"
      }`}
    >
      {/* Icon */}
      <div className="mt-0.5 shrink-0 text-gray-500">
        <Icon size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${isRead === false ? "font-semibold" : "font-normal"}`}>
          {title}
        </p>
        <p className="text-xs text-gray-600 line-clamp-2">{message}</p>
        <p className="text-xs text-gray-400 mt-0.5">{relativeTime}</p>
      </div>

      {/* Unread dot */}
      {isRead === false && (
        <div className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-blue-500" />
      )}
    </button>
  );
}
