"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Heart, Plus, Calendar, MapPin, Users, Stethoscope, Trash2, X, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminHealthCamps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [formData, setFormData] = useState({ 
    camp_name: "", camp_type: "Vaccination", date: "", location: "", description: "",
    timing: "", organizing_team: "", target_audience: "All Citizens", required_docs: ""
  });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => { fetchCamps(); }, []);

  const fetchCamps = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/health-camps", token);
      setCamps(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const data = { ...formData, date: new Date(formData.date).toISOString() };
      const res = await api.post("/health-camps", data, token);
      setCamps([res.camp, ...camps]);
      setShowModal(false);
      setFormData({ 
        camp_name: "", camp_type: "Vaccination", date: "", location: "", description: "",
        timing: "", organizing_team: "", target_audience: "All Citizens", required_docs: ""
      });
      showToast("Health camp added successfully!");
    } catch (e) {
      showToast(e.message || "Failed to add health camp", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`/health-camps/${deleteConfirmId}`, token);
      setCamps(camps.filter(c => c.id !== deleteConfirmId));
      showToast("Health camp deleted successfully!");
    } catch (e) {
      showToast(e.message || "Failed to delete health camp", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
            <Heart className="w-3 h-3" /> Health Management
          </div>
          <h1 className="text-4xl font-black text-slate-900">Health Camps</h1>
          <p className="text-slate-500 font-medium mt-1">Manage vaccination drives, health checkup camps, and registrations.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/20">
          <Plus className="w-4 h-4" /> Add Camp
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center"><Stethoscope className="w-6 h-6 text-rose-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Camps</p><h3 className="text-2xl font-black text-slate-900">{camps.length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Registrations</p><h3 className="text-2xl font-black text-slate-900">{camps.reduce((sum, c) => sum + (c.registrations?.length || 0), 0)}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center"><Heart className="w-6 h-6 text-emerald-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Camp Types</p><h3 className="text-2xl font-black text-slate-900">{new Set(camps.map(c => c.camp_type)).size}</h3></div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="All Health Camps" subtitle="Scheduled and past health initiatives" />
        <CardContent className="space-y-4">
          {loading ? <p className="text-center py-8 text-slate-400">Loading...</p> :
            camps.map(camp => (
              <div key={camp.id} className="p-6 bg-gradient-to-r from-rose-50 to-white border border-rose-100 rounded-3xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center"><Heart className="w-6 h-6 text-rose-600" /></div>
                    <div>
                      <h3 className="font-bold text-slate-900">{camp.camp_name}</h3>
                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-700 text-[10px] font-black rounded-full uppercase">{camp.camp_type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-100">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-black text-slate-700">{camp.registrations?.length || 0} registered</span>
                    </div>
                    <button onClick={() => setDeleteConfirmId(camp.id)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-rose-100/50 pt-4 mt-2">
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Organizing Team</p>
                    <p className="text-sm font-bold text-slate-700">{camp.organizing_team || "Panchayat Medical Staff"}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Audience</p>
                    <p className="text-sm font-bold text-slate-700">{camp.target_audience || "All Citizens"}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Required Docs</p>
                    <p className="text-sm font-bold text-slate-700">{camp.required_docs || "None"}</p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
                  <p className="text-sm text-slate-600 font-medium">{camp.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-500" />{camp.date ? new Date(camp.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "TBD"}</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" />{camp.timing || "10:00 AM - 04:00 PM"}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-500" />{camp.location}</div>
                </div>
              </div>
            ))
          }
        </CardContent>
      </Card>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/10 rounded-2xl flex items-center justify-center"><Heart className="w-5 h-5 text-rose-600" /></div>
                <h2 className="text-xl font-black text-slate-900">New Health Camp</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleAdd} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Camp Name</label>
                <input type="text" required placeholder="e.g. Free Polio Vaccination" value={formData.camp_name} onChange={e => setFormData({...formData, camp_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Camp Type</label>
                <select required value={formData.camp_type} onChange={e => setFormData({...formData, camp_type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all">
                  <option value="Vaccination">Vaccination</option>
                  <option value="Checkup">Checkup</option>
                  <option value="Awareness">Awareness</option>
                  <option value="Blood Donation">Blood Donation</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timing</label>
                  <input type="text" placeholder="e.g. 09:00 AM - 02:00 PM" value={formData.timing} onChange={e => setFormData({...formData, timing: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                  <input type="text" required placeholder="e.g. Panchayat Dispensary" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organizing Team</label>
                  <input type="text" placeholder="e.g. Dr. Sharma - City Hospital" value={formData.organizing_team} onChange={e => setFormData({...formData, organizing_team: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Audience</label>
                  <input type="text" placeholder="e.g. Children under 5" value={formData.target_audience} onChange={e => setFormData({...formData, target_audience: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Docs</label>
                  <input type="text" placeholder="e.g. Aadhaar Card" value={formData.required_docs} onChange={e => setFormData({...formData, required_docs: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                <textarea rows="2" required placeholder="Details about the camp..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all resize-none"></textarea>
              </div>
              <Button type="submit" className="w-full py-4 text-base bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xl shadow-rose-600/20">Create Camp</Button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Delete Camp?</h2>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                  Are you sure you want to delete this health camp? All registrations for this camp will also be removed.
                </p>
              </div>
              <div className="flex gap-3 w-full pt-4">
                <Button variant="outline" className="flex-1 rounded-xl py-6 font-bold" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                <Button className="flex-1 rounded-xl py-6 font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-xl shadow-rose-500/20" onClick={confirmDelete}>Yes, Delete</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl z-50 transition-all duration-300 font-bold text-sm ${toast.type === 'error' ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-emerald-500 text-white shadow-emerald-500/30'}`}>
          <div className="flex items-center gap-3">
            {toast.type === 'error' ? <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> : <CheckCircle className="w-5 h-5 text-emerald-100" />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
