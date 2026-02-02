import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { Menu } from "lucide-react";
import Greeting from "../../header/Greeting";
import SearchBar from "../../header/SearchBar";
import NotificationDropdown from "../../header/NotificationDropdown";
import UserMenuDropdown from "../../header/UserMenuDropdown";

export default function Header({ collapsed, onToggleSidebar, isMobile = false }) {
  const user = useSelector((s) => s.user.userInfo);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleCloseOther = (type) => {
    if (type === "notification") {
      userMenuRef.current?.close?.();
    } else if (type === "userMenu") {
      notificationRef.current?.close?.();
    }
  };

  return (
    <header className="bg-white text-[#27592D] shadow-sm border-b border-gray-200 z-40">
      <div className="flex items-center justify-between px-3 md:px-5 py-2 md:py-3">
        {/* Left Section: Hamburger & Greeting */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-[#27592D] hover:bg-green-50 active:bg-green-100 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm flex-shrink-0"
            aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            <Menu className="w-5 h-5 drop-shadow-sm" />
          </button>
          {!isMobile && (
            <div className="hidden md:block">
              <Greeting userName={user?.name || user?.fullName || "JobPortal"} />
            </div>
          )}
          {isMobile && (
            <div className="flex-1 min-w-0">
              <h2 className="text-sm md:text-base font-bold text-[#27592D] truncate">
                {user?.name?.split(" ")[0] || "User"}
              </h2>
            </div>
          )}
        </div>

        {/* Center Section: Search Bar - Hidden on small mobile */}
        {!isMobile && (
          <div className="hidden lg:block flex-1 max-w-2xl mx-6">
            <SearchBar />
          </div>
        )}

        {/* Right Section: Notifications & Profile */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <NotificationDropdown ref={notificationRef} onCloseOther={() => handleCloseOther("notification")} />
          <UserMenuDropdown ref={userMenuRef} user={user} onCloseOther={() => handleCloseOther("userMenu")} />
        </div>
      </div>
    </header>
  );
}
