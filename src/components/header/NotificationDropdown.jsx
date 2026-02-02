import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Bell, X, CheckCircle } from "lucide-react";

const NotificationDropdown = forwardRef(({ onCloseOther }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useImperativeHandle(ref, () => ({
    close: () => setIsOpen(false)
  }));

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "New job application",
      message: "John Doe applied for Software Engineer position",
      time: "5 minutes ago",
      read: false,
      type: "application"
    },
    {
      id: 2,
      title: "Interview scheduled",
      message: "Interview with Jane Smith scheduled for tomorrow",
      time: "1 hour ago",
      read: false,
      type: "interview"
    },
    {
      id: 3,
      title: "Profile update",
      message: "Your profile has been updated successfully",
      time: "2 hours ago",
      read: true,
      type: "system"
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      onCloseOther?.();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onCloseOther]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      onCloseOther?.();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 rounded-xl hover:bg-white/15 active:bg-white/20 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm group"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 drop-shadow-sm group-hover:animate-pulse" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
            <span className="text-[10px] font-bold text-white">{unreadCount}</span>
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-1.5 rounded-lg ${
                      notification.type === "application" ? "bg-blue-100 text-blue-600" :
                      notification.type === "interview" ? "bg-green-100 text-green-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold mb-1 ${
                        !notification.read ? "text-gray-900" : "text-gray-700"
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button className="w-full text-xs font-medium text-[#27592D] hover:text-[#1f4a24] transition-colors">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

NotificationDropdown.displayName = "NotificationDropdown";

export default NotificationDropdown;

