"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Hammer, TrendingUp, CheckCircle, Clock, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";

export default function ClerkDevelopment() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/projects", token);
      setProjects(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleUpdateProgress = async (project) => {
    const newProgress = prompt("Enter new progress (0-100):", project.progress);
    if (newProgress === null) return;
    const newStatus = parseInt(newProgress) >= 100 ? "completed" : "active";
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/projects/${project.id}`, { ...project, progress: parseInt(newProgress), status: newStatus }, token);
      fetchProjects();
    } catch (e) { alert(e.message); }
  };

  const statusColor = (s) => {
    if (s === "completed") return "bg-emerald-500/10 text-emerald-700";
    if (s === "active") return "bg-blue-500/10 text-blue-700";
    return "bg-amber-500/10 text-amber-700";
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
          <Hammer className="w-3 h-3" /> Development Works — Clerk View
        </div>
        <h1 className="text-4xl font-black text-slate-900">Development Works</h1>
        <p className="text-slate-500 font-medium mt-1">Update project progress and track village infrastructure works.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active</p><h3 className="text-2xl font-black text-slate-900">{projects.filter(p => p.status === "active").length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Completed</p><h3 className="text-2xl font-black text-slate-900">{projects.filter(p => p.status === "completed").length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center"><Clock className="w-6 h-6 text-amber-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Planning</p><h3 className="text-2xl font-black text-slate-900">{projects.filter(p => p.status === "planning").length}</h3></div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Project Register" subtitle="Update progress for ongoing village works" />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading...</td></tr>
                ) : projects.map(p => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{new Date(p.start_date).toLocaleDateString("en-IN")} → {new Date(p.expected_completion).toLocaleDateString("en-IN")}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">{p.category}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">₹{(p.budget || 0).toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-xs font-black text-slate-600">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusColor(p.status)}`}>{p.status}</span></td>
                    <td className="px-6 py-4">
                      <Button variant="outline" size="sm" onClick={() => handleUpdateProgress(p)} className="text-xs rounded-xl gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Update
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
