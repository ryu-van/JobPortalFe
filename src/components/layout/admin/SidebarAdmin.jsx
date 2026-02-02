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
    <aside className={`${collapsed ? "w-16" : "w-64"} bg-[#27592D] text-white h-full flex flex-col relative transition-[width] duration-200 ease-out shadow-xl border-r border-[#27592D]`}>
      {/* Logo Section */}
      <div className={`${collapsed ? "p-3" : "p-4"} transition-[padding] duration-200 ease-out border-b border-white/10`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} transition-[gap] duration-200 ease-out relative`}>
          <div className={`flex items-center justify-center ${collapsed ? "w-9 h-9" : "w-11 h-11"} rounded-xl bg-white text-[#27592D] shadow-sm transition-[width,height] duration-200 ease-out hover:scale-105`}>
            <UserSearch className={`${collapsed ? "w-4 h-4" : "w-5 h-5"} transition-[width,height] duration-200 ease-out`} />
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-[fadeIn_0.2s_ease-out_0.1s_forwards]">
              <h1 className="text-lg font-bold text-white tracking-tight">JobPortal</h1>
              <p className="text-xs text-white/70 font-medium">Admin Dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Menus */}
      <div className={`flex-1 flex flex-col gap-2 ${collapsed ? "px-2 pt-4" : "px-3 pt-4"} pb-4 overflow-y-auto transition-[padding] duration-200 ease-out scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent`}>
        {menus.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `group flex items-center ${collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-xl transition-[background-color,transform,padding,gap] duration-200 ease-out relative
              ${isActive 
                ? "bg-[#A5D6A7] text-[#1b3e20] shadow-md font-semibold" 
                : `text-white/80 hover:bg-white/10 hover:text-white ${collapsed ? "" : "hover:translate-x-0.5"}`
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`flex items-center justify-center ${collapsed ? "w-9 h-9" : "w-10 h-10"} rounded-lg transition-[background-color,transform,width,height] duration-200 ease-out ${
                  isActive 
                    ? "bg-transparent" 
                    : "bg-transparent group-hover:bg-white/10"
                }`}>
                  <item.icon className={`${collapsed ? "w-4 h-4" : "w-4.5 h-4.5"} flex-shrink-0 transition-[width,height,transform] duration-200 ease-out ${
                    isActive ? "text-[#1b3e20]" : "text-white/70 group-hover:text-white"
                  }`} />
                </div>
                {!collapsed && (
                  <p className={`text-xs font-medium truncate transition-[opacity] duration-200 ease-out ${
                    isActive ? "text-[#1b3e20] font-bold" : "text-white/80 group-hover:text-white"
                  }`}>
                    {item.label}
                  </p>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer Section (Optional - có thể thêm user info) */}
      {!collapsed && (
        <div className="p-3 border-t border-white/10 bg-[#1e4620]/50 opacity-0 animate-[fadeIn_0.2s_ease-out_0.15s_forwards]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 border border-transparent transition-[background,border] duration-200 ease-out cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center shadow-sm border border-white/10 group-hover:scale-105 transition-transform duration-200 ease-out">
              <span className="text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-white/60 truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
