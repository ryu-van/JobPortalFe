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
    <header className="bg-white/80 backdrop-blur-md text-gray-900 border-b border-gray-100 z-40 sticky top-0">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section: Hamburger & Greeting */}
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-3 rounded-full text-gray-900 hover:bg-gray-50 active:scale-95 transition-all duration-200 shadow-sm border border-gray-100"
            aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            <Menu className="w-5 h-5" />
          </button>
          {!isMobile && (
            <div className="hidden md:block">
              <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Hệ thống quản trị</p>
              <Greeting userName={user?.name || user?.fullName || "JobPortal"} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden lg:block w-72">
            <SearchBar />
          </div>
          <div className="h-8 w-[1px] bg-ivory-deep mx-2 hidden md:block" />
          <NotificationDropdown ref={notificationRef} onCloseOther={() => handleCloseOther("notification")} />
          <UserMenuDropdown ref={userMenuRef} user={user} onCloseOther={() => handleCloseOther("userMenu")} />
        </div>
      </div>
    </header>
  );
}
