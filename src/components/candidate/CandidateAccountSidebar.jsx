import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Bookmark, FileUser, ChevronRight, ClipboardList } from "lucide-react";

const NAV_ITEMS = [
  { to: "/profile", label: "Hồ sơ cá nhân", icon: User },
  { to: "/saved-jobs", label: "Việc làm đã lưu", icon: Bookmark },
  { to: "/my-resumes", label: "Quản lý CV", icon: FileUser },
  { to: "/application-history", label: "Lịch sử ứng tuyển", icon: ClipboardList },
];

export default function CandidateAccountSidebar() {
  const location = useLocation();

  return (
    <aside className="space-y-2">
      <div className="vw-card p-2 !rounded-sm">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center justify-between px-4 py-3.5 rounded-sm transition-all group ${
                active
                  ? "bg-brand text-white shadow-md"
                  : "text-brand/60 hover:bg-brand/5 hover:text-brand"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${active ? "text-white" : "text-brand/40 group-hover:text-brand"}`} />
                <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
              </div>
              <ChevronRight className={`w-4 h-4 ${active ? "text-white/40" : "text-brand/20 group-hover:text-brand/40"}`} />
            </Link>
          );
        })}
      </div>
      
      <div className="vw-card p-6 !rounded-sm bg-brand/5 border-dashed border-brand/20">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand/40 mb-3">Cần hỗ trợ?</p>
        <p className="text-xs text-brand/70 leading-relaxed font-medium mb-4">
          Nếu bạn gặp khó khăn trong việc quản lý hồ sơ, hãy liên hệ với đội ngũ Career Mentor.
        </p>
        <button className="text-[10px] font-bold uppercase tracking-widest text-brand hover:opacity-70 underline underline-offset-4">
          Gửi yêu cầu hỗ trợ
        </button>
      </div>
    </aside>
  );
}
