"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Droplets, Plus, AlertTriangle, CheckCircle, MapPin, X, Edit, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminWaterSupply() {
  const [schedules, setSchedules] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ area: "", timing: "", status: "active", notes: "", operator: "", source: "" });
  
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState(null);
  
  const [showTankForm, setShowTankForm] = useState(false);
  const [tankForm, setTankForm] = useState({ location: "", capacity: "", condition: "Good" });

  const [toastMessage, setToastMessage] = useState("");
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  
  const [deleteTankModalOpen, setDeleteTankModalOpen] = useState(false);
  const [tankToDelete, setTankToDelete] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const [sched, tankData] = await Promise.all([
        api.get("/water-supply", token),
        api.get("/water-supply/tanks", token)
      ]);
      setSchedules(sched);
      setTanks(tankData);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      
      const bundledNotes = `[OPERATOR:${form.operator || 'N/A'}] [SOURCE:${form.source || 'N/A'}] ${form.notes}`;
      
      await api.post("/water-supply", { ...form, notes: bundledNotes }, token);
      
      setToastMessage("Water supply schedule added!");
      setTimeout(() => setToastMessage(""), 3000);
      setShowForm(false);
      setForm({ area: "", timing: "", status: "active", notes: "", operator: "", source: "" });
      fetchData();
    } catch (e) { alert(e.message); }
  };

  const parseNotes = (rawNotes) => {
    let operator = "Unknown";
    let source = "Unknown";
    let text = rawNotes || "";

    const opMatch = text.match(/\[OPERATOR:\s*(.*?)\]/i);
    const srcMatch = text.match(/\[SOURCE:\s*(.*?)\]/i);

    if (opMatch) { operator = opMatch[1]; text = text.replace(opMatch[0], ''); }
    if (srcMatch) { source = srcMatch[1]; text = text.replace(srcMatch[0], ''); }

    return { operator: operator.trim(), source: source.trim(), text: text.trim() };
  };

  const openUpdateModal = (schedule) => {
    const { operator, source, text } = parseNotes(schedule.notes);
    setUpdateForm({ ...schedule, notes: text, operator, source });
    setUpdateModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const bundledNotes = `[OPERATOR:${updateForm.operator || 'N/A'}] [SOURCE:${updateForm.source || 'N/A'}] ${updateForm.notes}`;
      
      await api.put(`/water-supply/${updateForm.id}`, { ...updateForm, notes: bundledNotes }, token);
      
      setToastMessage("Water schedule updated!");
      setTimeout(() => setToastMessage(""), 3000);
      setUpdateModalOpen(false);
      fetchData();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = (id) => {
    setScheduleToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!scheduleToDelete) return;
    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`/water-supply/${scheduleToDelete}`, token);
      setToastMessage("Water schedule deleted!");
      setTimeout(() => setToastMessage(""), 3000);
      fetchData();
    } catch (e) { alert(e.message); } finally {
      setDeleteModalOpen(false);
      setScheduleToDelete(null);
    }
  };

  const activeCount = schedules.filter(s => s.status === "active").length;
  const interruptedCount = schedules.filter(s => s.status === "interrupted").length;

  const handleAddTank = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      await api.post("/water-supply/tanks", {
        ...tankForm,
        capacity: parseFloat(tankForm.capacity)
      }, token);
      
      setToastMessage("Water tank added successfully!");
      setTimeout(() => setToastMessage(""), 3000);
      setShowTankForm(false);
      setTankForm({ location: "", capacity: "", condition: "Good" });
      fetchData();
    } catch (e) { alert(e.message); }
  };

  const handleDeleteTank = (id) => {
    setTankToDelete(id);
    setDeleteTankModalOpen(true);
  };

  const confirmDeleteTank = async () => {
    if (!tankToDelete) return;
    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`/water-supply/tanks/${tankToDelete}`, token);
      setToastMessage("Water tank deleted!");
      setTimeout(() => setToastMessage(""), 3000);
      fetchData();
    } catch (e) { alert(e.message); } finally {
      setDeleteTankModalOpen(false);
      setTankToDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
            <Droplets className="w-3 h-3" /> Water Supply Management
          </div>
          <h1 className="text-4xl font-black text-slate-900">Water Supply</h1>
          <p className="text-slate-500 font-medium mt-1">Manage ward-wise water schedules, tanks, and interruption alerts.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 rounded-2xl shadow-xl shadow-cyan-200">
          <Plus className="w-5 h-5" /> New Schedule
        </Button>
      </div>

      {showForm && (
        <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50/50 to-white">
          <CardContent className="p-8">
            <form onSubmit={handleCreate} className="space-y-6">
              <h3 className="text-lg font-black text-slate-900">Add Water Supply Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Area / Wards</label>
                  <input type="text" required value={form.area} onChange={e => setForm({...form, area: e.target.value})} placeholder="e.g. Ward 01, Ward 02"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timing</label>
                  <input type="text" required value={form.timing} onChange={e => setForm({...form, timing: e.target.value})} placeholder="e.g. 06:00 AM - 07:30 AM"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none">
                    <option value="active">Active</option>
                    <option value="interrupted">Interrupted</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valve Operator</label>
                  <input type="text" value={form.operator} onChange={e => setForm({...form, operator: e.target.value})} placeholder="e.g. Ramesh Singh"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Water Source</label>
                  <select value={form.source} onChange={e => setForm({...form, source: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none">
                    <option value="">Select Source</option>
                    {tanks.map(t => <option key={t.id} value={t.location}>{t.location}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes (Optional)</label>
                  <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Pipeline repair, etc."
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 rounded-xl">Save Schedule</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-cyan-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Lines</p><h3 className="text-2xl font-black text-slate-900">{activeCount}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-rose-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Interrupted</p><h3 className="text-2xl font-black text-slate-900">{interruptedCount}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center"><Droplets className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Water Tanks</p><h3 className="text-2xl font-black text-slate-900">{tanks.length}</h3></div>
          </div>
        </Card>
      </div>

      {/* Schedules Table */}
      <Card>
        <CardHeader title="Water Supply Schedules" subtitle="Ward-wise distribution timetable" />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Area</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timing</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(s => {
                  const { operator, source, text } = parseNotes(s.notes);
                  return (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-slate-900">{s.area}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Op: {operator}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Src: {source}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{s.timing}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${s.status === "active" ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-700"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">{text || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => openUpdateModal(s)} className="w-8 h-8 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50 border-blue-200">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(s.id)} className="w-8 h-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Water Tanks */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-900">Water Tanks Inventory</h3>
            <p className="text-sm font-medium text-slate-500">Storage facility locations and conditions</p>
          </div>
          <Button onClick={() => setShowTankForm(true)} className="mt-4 sm:mt-0 bg-cyan-600 hover:bg-cyan-700 text-white gap-2 rounded-xl">
            <Plus className="w-4 h-4" /> Add Tank
          </Button>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tanks.map(t => (
              <div key={t.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group overflow-hidden">
                <button onClick={() => handleDeleteTank(t.id)} className="absolute top-4 right-4 p-2 bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-start justify-between pe-12">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center"><Droplets className="w-5 h-5 text-cyan-600" /></div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${t.condition === "Good" ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"}`}>{t.condition}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{t.location}</h4>
                <p className="text-xs text-slate-500 font-semibold">Capacity: {(t.capacity || 0).toLocaleString()} Litres</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Update Schedule Modal */}
      {updateModalOpen && updateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200 bg-gradient-to-br from-cyan-50/50 to-white">
            <button onClick={() => setUpdateModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <CardContent className="p-8">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                    <Edit className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Update Schedule</h3>
                    <p className="text-sm font-medium text-slate-500">Modify timings, status, or notes.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Area / Wards</label>
                    <input type="text" required value={updateForm.area} onChange={e => setUpdateForm({...updateForm, area: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timing</label>
                    <input type="text" required value={updateForm.timing} onChange={e => setUpdateForm({...updateForm, timing: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                    <select value={updateForm.status} onChange={e => setUpdateForm({...updateForm, status: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none">
                      <option value="active">Active</option>
                      <option value="interrupted">Interrupted</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valve Operator</label>
                    <input type="text" value={updateForm.operator} onChange={e => setUpdateForm({...updateForm, operator: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Water Source</label>
                    <select value={updateForm.source} onChange={e => setUpdateForm({...updateForm, source: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none">
                      <option value="">Select Source</option>
                      {tanks.map(t => <option key={t.id} value={t.location}>{t.location}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes (Optional)</label>
                    <input type="text" value={updateForm.notes} onChange={e => setUpdateForm({...updateForm, notes: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div className="pt-4">
                  <Button type="submit" className="w-full py-6 rounded-xl text-md font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20">
                    Confirm Updates
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Tank Modal */}
      {showTankForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowTankForm(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <CardContent className="p-8">
              <form onSubmit={handleAddTank} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-cyan-500/10 mx-auto rounded-full flex items-center justify-center mb-4">
                    <Droplets className="w-8 h-8 text-cyan-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Add New Tank</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">Register a new water source.</p>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tank Location / Name</label>
                    <input type="text" required value={tankForm.location} onChange={e => setTankForm({...tankForm, location: e.target.value})} placeholder="e.g. South Hill Tank"
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacity (Litres)</label>
                    <input type="number" required value={tankForm.capacity} onChange={e => setTankForm({...tankForm, capacity: e.target.value})} placeholder="e.g. 5000"
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Condition</label>
                    <select value={tankForm.condition} onChange={e => setTankForm({...tankForm, condition: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none">
                      <option value="Good">Good</option>
                      <option value="Needs Maintenance">Needs Maintenance</option>
                      <option value="Out of Service">Out of Service</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4">
                  <Button type="submit" className="w-full py-6 rounded-xl text-md font-bold bg-cyan-600 hover:bg-cyan-700 shadow-xl shadow-cyan-600/20">
                    Add Tank
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modern Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            {toastMessage}
          </div>
        </div>
      )}

      {/* Modern Custom Delete Schedule Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Delete Schedule?</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Are you sure you want to remove this water supply schedule? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="flex-1 rounded-xl py-6 font-bold">
                Cancel
              </Button>
              <Button onClick={confirmDelete} className="flex-1 rounded-xl py-6 bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-200">
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Custom Delete Tank Modal */}
      {deleteTankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Delete Water Tank?</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Are you sure you want to remove this water tank from inventory? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
              <Button variant="outline" onClick={() => setDeleteTankModalOpen(false)} className="flex-1 rounded-xl py-6 font-bold">
                Cancel
              </Button>
              <Button onClick={confirmDeleteTank} className="flex-1 rounded-xl py-6 bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-200">
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
