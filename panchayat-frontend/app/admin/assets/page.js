"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Building2, Plus, MapPin, AlertCircle, CheckCircle, Hammer, Trash2, X, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [form, setForm] = useState({ name: "", asset_type: "", location: "", condition: "Good" });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/assets", token);
      setAssets(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      await api.post("/assets", form, token);
      showToast("Asset registered successfully!");
      setShowForm(false);
      setForm({ name: "", asset_type: "", location: "", condition: "Good" });
      fetchAssets();
    } catch (e) { showToast(e.message, "error"); }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`/assets/${deleteConfirmId}`, token);
      setAssets(assets.filter(a => a.id !== deleteConfirmId));
      showToast("Asset deleted successfully!");
    } catch (e) {
      showToast(e.message || "Failed to delete asset", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const conditionColor = (c) => {
    if (c === "Good") return "bg-emerald-500/10 text-emerald-700";
    if (c === "Fair") return "bg-amber-500/10 text-amber-700";
    return "bg-rose-500/10 text-rose-700";
  };

  const conditionIcon = (c) => {
    if (c === "Good") return <CheckCircle className="w-4 h-4" />;
    if (c === "Fair") return <AlertCircle className="w-4 h-4" />;
    return <Hammer className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
            <Building2 className="w-3 h-3" /> Asset Registry
          </div>
          <h1 className="text-4xl font-black text-slate-900">Village Assets</h1>
          <p className="text-slate-500 font-medium mt-1">Maintain inventory of all panchayat buildings, tanks, and infrastructure.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700 text-white gap-2 rounded-2xl shadow-xl shadow-purple-200">
          <Plus className="w-5 h-5" /> Add Asset
        </Button>
      </div>

      {showForm && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
          <CardContent className="p-8">
            <form onSubmit={handleCreate} className="space-y-6">
              <h3 className="text-lg font-black text-slate-900">Register New Asset</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Panchayat Bhawan"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                  <select value={form.asset_type} onChange={e => setForm({...form, asset_type: e.target.value})} required
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none">
                    <option value="">Select type</option>
                    <option value="Panchayat Bhawan">Panchayat Bhawan</option>
                    <option value="School">School</option>
                    <option value="Anganwadi">Anganwadi</option>
                    <option value="Water Tank">Water Tank</option>
                    <option value="Community Hall">Community Hall</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                  <input type="text" required value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Ward 02"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Condition</label>
                  <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none">
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Needs Repair">Needs Repair</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white gap-2 rounded-xl">Register Asset</Button>
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
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center"><Building2 className="w-6 h-6 text-purple-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Assets</p><h3 className="text-2xl font-black text-slate-900">{assets.length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Good Condition</p><h3 className="text-2xl font-black text-slate-900">{assets.filter(a => a.condition === "Good").length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center"><AlertCircle className="w-6 h-6 text-amber-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Needs Attention</p><h3 className="text-2xl font-black text-slate-900">{assets.filter(a => a.condition !== "Good").length}</h3></div>
          </div>
        </Card>
      </div>

      {/* Assets Grid */}
      <Card>
        <CardHeader title="Asset Inventory" subtitle="All registered panchayat properties" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <p className="col-span-full text-center py-8 text-slate-400">Loading...</p> :
              assets.map(a => (
                <div key={a.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 hover:shadow-lg hover:border-slate-200 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Building2 className="w-6 h-6 text-purple-600" />
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${conditionColor(a.condition)}`}>
                        {conditionIcon(a.condition)} {a.condition}
                      </span>
                    </div>
                    <button onClick={() => setDeleteConfirmId(a.id)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900">{a.name}</h4>
                  <p className="text-xs font-semibold text-slate-500">{a.asset_type}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                    <MapPin className="w-3 h-3" /> {a.location}
                  </div>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Delete Asset?</h2>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                  Are you sure you want to delete this village asset from the registry?
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
