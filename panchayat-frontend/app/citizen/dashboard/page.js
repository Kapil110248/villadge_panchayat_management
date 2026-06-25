"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function CitizenDashboard() {
  const [userName, setUserName] = useState("Citizen");
  const [statsData, setStatsData] = useState({
    applied: 0,
    active: 0,
    approved: 0,
    pending: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [latestNotice, setLatestNotice] = useState(null);
  const [villageStats, setVillageStats] = useState({ digitization: 0, utilization: 0 });
  const [loading, setLoading] = useState(true);

  const handleDownloadHistory = () => {
    if (recentActivities.length === 0) {
      alert("No recent activities to download.");
      return;
    }
    
    const headers = "Title,Type,Status,Date\n";
    const csvRows = recentActivities.map(act => `"${act.title}","${act.type}","${act.status}","${act.time}"`);
    const csvData = headers + csvRows.join("\n");
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const name = localStorage.getItem("userName");
        if (name) {
          setUserName(name.split(" ")[0]);
        }
        
        const data = await api.get("/citizen/dashboard/stats", token);
        setStatsData(data.stats);
        setRecentActivities(data.recentActivities);
        setLatestNotice(data.latestNotice);
        if (data.villageStats) {
           setVillageStats(data.villageStats);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = [
    { label: "Applied", value: statsData.applied, icon: FileText, color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-blue-500/20" },
    { label: "Active", value: statsData.active, icon: MessageSquare, color: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "shadow-rose-500/20" },
    { label: "Approved", value: statsData.approved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/20" },
    { label: "Pending", value: statsData.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/20" },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest mb-3 border border-primary/20 backdrop-blur-md">
             <LayoutGrid className="w-3 h-3" /> Citizen Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Radhe Radhe, <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">{userName}!</span></h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Welcome to your digital village portal. Let's get things done today.</p>
        </div>
        <div className="flex gap-3">
           <Button onClick={handleDownloadHistory} variant="secondary" className="hidden sm:flex bg-white border border-slate-200 hover:border-primary text-slate-600 shadow-sm rounded-2xl h-12 px-6 font-bold hover:text-primary transition-all">Download History</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-bl-full -z-10 opacity-50" />
             
             <div className="flex justify-between items-start mb-6">
               <div className={`${stat.bg} ${stat.color} ${stat.border} border w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-lg ${stat.glow}`}>
                  <stat.icon className="w-6 h-6" />
               </div>
               <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
               </div>
             </div>
             <div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{loading ? "-" : stat.value}</h3>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Quick Actions Card */}
          <Card className="border-none shadow-none bg-transparent">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-2 h-8 bg-primary rounded-full" />
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">What do you need?</h2>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link href="/citizen/certificates/apply" className="group relative bg-white p-8 rounded-[2.5rem] premium-card">
                  <div className="bg-blue-500/10 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">Apply for Certificate</h4>
                  <p className="text-sm text-slate-400 font-medium">Income, Birth, or Residence documents for your family.</p>
                  <div className="mt-6 flex items-center text-primary font-bold text-sm gap-1 group-hover:gap-2 transition-all">
                     Start Application <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
                
                <Link href="/citizen/complaints/new" className="group relative bg-white p-8 rounded-[2.5rem] premium-card">
                  <div className="bg-rose-500/10 text-rose-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-600 group-hover:text-white transition-all">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">Lodge a Complaint</h4>
                  <p className="text-sm text-slate-400 font-medium">Issue with water, roads or electricity? Report it now.</p>
                  <div className="mt-6 flex items-center text-primary font-bold text-sm gap-1 group-hover:gap-2 transition-all">
                     Lodge Complaint <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
             </div>
          </Card>

          {/* Activity List */}
          <Card className="rounded-[2.5rem] border-white shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
            <div className="p-8 pb-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">Application Timeline</h2>
              <p className="text-sm font-medium text-slate-500">Keep track of your latest requests and their progress</p>
            </div>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {loading ? (
                   <div className="p-8 text-center text-slate-400 font-bold">Loading activities...</div>
                ) : recentActivities.length === 0 ? (
                   <div className="p-8 text-center text-slate-400 font-bold bg-slate-50 rounded-2xl border border-slate-100 border-dashed">No recent activity found.</div>
                ) : recentActivities.map((activity, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-primary/5 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-primary/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary group-hover:shadow-lg shadow-primary/20 transition-all">
                        {activity.type === "Certificate" ? <FileText className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{activity.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{activity.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                         activity.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                         activity.status === "Pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
                         "bg-blue-50 text-blue-600 border-blue-100"
                       }`}>
                         {activity.status}
                       </span>
                       <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-100 text-slate-300 group-hover:border-primary/20 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                          <ArrowRight className="w-4 h-4" />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Important Notice Board */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden border border-slate-800">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-0 mix-blend-lighten pointer-events-none" />
             <div className="relative z-10">
                <div className="bg-white/10 backdrop-blur-md w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                  <AlertCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-3 tracking-tight">Notice Board</h3>
                <p className="text-slate-300 text-sm font-medium leading-relaxed mb-8">
                  {loading ? "Loading latest notices..." : latestNotice ? latestNotice.title : "No recent notices from the Gram Panchayat."}
                </p>
                <Link href="/citizen/notices" className="block">
                  <Button className="bg-white text-slate-900 hover:bg-slate-50 shadow-xl shadow-white/10 rounded-xl w-full h-12 font-bold text-sm transition-all hover:scale-[1.02]">
                    View Full Notice
                  </Button>
                </Link>
             </div>
          </div>

          {/* Progress Tracking (Mini) */}
          <Card>
             <CardHeader title="Village Stats" subtitle="Our village progress this month" />
             <CardContent className="space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="text-slate-400">Total Digitization</span>
                      <span className="text-primary font-black">{loading ? "-" : `${villageStats.digitization}%`}</span>
                   </div>
                   <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-1000 ease-out" style={{ width: `${villageStats.digitization}%` }} />
                   </div>
                </div>
                
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="text-slate-400">Scheme Utilization</span>
                      <span className="text-blue-500 font-black">{loading ? "-" : `${villageStats.utilization}%`}</span>
                   </div>
                   <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full transition-all duration-1000 ease-out" style={{ width: `${villageStats.utilization}%` }} />
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <div>
                         <p className="text-xs font-black text-emerald-700 leading-none">Healthy Village</p>
                         <p className="text-[10px] text-emerald-600/70 font-bold mt-1 uppercase tracking-tight">Grade A Sustainability</p>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
