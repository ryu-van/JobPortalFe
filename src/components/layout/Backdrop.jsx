import React from "react";
import { useSidebar } from "../../contexts/SidebarContext";

export default function Backdrop() {
  const { setIsMobileOpen } = useSidebar();
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
      onClick={() => setIsMobileOpen(false)}
      aria-hidden="true"
    />
  );
}
