import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  UserCircle,
  Bookmark,
  FileText,
  FileUser,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { logout } from "../../store/userSlice";
import authService from "../../services/authService";

export default function CandidateUserMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((s) => s.user.userInfo);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const name = userInfo?.fullName || userInfo?.name || "Tài khoản";
  const avatar = userInfo?.avatarUrl || userInfo?.avatar || null;
  const email = userInfo?.email || "";

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await authService.logout();
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const items = [
    { icon: UserCircle, label: "Thông tin cá nhân", onClick: () => navigate("/profile") },
    { icon: FileUser,   label: "Quản lý CV",        onClick: () => navigate("/my-resumes") },
    { icon: Bookmark,   label: "Việc làm đã lưu",   onClick: () => navigate("/saved-jobs") },
    { icon: FileText,   label: "Đơn ứng tuyển",     onClick: () => navigate("/application-history") },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 group"
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-9 h-9 rounded-full object-cover border-2 border-[#000000]/20 group-hover:border-[#000000] transition-all"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#000000]/10 flex items-center justify-center border-2 border-[#000000]/20 group-hover:border-[#000000] transition-all">
            <User className="w-4 h-4 text-[#000000]" />
          </div>
        )}
        <span className="hidden md:block text-sm font-semibold text-gray-700 group-hover:text-[#000000] transition-colors max-w-[120px] truncate">
          {name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-[#000000]/5 to-transparent border-b border-gray-100">
            <div className="flex items-center gap-3">
              {avatar ? (
                <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#000000]/10 flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-[#000000]" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                <p className="text-xs text-gray-500 truncate">{email}</p>
              </div>
            </div>
          </div>

          <div className="p-1.5">
            {items.map(({ icon: Icon, label, onClick }) => (
              <button
                key={label}
                onClick={() => { setOpen(false); onClick(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#000000] transition-colors" />
                <span className="text-sm text-gray-700 group-hover:text-[#000000] transition-colors">{label}</span>
              </button>
            ))}

            <div className="my-1 border-t border-gray-100" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-left group"
            >
              <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
              <span className="text-sm text-gray-700 group-hover:text-red-500 transition-colors">Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
