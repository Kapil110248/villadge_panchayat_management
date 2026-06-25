"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Hammer, Plus, TrendingUp, CheckCircle, Clock, ArrowUpRight, X, Edit2, Eye } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminDevelopment() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "", budget: "", start_date: "", expected_completion: "", progress: 0, status: "planning", contractor: ""
  });

  // Modern UI states
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [newProgress, setNewProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/projects", token);
      setProjects(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const bundledName = `[CONTRACTOR:${form.contractor || 'N/A'}] ${form.name}`;
      await api.post("/projects", {
        ...form,
        name: bundledName,
        budget: parseFloat(form.budget),
        progress: parseInt(form.progress),
        start_date: new Date(form.start_date).toISOString(),
        expected_completion: new Date(form.expected_completion).toISOString()
      }, token);
      
      setToastMessage("Development project created successfully!");
      setTimeout(() => setToastMessage(""), 3000);
      setShowForm(false);
      setForm({ name: "", category: "", budget: "", start_date: "", expected_completion: "", progress: 0, status: "planning", contractor: "" });
      fetchProjects();
    } catch (e) { alert(e.message); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!activeProject) return;
    try {
      const token = localStorage.getItem("accessToken");
      const bundledName = `[CONTRACTOR:${form.contractor || 'N/A'}] ${form.name}`;
      await api.put(`/projects/${activeProject.id}`, {
        ...activeProject,
        name: bundledName,
        category: form.category,
        budget: parseFloat(form.budget),
        start_date: new Date(form.start_date).toISOString(),
        expected_completion: new Date(form.expected_completion).toISOString(),
        status: form.status
      }, token);
      setToastMessage("Project updated successfully!");
      setTimeout(() => setToastMessage(""), 3000);
      setEditModalOpen(false);
      fetchProjects();
    } catch (e) { alert(e.message); }
  };

  const openUpdateModal = (project) => {
    setActiveProject(project);
    setNewProgress(project.progress);
    setUpdateModalOpen(true);
  };

  const openEditModal = (project) => {
    setActiveProject(project);
    const { contractor, text } = parseName(project.name);
    setForm({
      name: text,
      category: project.category,
      budget: project.budget,
      start_date: new Date(project.start_date).toISOString().split('T')[0],
      expected_completion: new Date(project.expected_completion).toISOString().split('T')[0],
      progress: project.progress,
      status: project.status,
      contractor: contractor !== "Unknown" ? contractor : ""
    });
    setEditModalOpen(true);
  };

  const openViewModal = (project) => {
    setActiveProject(project);
    setViewModalOpen(true);
  };

  const submitUpdateProgress = async () => {
    if (!activeProject) return;
    const finalProgress = parseInt(newProgress);
    const newStatus = finalProgress >= 100 ? "completed" : "active";
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/projects/${activeProject.id}`, { ...activeProject, progress: finalProgress, status: newStatus }, token);
      
      setToastMessage("Project progress updated successfully!");
      setTimeout(() => setToastMessage(""), 3000);
      setUpdateModalOpen(false);
      fetchProjects();
    } catch (e) { alert(e.message); }
  };

  const parseName = (rawName) => {
    let contractor = "Unknown";
    let text = rawName || "";
    const match = text.match(/\[CONTRACTOR:(.*?)\]/);
    if (match) {
      contractor = match[1];
      text = text.replace(match[0], '').trim();
    }
    return { contractor, text };
  };

  const statusColor = (s) => {
    if (s === "completed") return "bg-emerald-500/10 text-emerald-700";
    if (s === "active") return "bg-blue-500/10 text-blue-700";
    return "bg-amber-500/10 text-amber-700";
  };

  const active = projects.filter(p => p.status === "active");
  const completed = projects.filter(p => p.status === "completed");
  const planning = projects.filter(p => p.status === "planning");
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
            <Hammer className="w-3 h-3" /> Development Works
          </div>
          <h1 className="text-4xl font-black text-slate-900">Village Development</h1>
          <p className="text-slate-500 font-medium mt-1">Track all construction, infrastructure, and community projects.</p>
        </div>
        <Button onClick={() => {
          setForm({ name: "", category: "", budget: "", start_date: "", expected_completion: "", progress: 0, status: "planning", contractor: "" });
          setShowForm(!showForm);
        }} className="bg-orange-600 hover:bg-orange-700 text-white gap-2 rounded-2xl shadow-xl shadow-orange-200">
          <Plus className="w-5 h-5" /> New Project
        </Button>
      </div>

      {showForm && (
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-white">
          <CardContent className="p-8">
            <form onSubmit={handleCreate} className="space-y-6">
              <h3 className="text-lg font-black text-slate-900">Register New Project</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none">
                    <option value="">Select category</option>
                    <option value="Road Construction">Road Construction</option>
                    <option value="Street Light Installation">Street Light Installation</option>
                    <option value="Drainage System">Drainage System</option>
                    <option value="School Renovation">School Renovation</option>
                    <option value="Water Pipeline">Water Pipeline</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contractor / Agency</label>
                  <input type="text" placeholder="e.g. ABC Constructions" value={form.contractor} onChange={e => setForm({...form, contractor: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget (₹)</label>
                  <input type="number" required value={form.budget} onChange={e => setForm({...form, budget: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none">
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                  <input type="date" required value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Completion</label>
                  <input type="date" required value={form.expected_completion} onChange={e => setForm({...form, expected_completion: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white gap-2 rounded-xl">Create Project</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active</p><h3 className="text-2xl font-black text-slate-900">{active.length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Completed</p><h3 className="text-2xl font-black text-slate-900">{completed.length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center"><Clock className="w-6 h-6 text-amber-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Planning</p><h3 className="text-2xl font-black text-slate-900">{planning.length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center"><Hammer className="w-6 h-6 text-purple-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Budget</p><h3 className="text-xl font-black text-slate-900">₹{(totalBudget/1000).toFixed(0)}K</h3></div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="All Projects" subtitle="Update progress for ongoing village works" />
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
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading...</td></tr>
                ) : projects.map(p => {
                  const { contractor, text } = parseName(p.name);
                  return (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 relative">
                        <p className="font-bold text-sm text-slate-900">{text}</p>
                        <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">Agency: {contractor}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mb-1">{new Date(p.start_date).toLocaleDateString("en-IN")} → {new Date(p.expected_completion).toLocaleDateString("en-IN")}</p>
                        {p.updated_by && (
                          <p className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase tracking-wide">
                            Updated By: {p.updated_by}
                          </p>
                        )}
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
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openViewModal(p)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border-0 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditModal(p)} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 border-0 rounded-lg">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openUpdateModal(p)} className="text-xs rounded-xl gap-1">
                            <ArrowUpRight className="w-3 h-3" /> Update
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <CardHeader title="Edit Project Details" subtitle="Update information for the selected project" />
            <CardContent className="p-8 pt-0">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Name</label>
                    <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none">
                      <option value="Road Construction">Road Construction</option>
                      <option value="Street Light Installation">Street Light Installation</option>
                      <option value="Drainage System">Drainage System</option>
                      <option value="School Renovation">School Renovation</option>
                      <option value="Water Pipeline">Water Pipeline</option>
                      <option value="Sanitation">Sanitation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contractor / Agency</label>
                    <input type="text" value={form.contractor} onChange={e => setForm({...form, contractor: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget (₹)</label>
                    <input type="number" required value={form.budget} onChange={e => setForm({...form, budget: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none">
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                    <input type="date" required value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Completion</label>
                    <input type="date" required value={form.expected_completion} onChange={e => setForm({...form, expected_completion: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white gap-2 rounded-xl flex-1">Save Changes</Button>
                  <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)} className="rounded-xl">Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Modal */}
      {viewModalOpen && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setViewModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="p-8">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Hammer className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">{parseName(activeProject.name).text}</h2>
              <p className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-widest">{activeProject.category}</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agency</span>
                  <span className="text-sm font-black text-slate-900">{parseName(activeProject.name).contractor}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Budget</span>
                  <span className="text-sm font-black text-slate-900">₹{(activeProject.budget || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Timeline</span>
                  <span className="text-sm font-bold text-slate-700">{new Date(activeProject.start_date).toLocaleDateString("en-IN")} - {new Date(activeProject.expected_completion).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusColor(activeProject.status)}`}>{activeProject.status}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                  <span className="text-sm font-black text-blue-600">{activeProject.progress}%</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Updated By</span>
                  <span className="text-sm font-black text-slate-900">{activeProject.updated_by || "System"}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modern Progress Update Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm p-6 relative shadow-2xl border-0 animate-in zoom-in duration-200">
            <button onClick={() => setUpdateModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-6 text-center">
              <div className="w-16 h-16 bg-blue-500/10 mx-auto rounded-full flex items-center justify-center mb-4">
                 <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Update Progress</h2>
              <p className="text-xs font-bold text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg">{parseName(activeProject?.name).text}</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3 text-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress Percentage</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="0" max="100" 
                    value={newProgress} 
                    onChange={e => setNewProgress(e.target.value)}
                    className="w-full accent-blue-600 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer" 
                  />
                  <span className="text-xl font-black text-slate-900 w-12">{newProgress}%</span>
                </div>
              </div>

              <Button onClick={submitUpdateProgress} className="w-full py-6 rounded-xl text-md font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20">
                Confirm Update
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modern Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
