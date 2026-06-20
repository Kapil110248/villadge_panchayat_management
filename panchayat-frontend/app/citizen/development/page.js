"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Hammer, Calendar, AlertCircle, Sparkles, Building2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export default function CitizenDevelopment() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "active").length,
    completed: projects.filter(p => p.status === "completed").length,
    budget: projects.reduce((acc, curr) => acc + curr.budget, 0)
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 mb-2">Development Works</h1>
        <p className="text-slate-500 font-medium">Track ongoing development projects and audit public works.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-slate-900 text-white border-0">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-8 h-8 opacity-80 text-primary-light" />
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          <p className="text-center md:col-span-2 text-slate-400 py-12">Loading project data...</p>
        ) : projects.length === 0 ? (
          <p className="text-center md:col-span-2 text-slate-400 py-12">No registered works.</p>
        ) : (
          projects.map((project) => (
            <Card key={project.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-300">
              {/* Image Banner */}
              <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative flex items-center justify-center overflow-hidden border-b border-slate-100">
                {project.before_image ? (
                  <img src={project.before_image} alt="Project Before" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="text-center space-y-2">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Project Visuals</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border shadow-sm flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    project.status === 'completed' ? 'bg-emerald-500' : 
                    project.status === 'active' ? 'bg-blue-500' : 'bg-amber-500'
                  }`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 capitalize">{project.status}</span>
                </div>
              </div>

              <CardContent className="p-8 space-y-6">
                <div>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-wider">
                    {project.category}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                    <span className="text-slate-400">Project Progress</span>
                    <span className="text-primary">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border">
                    <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 text-xs font-medium">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Budget Allocated</span>
                    <span className="font-black text-slate-900 text-sm">₹{project.budget.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Start Date</span>
                    <span className="font-black text-slate-900 text-sm">
                      {new Date(project.start_date).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
