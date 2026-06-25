"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Hammer, Plus, TrendingUp, CheckCircle, Clock, ArrowUpRight, X, Edit2, Eye, Download } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminDevelopment() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "Road Construction", budget: "", start_date: "", expected_completion: "", progress: 0, status: "planning", contractor: "", before_image: "", after_image: "", updated_by: ""
  });

  // Modern UI states
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [newProgress, setNewProgress] = useState(0);
  const [afterImageUrl, setAfterImageUrl] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [editCustomCategory, setEditCustomCategory] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  // Upload states
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  const handleFileUpload = async (file, type) => {
    try {
      if (type === 'before') setUploadingBefore(true);
      if (type === 'after' || type === 'updateProgressAfter') setUploadingAfter(true);
      
      const token = localStorage.getItem("accessToken");
      const res = await api.upload("/upload", file, token);
      const url = res.secure_url;
      
      if (type === 'before') {
        setForm(prev => ({ ...prev, before_image: url }));
      } else if (type === 'after') {
        setForm(prev => ({ ...prev, after_image: url }));
      } else if (type === 'updateProgressAfter') {
        setAfterImageUrl(url);
      }
    } catch (e) {
      alert("Upload failed: " + e.message);
    } finally {
      setUploadingBefore(false);
      setUploadingAfter(false);
    }
  };

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
      const finalCategory = form.category === "Other" ? customCategory : form.category;
      await api.post("/projects", {
        ...form,
        name: bundledName,
        category: finalCategory,
        budget: parseFloat(form.budget),
        progress: parseInt(form.progress),
        start_date: new Date(form.start_date).toISOString(),
        expected_completion: new Date(form.expected_completion).toISOString()
      }, token);
      
      setToastMessage("Development project created successfully!");
      setTimeout(() => setToastMessage(""), 3000);
      setShowForm(false);
      setForm({ name: "", category: "Road Construction", budget: "", start_date: "", expected_completion: "", progress: 0, status: "planning", contractor: "", before_image: "", after_image: "", updated_by: "" });
      setCustomCategory("");
      fetchProjects();
    } catch (e) { alert(e.message); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!activeProject) return;
    try {
      const token = localStorage.getItem("accessToken");
      const bundledName = `[CONTRACTOR:${form.contractor || 'N/A'}] ${form.name}`;
      const finalCategory = form.category === "Other" ? editCustomCategory : form.category;
      await api.put(`/projects/${activeProject.id}`, {
        ...activeProject,
        name: bundledName,
        category: finalCategory,
        budget: parseFloat(form.budget),
        start_date: new Date(form.start_date).toISOString(),
        expected_completion: new Date(form.expected_completion).toISOString(),
        status: form.status,
        before_image: form.before_image,
        after_image: form.after_image,
        updated_by: form.updated_by
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
    setAfterImageUrl(project.after_image || "");
    setUpdateModalOpen(true);
  };

  const openEditModal = (project) => {
    setActiveProject(project);
    const { contractor, text } = parseName(project.name);
    const presetCategories = ["Road Construction", "Street Light Installation", "Drainage System", "School Renovation", "Water Pipeline", "Sanitation"];
    const isOther = !presetCategories.includes(project.category);
    
    setForm({
      name: text,
      category: isOther ? "Other" : project.category,
      budget: project.budget,
      start_date: new Date(project.start_date).toISOString().split('T')[0],
      expected_completion: new Date(project.expected_completion).toISOString().split('T')[0],
      progress: project.progress,
      status: project.status,
      contractor: contractor !== "Unknown" ? contractor : "",
      before_image: project.before_image || "",
      after_image: project.after_image || "",
      updated_by: project.updated_by || ""
    });
    setEditCustomCategory(isOther ? project.category : "");
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
      const updateData = { 
        ...activeProject, 
        progress: finalProgress, 
        status: newStatus,
        after_image: afterImageUrl
      };
      if (newStatus === "completed") {
        updateData.expected_completion = new Date().toISOString();
      }
      await api.put(`/projects/${activeProject.id}`, updateData, token);
      
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

  const active = projects.filter(p => p.status === "active" || p.status === "planning");
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
          setForm({ name: "", category: "", budget: "", start_date: "", expected_completion: "", progress: 0, status: "planning", contractor: "", before_image: "", after_image: "", updated_by: "" });
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
                {form.category === "Other" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Category Name</label>
                    <input type="text" required placeholder="e.g. Tree Plantation" value={customCategory} onChange={e => setCustomCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none" />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contractor / Agency</label>
                  <input type="text" placeholder="e.g. ABC Constructions" value={form.contractor} onChange={e => setForm({...form, contractor: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Karyawahi Adhikari / Monitor Name</label>
                  <input type="text" placeholder="e.g. Rajesh Kumar (Panchayat Monitor)" value={form.updated_by} onChange={e => setForm({...form, updated_by: e.target.value})}
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
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Before Image (Kaam se pehle ki photo)</label>
                  <div className="flex flex-wrap items-center gap-4 mt-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => {
                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'before');
                      }}
                      className="hidden" 
                      id="before-image-file" 
                    />
                    <label 
                      htmlFor="before-image-file" 
                      className="cursor-pointer px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-xs font-bold border border-orange-200 inline-flex items-center gap-2 transition-all"
                    >
                      {uploadingBefore ? "Uploading..." : "Choose Image"}
                    </label>
                    {form.before_image ? (
                      <div className="flex items-center gap-2">
                        <img src={form.before_image} alt="Before Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                        <button type="button" onClick={() => setForm(prev => ({ ...prev, before_image: "" }))} className="text-rose-500 text-xs font-bold hover:underline">Remove</button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">No image uploaded</span>
                    )}
                  </div>
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

      {/* Tabs for Separation */}
      <div className="flex border-b border-slate-100 gap-2 mb-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "active"
              ? "border-blue-600 text-blue-600 bg-blue-50/30"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Hammer className="w-4 h-4" />
          <span>Ongoing & Active Works ({active.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "completed"
              ? "border-emerald-600 text-emerald-600 bg-emerald-50/30"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Completed History ({completed.length})</span>
        </button>
      </div>

      <Card>
        <CardHeader 
          title={activeTab === "active" ? "Ongoing & Active Works" : "Completed History"} 
          subtitle={activeTab === "active" ? "Update progress for ongoing village works" : "Archive of completed village development works"} 
        />
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
                ) : (activeTab === "active" ? active : completed).length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-bold uppercase tracking-widest">No {activeTab} projects found.</td></tr>
                ) : (activeTab === "active" ? active : completed).map(p => {
                  const { contractor, text } = parseName(p.name);
                  return (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 relative">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2 flex-shrink-0">
                            {p.before_image ? (
                              <img src={p.before_image} alt="Before" className="w-10 h-10 object-cover rounded-lg border-2 border-white shadow-sm" />
                            ) : (
                              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400"><Hammer className="w-4 h-4" /></div>
                            )}
                            {p.after_image && (
                              <img src={p.after_image} alt="After" className="w-10 h-10 object-cover rounded-lg border-2 border-white shadow-sm" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900">{text}</p>
                            <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">Agency: {contractor}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mb-1">{new Date(p.start_date).toLocaleDateString("en-IN")} → {new Date(p.expected_completion).toLocaleDateString("en-IN")}</p>
                            {p.updated_by && (
                              <p className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase tracking-wide">
                                Updated By: {p.updated_by}
                              </p>
                            )}
                          </div>
                        </div>
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
                          {p.status !== "completed" && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => openEditModal(p)} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 border-0 rounded-lg">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openUpdateModal(p)} className="text-xs rounded-xl gap-1">
                                <ArrowUpRight className="w-3 h-3" /> Update
                              </Button>
                            </>
                          )}
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
          <Card className="w-full max-w-2xl relative shadow-2xl border-0 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <CardHeader title="Edit Project Details" subtitle="Update information for the selected project" />
            <CardContent className="p-8 pt-0 overflow-y-auto flex-1 min-h-0">
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
                  {form.category === "Other" && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Category Name</label>
                      <input type="text" required placeholder="e.g. Tree Plantation" value={editCustomCategory} onChange={e => setEditCustomCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contractor / Agency</label>
                    <input type="text" value={form.contractor} onChange={e => setForm({...form, contractor: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Karyawahi Adhikari / Monitor Name</label>
                    <input type="text" value={form.updated_by} onChange={e => setForm({...form, updated_by: e.target.value})}
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
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Before Image (Kaam se pehle ki photo)</label>
                    <div className="flex flex-wrap items-center gap-4 mt-1">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => {
                          if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'before');
                        }}
                        className="hidden" 
                        id="edit-before-image-file" 
                      />
                      <label 
                        htmlFor="edit-before-image-file" 
                        className="cursor-pointer px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold border border-amber-200 inline-flex items-center gap-2 transition-all"
                      >
                        {uploadingBefore ? "Uploading..." : "Choose Image"}
                      </label>
                      {form.before_image ? (
                        <div className="flex items-center gap-2">
                          <img src={form.before_image} alt="Before Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                          <button type="button" onClick={() => setForm(prev => ({ ...prev, before_image: "" }))} className="text-rose-500 text-xs font-bold hover:underline">Remove</button>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">No image uploaded</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">After Image (Kaam ke baad ki photo)</label>
                    <div className="flex flex-wrap items-center gap-4 mt-1">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => {
                          if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'after');
                        }}
                        className="hidden" 
                        id="edit-after-image-file" 
                      />
                      <label 
                        htmlFor="edit-after-image-file" 
                        className="cursor-pointer px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold border border-amber-200 inline-flex items-center gap-2 transition-all"
                      >
                        {uploadingAfter ? "Uploading..." : "Choose Image"}
                      </label>
                      {form.after_image ? (
                        <div className="flex items-center gap-2">
                          <img src={form.after_image} alt="After Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                          <button type="button" onClick={() => setForm(prev => ({ ...prev, after_image: "" }))} className="text-rose-500 text-xs font-bold hover:underline">Remove</button>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">No image uploaded</span>
                      )}
                    </div>
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
          <Card className="w-full max-w-lg relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <button onClick={() => setViewModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="p-8 overflow-y-auto flex-1">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Hammer className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">{parseName(activeProject.name).text}</h2>
              <p className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-widest">{activeProject.category}</p>

              {/* Image Previews inside View Modal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Kaam se pehle ki photo</span>
                  {activeProject.before_image ? (
                    <a href={activeProject.before_image} download target="_blank" rel="noopener noreferrer" className="block relative group/img cursor-pointer">
                      <img src={activeProject.before_image} alt="Before" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all rounded-xl gap-1">
                        <Download className="w-3.5 h-3.5" /> Download
                      </div>
                    </a>
                  ) : (
                    <div className="w-full h-32 bg-slate-100 rounded-xl flex items-center justify-center text-[9px] text-slate-400 font-bold uppercase border border-dashed border-slate-200">No Image</div>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Kaam ke baad ki photo</span>
                  {activeProject.after_image ? (
                    <a href={activeProject.after_image} download target="_blank" rel="noopener noreferrer" className="block relative group/img cursor-pointer">
                      <img src={activeProject.after_image} alt="After" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all rounded-xl gap-1">
                        <Download className="w-3.5 h-3.5" /> Download
                      </div>
                    </a>
                  ) : (
                    <div className="w-full h-32 bg-slate-100 rounded-xl flex items-center justify-center text-[9px] text-slate-400 font-bold uppercase border border-dashed border-slate-200">No Image</div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Karya Karta (Agency)</span>
                  <span className="text-sm font-black text-slate-900">{parseName(activeProject.name).contractor}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Budget</span>
                  <span className="text-sm font-black text-slate-900">₹{(activeProject.budget || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Start Date</span>
                  <span className="text-sm font-bold text-slate-700">{new Date(activeProject.start_date).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {activeProject.status === "completed" ? "Completed Date" : "Expected End Date"}
                  </span>
                  <span className="text-sm font-bold text-slate-700">{new Date(activeProject.expected_completion).toLocaleDateString("en-IN")}</span>
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
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Karyawahi Adhikari (Monitor)</span>
                  <span className="text-sm font-black text-slate-900">{activeProject.updated_by || "Panchayat Admin"}</span>
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
              {parseInt(newProgress) === 100 && (
                <div className="space-y-2 text-left animate-in fade-in duration-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    After Image (Kaam completed hone ke baad ki photo)
                  </label>
                  <div className="flex flex-wrap items-center gap-4 mt-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => {
                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'updateProgressAfter');
                      }}
                      className="hidden" 
                      id="progress-after-image-file" 
                    />
                    <label 
                      htmlFor="progress-after-image-file" 
                      className="cursor-pointer px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 inline-flex items-center gap-2 transition-all"
                    >
                      {uploadingAfter ? "Uploading..." : "Choose Image"}
                    </label>
                    {afterImageUrl ? (
                      <div className="flex items-center gap-2">
                        <img src={afterImageUrl} alt="After Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                        <button type="button" onClick={() => setAfterImageUrl("")} className="text-rose-500 text-xs font-bold hover:underline">Remove</button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">No image uploaded</span>
                    )}
                  </div>
                </div>
              )}

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
