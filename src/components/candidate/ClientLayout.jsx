import React from "react";
import CandidateNavbar from "./CandidateNavbar";

/**
 * Shared full-width layout for all candidate/client pages.
 * Matches the Home page outer wrapper exactly.
 */
export default function ClientLayout({ children, className = "" }) {
  return (
    <div className={`min-h-screen bg-[#F4F1EB] text-[#1a1a1a] font-sans ${className}`}>
      <div className="px-4 md:px-10 xl:px-16 pt-5 pb-16">
        <CandidateNavbar />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
