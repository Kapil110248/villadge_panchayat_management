"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Bell, 
  User, 
  Users, 
  ClipboardCheck, 
  Settings, 
  FileSearch,
  BookOpen,
  PieChart,
  LogOut,
  Sparkles
} from "lucide-react";

const getLinks = (role) => {
  const common = [
    { name: "Notices", href: `/${role}/notices`, icon: Bell },
  ];

  const citizenLinks = [
    { name: "Dashboard", href: "/citizen/dashboard", icon: LayoutDashboard },
    { name: "Apply Certificate", href: "/citizen/certificates/apply", icon: FileText },
    { name: "My Certificates", href: "/citizen/certificates/status", icon: FileSearch },
    { name: "Lodge Complaint", href: "/citizen/complaints/new", icon: MessageSquare },
    { name: "My Complaints", href: "/citizen/complaints/status", icon: ClipboardCheck },
    { name: "Government Schemes", href: "/citizen/schemes", icon: BookOpen },
    { name: "My Profile", href: "/citizen/profile", icon: User },
  ];

  const clerkLinks = [
    { name: "Dashboard", href: "/clerk/dashboard", icon: LayoutDashboard },
    { name: "Citizen Records", href: "/clerk/citizens", icon: Users },
    { name: "Certificate Verification", href: "/clerk/verification", icon: ClipboardCheck },
    { name: "Grievances", href: "/clerk/complaints", icon: MessageSquare },
    { name: "Profile Settings", href: "/clerk/profile", icon: User },
  ];

  const adminLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Clerk Management", href: "/admin/clerks", icon: Users },
    { name: "Final Approvals", href: "/admin/approvals", icon: ClipboardCheck },
    { name: "Complaints Monitor", href: "/admin/complaints", icon: MessageSquare },
    { name: "Scheme Entry", href: "/admin/schemes", icon: BookOpen },
    { name: "Broadcast Notices", href: "/admin/notices", icon: Bell },
    { name: "System Reports", href: "/admin/reports", icon: PieChart },
    { name: "Portal Settings", href: "/admin/settings", icon: Settings },
    { name: "My Admin Profile", href: "/admin/profile", icon: User },
  ];

  if (role === "admin") return [...adminLinks, ...common];
  if (role === "clerk") return [...clerkLinks, ...common];
  return [...citizenLinks, ...common];
};

export function Sidebar({ role = "citizen" }) {
  const pathname = usePathname();
  const links = getLinks(role);

  return (
    <div className="w-72 glass border-r border-slate-200/50 h-screen sticky top-0 flex flex-col z-50">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-12 select-none">
          <div className="relative">
            <div className="bg-primary w-11 h-11 rounded-2xl rotate-6 absolute inset-0 blur-lg opacity-40 animate-pulse pointer-events-none" />
            <div className="bg-gradient-to-br from-primary to-emerald-700 w-11 h-11 rounded-2xl flex items-center justify-center relative shadow-lg">
              <Sparkles className="text-white w-6 h-6" />
            </div>
          </div>
          <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">GP-Digital</span>
        </div>

        <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-2 -mr-2 scrollbar-none relative z-10">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group relative cursor-pointer active:scale-95",
                  isActive
                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02] z-10"
                    : "text-slate-500 hover:bg-white/50 hover:text-primary"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                <span className="truncate">{link.name}</span>
                {isActive && (
                  <div className="absolute left-0 w-1.5 h-6 bg-white rounded-full -ml-0.5" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4 relative z-10">
        <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] text-white relative overflow-hidden group select-none shadow-xl">
           <div className="relative z-10">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Local Support</p>
              <h4 className="text-sm font-bold mb-3">Panchayat Helpline</h4>
              <button className="w-full py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold hover:bg-white/20 transition-all active:scale-95 cursor-pointer">
                Call Secretary
              </button>
           </div>
           <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
        </div>

        <Link
          href="/logout"
          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all duration-300 group active:scale-95 cursor-pointer"
        >
          <div className="p-2 rounded-xl group-hover:bg-rose-100 transition-colors shrink-0">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Sign Out</span>
        </Link>
      </div>
    </div>
  );
}
