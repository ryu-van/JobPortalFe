import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, X } from "lucide-react";
import CandidateUserMenu from "./CandidateUserMenu";
import NotificationDropdown from "../header/NotificationDropdown";

const NAV_LINKS = [
  { to: "/jobs", label: "Tìm việc" },
  { to: "/companies", label: "Công ty" },
];

export default function CandidateNavbar() {
  const location = useLocation();
  const userInfo = useSelector((s) => s.user.userInfo);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm -mx-4 md:-mx-6 lg:-mx-10 xl:-mx-16 px-4 md:px-6 lg:px-10 xl:px-16 py-3 md:py-4 flex items-center justify-between gap-3 md:gap-4">
      <Link to="/" className="flex items-center flex-shrink-0">
        <span className="font-bold text-xl md:text-2xl tracking-tight">
          <span className="text-brand">Ryu</span><span className="text-rust">Career</span>
        </span>
      </Link>

      <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Main navigation">
        {NAV_LINKS.map(({ to, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`text-sm font-semibold transition-all border-b-2 pb-1 ${
                active
                  ? "text-gray-900 border-gray-900"
                  : "text-gray-500 border-transparent hover:text-gray-900"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 md:gap-4">
        {userInfo ? (
          <>
            <NotificationDropdown />
            <CandidateUserMenu />
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="hidden sm:block text-sm font-semibold text-gray-900 hover:text-brand transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-gray-900 hover:text-brand transition-colors"
            >
              Đăng ký
            </Link>
          </>
        )}

        <button
          className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
        </button>
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <nav
            data-testid="mobile-menu"
            aria-label="Mobile navigation"
            className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg p-3 z-50 lg:hidden"
          >
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors"
              >
                {label}
              </Link>
            ))}
            {!userInfo && (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </>
      )}
    </header>
  );
}
