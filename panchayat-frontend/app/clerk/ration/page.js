"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Package, Calendar, Clock, Users, Plus, Trash2, X, CheckCircle, AlertTriangle, Edit2, ShoppingBag, Save } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function AdminRation() {
  const [schedules, setSchedules] = useState([]);
  const [rationConfigs, setRationConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(false);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    distribution_date: "", 
    timing_description: "", 
    items_available: "",
    shop_name: "",
    contact_number: "",
    card_type: "All Cards",
    ward_area: "",
    special_instructions: "",
    last_date: ""
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => { 
    fetchRation(); 
    fetchRationConfigs();
  }, []);

  const fetchRation = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/ration", token);
      setSchedules(data.schedules || data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchRationConfigs = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/ration-config", token);
      if (Array.isArray(data)) setRationConfigs(data);
    } catch (error) { console.error("Error fetching ration configs:", error); }
  };

  const handleConfigChange = (index, field, value) => {
    const updated = [...rationConfigs];
    updated[index] = { ...updated[index], [field]: value };
    setRationConfigs(updated);
  };

  const saveRationConfigs = async () => {
    try {
      setConfigLoading(true);
      const token = localStorage.getItem("accessToken");
      await api.put("/ration-config", { configs: rationConfigs }, token);
      showToast("Ration configuration saved successfully!");
      setIsEditingConfig(false);
    } catch (error) {
      showToast("Failed to save ration configurations.", "error");
    } finally {
      setConfigLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const data = {
        ...formData,
        distribution_date: new Date(formData.distribution_date).toISOString()
      };
      
      if (editingId) {
        const res = await api.put(`/ration/${editingId}`, data, token);
        setSchedules(schedules.map(s => s.id === editingId ? res.schedule : s));
        showToast("Ration schedule updated successfully!");
      } else {
        const res = await api.post("/ration", data, token);
        setSchedules([res.schedule, ...schedules].sort((a, b) => new Date(b.distribution_date) - new Date(a.distribution_date)));
        showToast("Ration schedule added successfully!");
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({ 
        distribution_date: "", timing_description: "", items_available: "",
        shop_name: "", contact_number: "", card_type: "All Cards", ward_area: "", special_instructions: "" 
      });
    } catch (e) {
      showToast(e.message || "Failed to save schedule", "error");
    }
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    setFormData({
      ...schedule,
      distribution_date: schedule.distribution_date ? new Date(schedule.distribution_date).toISOString().split('T')[0] : "",
      shop_name: schedule.shop_name || "",
      contact_number: schedule.contact_number || "",
      card_type: schedule.card_type || "All Cards",
      ward_area: schedule.ward_area || "",
      special_instructions: schedule.special_instructions || "",
      last_date: schedule.last_date ? new Date(schedule.last_date).toISOString().split('T')[0] : ""
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`/ration/${deleteConfirmId}`, token);
      setSchedules(schedules.filter(s => s.id !== deleteConfirmId));
      showToast("Schedule deleted successfully!");
    } catch (e) {
      showToast(e.message || "Failed to delete schedule", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
            <Package className="w-3 h-3" /> Ration Distribution
          </div>
          <h1 className="text-4xl font-black text-slate-900">Ration Schedule</h1>
          <p className="text-slate-500 font-medium mt-1">Manage PDS distribution dates and item listings.</p>
        </div>
        <Button onClick={() => {
          setEditingId(null);
          setFormData({ 
            distribution_date: "", timing_description: "", items_available: "",
            shop_name: "", contact_number: "", card_type: "All Cards", ward_area: "", special_instructions: "", last_date: "" 
          });
          setShowModal(true);
        }} className="gap-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-600/20">
          <Plus className="w-4 h-4" /> Add Schedule
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center"><Calendar className="w-6 h-6 text-teal-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Upcoming Dates</p><h3 className="text-2xl font-black text-slate-900">{schedules.filter(s => new Date(s.distribution_date).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)).length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center"><Package className="w-6 h-6 text-amber-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Distribution Status</p><h3 className="text-lg font-black text-emerald-600">Active</h3></div>
          </div>
        </Card>
      </div>

       {/* RATION CONFIGURATION */}
      <Card>
         <CardHeader 
           title="Ration Quota Configuration" 
           subtitle="Set the grain & sugar limits per card type" 
           action={
             !isEditingConfig && (
               <Button onClick={() => setIsEditingConfig(true)} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/20">
                 <Edit2 className="w-4 h-4" /> Edit Quotas
               </Button>
             )
           }
         />
         <CardContent className="space-y-6">
            {!isEditingConfig ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rationConfigs.map((conf) => {
                  const styles = {
                    APL: { iconBg: "bg-blue-500/10", iconText: "text-blue-600", border: "border-blue-100", bg: "bg-gradient-to-br from-blue-50 to-white" },
                    BPL: { iconBg: "bg-amber-500/10", iconText: "text-amber-600", border: "border-amber-100", bg: "bg-gradient-to-br from-amber-50 to-white" },
                    AAY: { iconBg: "bg-rose-500/10", iconText: "text-rose-600", border: "border-rose-100", bg: "bg-gradient-to-br from-rose-50 to-white" }
                  };
                  const style = styles[conf.card_type] || { iconBg: "bg-slate-100", iconText: "text-slate-600", border: "border-slate-100", bg: "bg-slate-50" };

                  return (
                    <div key={conf.card_type} className={`p-6 rounded-3xl border ${style.border} ${style.bg} flex flex-col gap-5 shadow-sm hover:shadow-md transition-all`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${style.iconBg} ${style.iconText}`}>
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg tracking-tight">{conf.card_type} Card</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Monthly Quota</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-white rounded-2xl shadow-sm border border-slate-100/50">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Wheat</p>
                          <p className="text-xl font-black text-slate-700">{conf.wheat} <span className="text-xs font-semibold text-slate-400">kg</span></p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-2xl shadow-sm border border-slate-100/50">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rice</p>
                          <p className="text-xl font-black text-slate-700">{conf.rice} <span className="text-xs font-semibold text-slate-400">kg</span></p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-2xl shadow-sm border border-slate-100/50">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sugar</p>
                          <p className="text-xl font-black text-slate-700">{conf.sugar} <span className="text-xs font-semibold text-slate-400">kg</span></p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                {rationConfigs.map((conf, index) => (
                  <div key={conf.card_type} className="p-5 bg-emerald-50/30 rounded-3xl border border-emerald-100 space-y-5">
                    <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-emerald-900">{conf.card_type} Card Quota</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Wheat (kg / member)</label>
                        <Input 
                          type="number" 
                          value={conf.wheat} 
                          onChange={(e) => handleConfigChange(index, 'wheat', e.target.value)} 
                          className="bg-white border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Rice (kg / member)</label>
                        <Input 
                          type="number" 
                          value={conf.rice} 
                          onChange={(e) => handleConfigChange(index, 'rice', e.target.value)} 
                          className="bg-white border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Sugar (kg / household)</label>
                        <Input 
                          type="number" 
                          value={conf.sugar} 
                          onChange={(e) => handleConfigChange(index, 'sugar', e.target.value)} 
                          className="bg-white border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <Button 
                    onClick={() => {
                      fetchRationConfigs(); // Re-fetch to discard unsaved changes
                      setIsEditingConfig(false);
                    }} 
                    disabled={configLoading} 
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveRationConfigs} 
                    disabled={configLoading || rationConfigs.length === 0} 
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20"
                  >
                    <Save className="w-4 h-4" /> {configLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
         </CardContent>
      </Card>

      {/* UPCOMING SCHEDULES */}
      <Card>
        <CardHeader 
          title="Upcoming Distribution" 
          subtitle="Scheduled ration distribution events" 
          action={
            <Link href="/clerk/ration/history" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-xl text-sm font-semibold transition-all">
              <Clock className="w-4 h-4" />
              View History
            </Link>
          }
        />
        <CardContent className="space-y-4">
          {loading ? <p className="text-center py-8 text-slate-400">Loading...</p> :
            schedules.filter(s => new Date(s.distribution_date).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)).length === 0 ? (
              <p className="text-center py-8 text-slate-400">No upcoming schedules.</p>
            ) :
            schedules.filter(s => new Date(s.distribution_date).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)).map(s => (
              <div key={s.id} className="p-6 bg-gradient-to-r from-teal-50 to-white border border-teal-100 rounded-3xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center"><Calendar className="w-5 h-5 text-teal-600" /></div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{s.distribution_date ? new Date(s.distribution_date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "TBD"}</h3>
                      <p className="text-xs text-slate-500 font-semibold">{s.timing_description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 text-[10px] font-black rounded-full uppercase">Scheduled</span>
                    <button onClick={() => handleEdit(s)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirmId(s.id)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ration Shop (Kotedar)</p>
                    <p className="text-sm font-bold text-slate-700">{s.shop_name || "Any Designated Shop"}</p>
                    {s.contact_number && (
                      <p className="text-xs text-slate-500 font-semibold mt-1">📞 {s.contact_number}</p>
                    )}
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Card Eligibility</p>
                    <p className="text-sm font-bold text-slate-700">{s.card_type || "All Cards"}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ward / Area</p>
                    <p className="text-sm font-bold text-slate-700">{s.ward_area || "Whole Village"}</p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Items Available</p>
                  <p className="text-sm font-semibold text-slate-700">{s.items_available}</p>
                </div>

                {s.special_instructions && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
                    <p className="text-[10px] font-black text-amber-600/80 uppercase tracking-widest mb-2">Special Instructions</p>
                    <p className="text-sm font-semibold text-amber-900">{s.special_instructions}</p>
                  </div>
                )}
              </div>
            ))
          }
        </CardContent>
      </Card>


      {/* Add/Edit Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200 overflow-hidden rounded-[2rem]">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <CardHeader className="bg-gradient-to-r from-teal-50 to-white border-b border-teal-100 pb-8 pt-8 px-8">
              <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">{editingId ? "Edit Schedule" : "New Schedule"}</h2>
                <p className="text-sm font-semibold text-slate-500 mt-1">{editingId ? "Update existing ration distribution details" : "Create a new ration distribution event"}</p>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                    <input type="date" required value={formData.distribution_date} onChange={e => setFormData({...formData, distribution_date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Last Date (Optional)</label>
                    <input type="date" value={formData.last_date} onChange={e => setFormData({...formData, last_date: e.target.value})} className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timing</label>
                  <input type="text" required placeholder="09:00 AM - 05:00 PM" value={formData.timing_description} onChange={e => setFormData({...formData, timing_description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ration Shop / Dealer</label>
                    <input type="text" placeholder="e.g. Ramu Kotedar, Shop 1" value={formData.shop_name} onChange={e => setFormData({...formData, shop_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dealer Contact No.</label>
                    <input type="tel" placeholder="e.g. 9876543210" value={formData.contact_number} onChange={e => setFormData({...formData, contact_number: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Eligibility</label>
                    <select value={formData.card_type} onChange={e => setFormData({...formData, card_type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all">
                      <option value="All Cards">All Cards</option>
                      <option value="BPL Only">BPL Only</option>
                      <option value="AAY Only">AAY Only</option>
                      <option value="APL Only">APL Only</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ward / Area (Optional)</label>
                    <input type="text" placeholder="e.g. Ward 1 to 5" value={formData.ward_area} onChange={e => setFormData({...formData, ward_area: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items Available</label>
                  <input type="text" required placeholder="e.g. Wheat (10kg), Rice (5kg)" value={formData.items_available} onChange={e => setFormData({...formData, items_available: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Special Instructions</label>
                  <textarea rows="2" placeholder="e.g. Bring your original Aadhaar Card..." value={formData.special_instructions} onChange={e => setFormData({...formData, special_instructions: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all resize-none"></textarea>
                </div>

                <Button type="submit" className="w-full py-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-xl shadow-teal-600/20 mt-4">
                  {editingId ? "Update Schedule" : "Publish Schedule"}
                </Button>
              </form>
            </CardContent>
          </Card>
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

      {/* Modern Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Delete Schedule?</h2>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                  Are you sure you want to delete this ration distribution schedule? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full pt-4">
                <Button variant="outline" className="flex-1 rounded-xl py-6 font-bold" onClick={() => setDeleteConfirmId(null)}>
                  Cancel
                </Button>
                <Button className="flex-1 rounded-xl py-6 font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-xl shadow-rose-500/20" onClick={confirmDelete}>
                  Yes, Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
