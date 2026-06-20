"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Link from "next/link";
import { 
  BarChart3, 
  Users, 
  FileText, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Sparkles,
  Target,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Adhikari");

  const handleExport = () => {
    if (!dashboardData) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Citizens,${dashboardData.stats.total_citizens}\n`
      + `Pending Approvals,${dashboardData.stats.pending_approvals}\n`
      + `Open Complaints,${dashboardData.stats.open_complaints}\n`
      + `Total Certificates,${dashboardData.stats.total_certificates}\n`
      + `Complaint Resolution %,${dashboardData.health.complaint_resolve_pct}\n`
      + `Scheme Utilization %,${dashboardData.health.scheme_util_pct}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "panchayat_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName.split(" ")[0]); // Use first name

    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const data = await api.get("/admin/dashboard", token);
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = dashboardData
    ? [
        {
          label: "Citizens",
          value: dashboardData.stats.total_citizens.toLocaleString(),
          icon: Users,
          change: "Live",
          trend: "up",
          color: "text-indigo-600",
          bg: "bg-indigo-500/10",
        },
        {
          label: "Approvals Pending",
          value: dashboardData.stats.pending_approvals,
          icon: ShieldCheck,
          change: dashboardData.stats.pending_approvals > 0 ? "Action Needed" : "All Clear",
          trend: dashboardData.stats.pending_approvals > 0 ? "down" : "up",
          color: "text-amber-600",
          bg: "bg-amber-500/10",
        },
        {
          label: "Open Complaints",
          value: dashboardData.stats.open_complaints,
          icon: Sparkles,
          change: dashboardData.stats.open_complaints > 5 ? "High" : "Normal",
          trend: dashboardData.stats.open_complaints > 5 ? "down" : "up",
          color: "text-rose-600",
          bg: "bg-rose-500/10",
        },
        {
          label: "Certificates",
          value: dashboardData.stats.total_certificates,
          icon: BarChart3,
          change: "Total",
          trend: "up",
          color: "text-blue-600",
          bg: "bg-blue-500/10",
        },
      ]
    : [
        { label: "Citizens", value: "---", icon: Users, change: "...", trend: "up", color: "text-indigo-600", bg: "bg-indigo-500/10" },
        { label: "Approvals Pending", value: "---", icon: ShieldCheck, change: "...", trend: "up", color: "text-amber-600", bg: "bg-amber-500/10" },
        { label: "Open Complaints", value: "---", icon: Sparkles, change: "...", trend: "up", color: "text-rose-600", bg: "bg-rose-500/10" },
        { label: "Certificates", value: "---", icon: BarChart3, change: "...", trend: "up", color: "text-blue-600", bg: "bg-blue-500/10" },
      ];

  const complaintPct = dashboardData?.health?.complaint_resolve_pct ?? 0;
  const schemePct = dashboardData?.health?.scheme_util_pct ?? 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest">
             <ShieldCheck className="w-3 h-3" /> System Administrator
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{userName} Ji, <br /> <span className="text-primary italic">Aapka Swagat Hai.</span></h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="rounded-2xl border-slate-200" onClick={handleExport}>Export Analytics</Button>
          <Link href="/admin/notices">
            <Button className="bg-slate-900 shadow-2xl shadow-slate-300">
               <Plus className="w-5 h-5 mr-2" /> Global Notice
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-8 group">
             <div className="flex justify-between items-start mb-6">
                <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${stat.trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
                   {stat.change} {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <ArrowDownRight className="w-3 h-3 text-rose-400" />}
                </div>
             </div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
             <h3 className={`text-3xl font-black text-slate-900 ${loading ? "animate-pulse" : ""}`}>{stat.value}</h3>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="xl:col-span-2 relative overflow-hidden group">
          <CardHeader 
            title="Village Performance Overview" 
            subtitle="Complaint resolution vs Scheme application trends" 
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Recent Registrations */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                   <Users className="w-4 h-4" /> New Registrations
                </h4>
                {dashboardData?.recent_registrations?.length > 0 ? (
                  dashboardData.recent_registrations.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/30 transition-colors">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{req.full_name}</p>
                        <p className="text-xs text-slate-500">{new Date(req.submitted_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {req.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">No recent registrations</p>
                )}
              </div>

              {/* Recent Complaints */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                   <Sparkles className="w-4 h-4" /> Recent Complaints
                </h4>
                {dashboardData?.recent_complaints?.length > 0 ? (
                  dashboardData.recent_complaints.map((comp) => (
                    <div key={comp.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/30 transition-colors">
                      <div>
                        <p className="font-bold text-sm text-slate-900 truncate max-w-[150px]">{comp.subject}</p>
                        <p className="text-xs text-slate-500 capitalize">{comp.complaint_type}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${comp.status === 'open' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                        {comp.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">No recent complaints</p>
                )}
              </div>
            </div>
           </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-none shadow-2xl shadow-emerald-200/50">
          <CardHeader className="border-white/10">
            <h3 className="text-xl font-black text-white">System Integrity</h3>
            <p className="text-xs text-emerald-100 font-bold uppercase tracking-widest mt-1">Village Health Score</p>
          </CardHeader>
          <CardContent className="space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-emerald-100/70">Complaint Resolving</span>
                <span className="text-white">{complaintPct}%</span>
              </div>
              <div className="w-full bg-black/10 h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div className="bg-white h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000" style={{ width: `${complaintPct}%` }} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-emerald-100/70">Scheme Utilization</span>
                <span className="text-white">{schemePct}%</span>
              </div>
              <div className="w-full bg-black/10 h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div className="bg-white/40 h-full rounded-full transition-all duration-1000" style={{ width: `${schemePct}%` }} />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
               <div className="flex items-center gap-4 p-5 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/10 hover:bg-white/15 transition-all">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-700 shadow-xl">
                     <Target className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-xs font-black text-white leading-none">Monthly Goal</p>
                     <p className="text-[10px] text-emerald-100 font-bold mt-1 uppercase tracking-tight italic">90% Digitization Target</p>
                  </div>
                  <ArrowUpRight className="ml-auto w-5 h-5 text-white/50" />
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
