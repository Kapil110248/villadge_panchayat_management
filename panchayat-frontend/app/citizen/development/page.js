"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Hammer, Calendar, AlertCircle, Sparkles, Building2, CheckCircle2, Clock, TrendingUp, ArrowRight, Eye, Download } from "lucide-react";
import { api } from "@/lib/api";

export default function CitizenDevelopment() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // active (includes planning/ongoing) vs completed

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const data = await api.get("/projects", token);
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const parseName = (rawName) => {
    let contractor = "N/A";
    let text = rawName || "";
    const match = text.match(/\[CONTRACTOR:(.*?)\]/);
    if (match) {
      contractor = match[1];
      text = text.replace(match[0], '').trim();
    }
    return { contractor, text };
  };

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "active" || p.status === "planning").length,
    completed: projects.filter(p => p.status === "completed").length,
    budget: projects.reduce((acc, curr) => acc + curr.budget, 0)
  };

  const activeProjects = projects.filter(p => p.status === "active" || p.status === "planning");
  const completedProjects = projects.filter(p => p.status === "completed");

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Development Works</h1>
          <p className="text-slate-500 font-medium">Track ongoing development projects, view visual progress, and audit completed public works.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 !bg-slate-900 text-white border-0 shadow-lg shadow-slate-900/10">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-8 h-8 opacity-80 text-indigo-400" />
            <span className="text-3xl font-black">{stats.total}</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Projects</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <Hammer className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-black">{stats.active}</span>
          </div>
          <p className="text-xs font-bold text-blue-100 uppercase tracking-widest">Active Works</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-black">{stats.completed}</span>
          </div>
          <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Completed</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-black">₹</span>
            <span className="text-3xl font-black">{(stats.budget / 100000).toFixed(1)}L</span>
          </div>
          <p className="text-xs font-bold text-amber-100 uppercase tracking-widest">Budget Allocated</p>
        </Card>
      </div>

      {/* Tabs for Separation */}
      <div className="flex border-b border-slate-100 gap-2">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "active"
              ? "border-blue-600 text-blue-600 bg-blue-50/30"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Hammer className="w-4 h-4" />
          <span>Ongoing & Active Works ({stats.active})</span>
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "completed"
              ? "border-emerald-600 text-emerald-600 bg-emerald-50/30"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed Works ({stats.completed})</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          <p className="text-center lg:col-span-2 text-slate-400 py-12">Loading project data...</p>
        ) : (activeTab === "active" ? activeProjects : completedProjects).length === 0 ? (
          <div className="text-center lg:col-span-2 py-16 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              No {activeTab} projects found.
            </p>
          </div>
        ) : (
          (activeTab === "active" ? activeProjects : completedProjects).map((project) => {
            const { contractor, text: parsedTitle } = parseName(project.name);
            return (
              <Card key={project.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-slate-100">
                {/* Images Banner: Side-by-Side Before/After comparison for Completed */}
                {project.status === "completed" ? (
                  <div className="grid grid-cols-2 gap-1 h-56 bg-slate-100 relative overflow-hidden border-b border-slate-100">
                    {/* Before Image */}
                    <div className="relative h-full w-full bg-slate-200 flex items-center justify-center border-r border-white/50 group/img">
                      {project.before_image ? (
                        <a href={project.before_image} download target="_blank" rel="noopener noreferrer" className="block relative w-full h-full cursor-pointer">
                          <img src={project.before_image} alt="Before Work" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all gap-1">
                            <Download className="w-3.5 h-3.5" /> Download
                          </div>
                          <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded z-10">
                            Kaam se Pehle
                          </span>
                        </a>
                      ) : (
                        <div className="text-center p-2">
                          <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                          <span className="text-[9px] text-slate-500 font-bold uppercase">No Image (Before)</span>
                        </div>
                      )}
                    </div>
                    {/* After Image */}
                    <div className="relative h-full w-full bg-slate-200 flex items-center justify-center group/img2">
                      {project.after_image ? (
                        <a href={project.after_image} download target="_blank" rel="noopener noreferrer" className="block relative w-full h-full cursor-pointer">
                          <img src={project.after_image} alt="After Work" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img2:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all gap-1">
                            <Download className="w-3.5 h-3.5" /> Download
                          </div>
                          <span className="absolute bottom-2 left-2 bg-emerald-600/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded z-10">
                            Kaam ke Baad
                          </span>
                        </a>
                      ) : (
                        <div className="text-center p-2">
                          <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                          <span className="text-[9px] text-slate-500 font-bold uppercase">No Image (After)</span>
                        </div>
                      )}
                    </div>

                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1.5 rounded-xl border border-emerald-400 shadow-sm flex items-center gap-1.5 z-10">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Completed</span>
                    </div>
                  </div>
                ) : (
                  /* Ongoing Image Banner */
                  <div className="h-56 bg-slate-100 relative flex items-center justify-center overflow-hidden border-b border-slate-100 group/img">
                    {project.before_image ? (
                      <a href={project.before_image} download target="_blank" rel="noopener noreferrer" className="block relative w-full h-full cursor-pointer">
                        <img src={project.before_image} alt="Project Ongoing" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all gap-1">
                          <Download className="w-3.5 h-3.5" /> Download
                        </div>
                        <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded z-10">
                          Kaam Pragati par
                        </span>
                      </a>
                    ) : (
                      <div className="text-center space-y-2">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Kaam Pragati par</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border shadow-sm flex items-center gap-1.5 z-10">
                      <div className={`w-2 h-2 rounded-full ${project.status === 'active' ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{project.status === 'active' ? 'Ongoing' : project.status}</span>
                    </div>
                  </div>
                )}

                <CardContent className="p-8 space-y-6">
                  <div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-wider border border-indigo-100">
                      {project.category}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-3 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                      {parsedTitle}
                    </h3>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="text-slate-400">Kaam Progress</span>
                      <span className={project.status === 'completed' ? 'text-emerald-600' : 'text-blue-600'}>
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          project.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Grid Details */}
                  <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-xs font-medium">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Budget Allocated</span>
                      <span className="font-black text-slate-900 text-xs">₹{project.budget.toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Start Date</span>
                      <span className="font-black text-slate-900 text-xs">
                        {new Date(project.start_date).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">
                        {project.status === "completed" ? "Completed Date" : "Expected End"}
                      </span>
                      <span className="font-black text-slate-900 text-xs">
                        {new Date(project.expected_completion).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Agency / Executor info */}
                  <div className="border-t border-slate-100 pt-4 flex flex-col gap-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                      <span>Karya Karta (Agency):</span>
                      <span className="text-indigo-600">{contractor}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">
                      <span>Karyawahi Adhikari (Monitor):</span>
                      <span className="text-slate-600">{project.updated_by || "Panchayat Admin"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
