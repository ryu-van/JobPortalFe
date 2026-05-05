import React from "react";
import { Outlet } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";
import Header from "./admin/HeaderAdmin";
import Sidebar from "./admin/SidebarAdmin";
import Backdrop from "./Backdrop";

export default function AdminLayout() {
  const { isExpanded, isHovered, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  
  
  const collapsed = !isExpanded && !isHovered;

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      toggleMobileSidebar();
    } else {
      toggleSidebar();
    }
  };

  
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 lg:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:static lg:translate-x-0"}`}>
         <Sidebar collapsed={collapsed} />
      </div>
      
      {isMobileOpen && <Backdrop />}
      
      <div className="flex-1 flex flex-col h-full min-w-0 transition-all duration-300 ease-in-out">
        <Header collapsed={collapsed} onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
