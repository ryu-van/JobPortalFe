import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Bell } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import NotificationItem from "./NotificationItem";
import { readNotification, readAllNotifications } from "../../store/notificationActions";

const NAVIGATION_MAP = {
  APPLICATION: (id) => `/applications/${id}`,
  JOB: (id) => `/jobs/${id}`,
  COMPANY_VERIFICATION_REQUEST: (id) => `/admin/companies/requests/${id}`,
};

const NotificationDropdown = forwardRef(({ onCloseOther }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector((state) => state.notifications.items);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  const badgeLabel = unreadCount > 99 ? "99+" : unreadCount;

  useImperativeHandle(ref, () => ({
    close: () => setIsOpen(false),
  }));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) {
      onCloseOther?.();
    }
  };

  const handleMarkAllRead = () => {
    dispatch(readAllNotifications(undefined));
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(readNotification(notification.id, undefined));
    }
    const getPath = NAVIGATION_MAP[notification.referenceType];
    if (getPath && notification.referenceId != null) {
      navigate(getPath(notification.referenceId));
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 rounded-site hover:bg-white/10 active:bg-white/15 transition-all duration-200 group"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-brand rounded-full flex items-center justify-center border border-white">
            <span className="text-[10px] font-bold text-white leading-none">{badgeLabel}</span>
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-soft border border-ivory-deep z-50 animate-[fadeIn_0.2s_ease-out]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-ivory-deep flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Thông báo</h3>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="text-xs font-medium text-brand hover:text-brand-dark disabled:text-olive disabled:cursor-not-allowed transition-colors"
            >
              Đánh dấu tất cả đã đọc
            </button>
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Bạn chưa có thông báo nào</p>
              </div>
            ) : (
              items.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

NotificationDropdown.displayName = "NotificationDropdown";

export default NotificationDropdown;
