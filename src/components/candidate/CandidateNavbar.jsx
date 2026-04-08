import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, X } from "lucide-react";
import CandidateUserMenu from "./CandidateUserMenu";

const NAV_LINKS = [
  { to: "/jobs", label: "Tìm việc" },
  { to: "/companies", label: "Công ty" },
];

export default function CandidateNavbar() {
  const location = useLocation();
  const userInfo = useSelector((s) => s.user.userInfo);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative bg-white/95 backdrop-blur border border-gray-100 rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 shadow-sm">
      {/* Logo — text only, no icon box */}
      <Link to="/" className="flex items-center flex-shrink-0">
        <span className="font-extrabold text-lg text-[#27592D] tracking-tight">RyuCareer</span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map(({ to, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-[#27592D]/10 text-[#27592D]"
                  : "text-gray-600 hover:text-[#27592D] hover:bg-gray-50"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {userInfo ? (
          <CandidateUserMenu />
        ) : (
          <>
            <Link
              to="/login"
              className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#27592D] rounded-xl hover:bg-[#1f4022] transition-colors shadow-sm"
            >
              Đăng ký
            </Link>
          </>
        )}

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50 md:hidden">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#27592D] transition-colors"
            >
              {label}
            </Link>
          ))}
          {!userInfo && (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#27592D] transition-colors"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
