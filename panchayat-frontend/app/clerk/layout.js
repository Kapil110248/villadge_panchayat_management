"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function ClerkLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      
      {/* Sidebar - hidden on mobile unless open */}
      <div className={`print:hidden fixed inset-y-0 left-0 z-50 lg:static transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar role="clerk" onClose={() => setMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col w-full lg:w-auto print:block">
        <div className="print:hidden">
          <Navbar role="clerk" onMenuClick={() => setMobileMenuOpen(true)} />
        </div>
        <main className="p-4 md:p-6 w-full max-w-[100vw] overflow-x-hidden print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
