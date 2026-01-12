"use client";

import { Bell, Search, User, Menu, Command, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function Navbar({ role }) {
  return (
    <header className="h-20 border-b border-slate-200/50 glass sticky top-0 z-30 flex items-center justify-between px-8">
      <div className="flex items-center gap-6 flex-1">
        <button className="lg:hidden p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all">
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        
        <div className="relative max-w-lg w-full hidden md:block group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
             <Search className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search records, schemes, certificates..."
            className="w-full bg-slate-100 border-transparent rounded-[1.25rem] pl-11 pr-16 py-3 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
             <Command className="w-3 h-3 text-slate-400" />
             <span className="text-[10px] font-black text-slate-400">K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 font-bold text-xs uppercase tracking-tighter shadow-sm">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          {role} Access
        </div>
        
        <button className="relative p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all group">
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-3 right-3 w-4 h-4 bg-primary text-[8px] font-black text-white flex items-center justify-center rounded-full border-2 border-white">3</span>
        </button>

        <div className="flex items-center gap-3 pl-5 border-l border-slate-200">
          <div className="text-right hidden xl:block">
            <p className="text-sm font-black text-slate-900 leading-none">Ramesh Kumar</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sarahi Village</p>
          </div>
          <Link href={`/${role}/profile`} className="relative group cursor-pointer block">
             <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 p-1 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center overflow-hidden">
                   <User className="w-6 h-6 text-primary" />
                </div>
             </div>
             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </Link>
          <Link 
            href="/logout" 
            className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm group border border-rose-100"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
