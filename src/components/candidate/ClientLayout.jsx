import React from "react";
import CandidateNavbar from "./CandidateNavbar";

import { Link } from "react-router-dom";


export default function ClientLayout({ children, className = "" }) {
  return (
    <div className={`min-h-screen flex flex-col bg-white text-[color:var(--text)] font-sans ${className}`}>
      <div className="flex-1 px-4 md:px-6 lg:px-10 xl:px-16">
        <CandidateNavbar />
        <main className="mt-4 md:mt-6 pb-16 md:pb-24">{children}</main>
      </div>

      <footer className="bg-brand py-10 md:py-12 text-white">
        <div className="px-4 md:px-6 lg:px-10 xl:px-16 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          <div className="text-center md:text-left">
            <Link to="/" className="font-bold text-xl text-white tracking-tight">RyuCareer</Link>
            <p className="text-xs text-white/40 mt-2">© 2026 RyuCareer. Professional Recruitment platform.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Contact Us', 'Help Center'].map(link => (
              <a key={link} href="#" className="text-xs text-white/60 hover:text-white transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
