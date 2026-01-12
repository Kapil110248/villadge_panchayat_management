"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
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

export default function AdminDashboard() {
  const stats = [
    { label: "Revenue", value: "₹4.2L", icon: BarChart3, change: "+8.2%", trend: "up", color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Citizens", value: "8,450", icon: Users, change: "+2.4%", trend: "up", color: "text-indigo-600", bg: "bg-indigo-500/10" },
    { label: "Approvals", value: "24", icon: ShieldCheck, change: "-12%", trend: "down", color: "text-amber-600", bg: "bg-amber-500/10" },
    { label: "Alerts", value: "15", icon: Sparkles, change: "+4%", trend: "up", color: "text-rose-600", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest">
             <ShieldCheck className="w-3 h-3" /> System Administrator
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Sarpanch Ji, <br /> <span className="text-primary italic">Aapka Swagat Hai.</span></h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="rounded-2xl border-slate-200">Export Analytics</Button>
          <Button className="bg-slate-900 shadow-2xl shadow-slate-300">
             <Plus className="w-5 h-5 mr-2" /> Global Notice
          </Button>
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
             <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="xl:col-span-2 relative overflow-hidden group">
          <CardHeader 
            title="Village Performance Overvie" 
            subtitle="Complaint resolution vs Scheme application trends" 
          />
          <CardContent>
            <div className="h-80 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200 flex items-center justify-center p-8 relative overflow-hidden group-hover:border-primary/30 transition-all">
               <div className="text-center space-y-4 group-hover:scale-105 transition-transform duration-500">
                  <Globe className="w-16 h-16 text-slate-200 mx-auto" />
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">Live Spatial Data Visualization Coming Soon</p>
                </div>
                <div className="absolute top-10 left-10 w-32 h-0.5 bg-primary/10 rounded-full pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-32 h-0.5 bg-blue-500/10 rounded-full pointer-events-none" />
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
                <span className="text-white">78%</span>
              </div>
              <div className="w-full bg-black/10 h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div className="bg-white h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ width: '78%' }} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-emerald-100/70">Scheme Utilization</span>
                <span className="text-white">62%</span>
              </div>
              <div className="w-full bg-black/10 h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div className="bg-white/40 h-full rounded-full" style={{ width: '62%' }} />
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
