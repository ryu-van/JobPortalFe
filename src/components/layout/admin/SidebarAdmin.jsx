import React from "react";
import { NAV_ITEMS } from "../../../configs/nav.config";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserSearch } from "lucide-react";

export default function Sidebar({ collapsed = true }) {
  const user = useSelector((s) => s.user.userInfo);
  const roleId = user.roleId ?? user.roleID ?? user.role_id ?? user.role ?? null;
  const menus = NAV_ITEMS.filter((item) => item.roles.includes(roleId));

  return (
    <aside className={`${collapsed ? "w-20" : "w-72"} bg-[#15803d] text-white h-full flex flex-col relative transition-all duration-300 ease-in-out shadow-2xl z-50`}>
      <div className={`${collapsed ? "p-4" : "p-8"} transition-all duration-300`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-4"}`}>
          <div className={`flex items-center justify-center ${collapsed ? "w-10 h-10" : "w-12 h-12"} rounded-full bg-white text-[#15803d] shadow-lg transition-all duration-300 hover:rotate-12`}>
            <UserSearch className={`${collapsed ? "w-5 h-5" : "w-6 h-6"}`} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tighter leading-none">RyuCareer</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mt-1">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      <nav className={`flex-1 flex flex-col gap-1 ${collapsed ? "px-3" : "px-6"} py-4 overflow-y-auto scrollbar-none`}>
        {menus.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `group flex items-center ${collapsed ? "justify-center h-12 w-12 mx-auto" : "gap-4 px-5 py-4"} rounded-full transition-all duration-200 relative
              ${isActive 
                ? "bg-white text-[#15803d] shadow-lg font-bold scale-[1.02]" 
                : "text-white/60 hover:text-white hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`${collapsed ? "w-5 h-5" : "w-5 h-5"} flex-shrink-0 transition-transform duration-200 group-hover:scale-110`} />
                {!collapsed && (
                  <span className="text-[11px] font-bold uppercase tracking-widest truncate">
                    {item.label}
                  </span>
                )}
                {isActive && collapsed && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#15803d] rounded-l-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Section */}
      {!collapsed && (
        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10 transition-all hover:border-white/20">
            <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center font-bold text-sm shadow-inner">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate tracking-tight">{user?.name || "Admin"}</p>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest truncate">{user?.roleName || "System Admin"}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
