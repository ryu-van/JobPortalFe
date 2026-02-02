import React from "react";
import { Outlet } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";
import Header from "./admin/HeaderAdmin";
import Sidebar from "./admin/SidebarAdmin";
import Backdrop from "./Backdrop";

export default function AdminLayout() {
  const { isExpanded, isHovered, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  
  // Calculate collapsed state based on context
  // Sidebar expects 'collapsed' prop. 
  // If isExpanded is true, it is NOT collapsed.
  // However, Sidebar logic says: collapsed ? "w-16" : "w-64"
  const collapsed = !isExpanded && !isHovered;

  // Function to handle sidebar toggle based on screen size
  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      toggleMobileSidebar();
    } else {
      toggleSidebar();
    }
  };

  // Determine margin for main content
  // Since we are using flex layout on desktop (lg:flex), the static sidebar takes up space naturally.
  // We do NOT need margin-left on the content, otherwise we get double spacing.
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:static lg:translate-x-0"}`}>
         <Sidebar collapsed={collapsed} />
      </div>
      
      {isMobileOpen && <Backdrop />}
      
      <div className="flex-1 flex flex-col h-full min-w-0 transition-all duration-300 ease-in-out">
        <Header collapsed={collapsed} onToggleSidebar={handleToggleSidebar} />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="mx-auto max-w-(--breakpoint-2xl)">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
