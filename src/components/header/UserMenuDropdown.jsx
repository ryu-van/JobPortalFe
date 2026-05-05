import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { User, UserCircle, Settings, LogOut } from "lucide-react";
import { logout } from "../../store/userSlice";
import authService from "../../services/authService";

const UserMenuDropdown = forwardRef(({ user, onCloseOther }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useImperativeHandle(ref, () => ({
    close: () => setIsOpen(false)
  }));

  const userName = user?.name || user?.fullName || "User";
  const userAvatar = user?.avatarUrl || user?.avatar || null;
  const userEmail = user?.email || "";

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

  const handleMyProfile = () => {
    setIsOpen(false);
    navigate("/profile");
  };

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center group cursor-pointer"
      >
        {userAvatar ? (
          <div className="relative">
            <img
              src={userAvatar}
              alt={userName}
              className="w-9 h-9 rounded-full object-cover border-2 border-white/30 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-md"></div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center border-2 border-white/30 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
            <User className="w-4 h-4 text-white drop-shadow-sm" />
          </div>
        )}
      </button>

      {/* User Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#000000] to-[#1f4a24] flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            </div>
          </div>
          <div className="p-2">
            <button 
              onClick={handleMyProfile}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
            >
              <UserCircle className="w-4 h-4 text-gray-500 group-hover:text-[#000000]" />
              <span className="text-sm text-gray-700 group-hover:text-[#000000]">My Profile</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group">
              <Settings className="w-4 h-4 text-gray-500 group-hover:text-[#000000]" />
              <span className="text-sm text-gray-700 group-hover:text-[#000000]">Settings</span>
            </button>
            <div className="my-1 border-t border-gray-200"></div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-left group"
            >
              <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
              <span className="text-sm text-gray-700 group-hover:text-red-600">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

UserMenuDropdown.displayName = "UserMenuDropdown";

export default UserMenuDropdown;

