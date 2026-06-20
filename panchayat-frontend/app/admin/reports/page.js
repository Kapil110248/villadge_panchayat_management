"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PieChart, BarChart2, Download, Table, Calendar, Filter, Shield } from "lucide-react";
import { api } from "@/lib/api";

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const data = await api.get("/admin/reports/stats", token);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExportAll = () => {
    if (!stats) return;
    
    // Using native print creates a perfect exact PDF and avoids SSR library issues
    window.print();
  };

  const reports = [
    { title: "Monthly Revenue Report", category: "Finance", format: "CSV" },
    { title: "Scheme Distribution Summary", category: "Schemes", format: "CSV" },
    { title: "Grievance Resolution Rate", category: "Public", format: "CSV" },
    { title: "Village Population Growth", category: "Health", format: "CSV" },
  ];

  return (
    <div id="reports-content" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Reports</h1>
          <p className="text-slate-500">Analyze village progress and generate documentation</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={handleExportAll}><Download className="w-4 h-4 mr-2" /> Export All</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading stats...</div>
      ) : stats ? (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2">
            <CardHeader title="Analytical Overview" subtitle="Key metrics from database" />
            <CardContent>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Grievance Completion Rate</p>
                     <p className="text-2xl font-bold text-slate-900">{stats.completion_rate}%</p>
                     <div className="w-full bg-slate-200 h-1 rounded-full mt-4 overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${stats.completion_rate}%` }}></div>
                     </div>
                     <p className="text-[10px] text-slate-400 mt-2">{stats.resolved_complaints} / {stats.total_complaints} complaints resolved</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Certificate Approval Rate</p>
                     <p className="text-2xl font-bold text-slate-900">{stats.cert_approval_rate}%</p>
                     <div className="w-full bg-slate-200 h-1 rounded-full mt-4 overflow-hidden">
                        <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${stats.cert_approval_rate}%` }}></div>
                     </div>
                     <p className="text-[10px] text-slate-400 mt-2">{stats.approved_certificates} / {stats.total_certificates} certificates approved</p>
                  </div>
               </div>
               
               <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl text-center">
                     <p className="text-2xl font-black text-blue-700">{stats.total_citizens}</p>
                     <p className="text-[10px] font-bold text-blue-400 uppercase mt-1">Citizens</p>
                  </div>
                  <div className="p-4 bg-rose-50 rounded-xl text-center">
                     <p className="text-2xl font-black text-rose-700">{stats.open_complaints}</p>
                     <p className="text-[10px] font-bold text-rose-400 uppercase mt-1">Open Complaints</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl text-center">
                     <p className="text-2xl font-black text-emerald-700">{stats.active_schemes}</p>
                     <p className="text-[10px] font-bold text-emerald-400 uppercase mt-1">Active Schemes</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl text-center">
                     <p className="text-2xl font-black text-amber-700">{stats.total_notices}</p>
                     <p className="text-[10px] font-bold text-amber-400 uppercase mt-1">Notices</p>
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card>
            <CardHeader title="Available Reports" />
            <CardContent className="p-0">
               <div className="divide-y divide-border">
                  {reports.map((report, i) => (
                    <div key={i} onClick={handleExportAll} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                       <div className="flex items-center gap-3">
                          <div className="bg-primary/5 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                             <Table className="w-4 h-4" />
                          </div>
                          <div>
                             <p className="text-sm font-semibold text-slate-900">{report.title}</p>
                             <p className="text-[10px] text-slate-400 uppercase font-bold">{report.category}</p>
                          </div>
                       </div>
                       <Download className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
               </div>
               <div className="p-4 border-t border-border">
                  <Button variant="ghost" className="w-full text-xs" onClick={handleExportAll}>Download Complete Report</Button>
               </div>
            </CardContent>
         </Card>
      </div>
      ) : (
        <div className="text-center py-12 text-slate-500">Failed to load stats.</div>
      )}
    </div>
  );
}
