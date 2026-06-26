"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Tractor, 
  Plus, 
  Trash2, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Sprout, 
  Calendar, 
  Sparkles, 
  ClipboardList,
  Info,
  Link2,
  AlertOctagon,
  Droplets,
  HelpCircle,
  FileCheck
} from "lucide-react";
import { api } from "@/lib/api";

export default function AdminAgriculture() {
  const [data, setData] = useState({ schemes: [], advisories: [] });
  const [loading, setLoading] = useState(true);
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [showAdvisoryModal, setShowAdvisoryModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); 
  const [selectedItemDetails, setSelectedItemDetails] = useState(null); // { type: 'scheme'|'advisory', item }

  // Rich inputs for Schemes
  const [schemeForm, setSchemeForm] = useState({ 
    title: "", 
    description: "", 
    benefit: "", 
    link: "",
    eligibility: "",
    required_docs: "",
    deadline: ""
  });

  // Rich inputs for Advisories
  const [advisoryForm, setAdvisoryForm] = useState({ 
    crop_name: "", 
    advisory_message: "", 
    month: "",
    soil_type: "",
    fertilizer_info: "",
    pest_warning: "",
    watering_info: ""
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    fetchAgriData();
  }, []);

  const fetchAgriData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.get("/agriculture", token);
      setData(res || { schemes: [], advisories: [] });
    } catch (e) {
      console.error(e);
      showToast("Failed to fetch agriculture data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddScheme = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      // Serialize details as JSON in the description field
      const payload = {
        title: schemeForm.title,
        benefit: schemeForm.benefit,
        link: schemeForm.link,
        description: JSON.stringify({
          description: schemeForm.description,
          eligibility: schemeForm.eligibility,
          required_docs: schemeForm.required_docs,
          deadline: schemeForm.deadline
        })
      };

      const res = await api.post("/agriculture/schemes", payload, token);
      setData(prev => ({ ...prev, schemes: [...prev.schemes, res.scheme] }));
      setShowSchemeModal(false);
      setSchemeForm({ title: "", description: "", benefit: "", link: "", eligibility: "", required_docs: "", deadline: "" });
      showToast("Scheme added successfully!");
    } catch (e) {
      showToast(e.message || "Failed to add scheme", "error");
    }
  };

  const handleAddAdvisory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      // Serialize details as JSON in the advisory_message field
      const payload = {
        crop_name: advisoryForm.crop_name,
        month: advisoryForm.month,
        fertilizer_info: advisoryForm.fertilizer_info,
        advisory_message: JSON.stringify({
          advisory_message: advisoryForm.advisory_message,
          soil_type: advisoryForm.soil_type,
          pest_warning: advisoryForm.pest_warning,
          watering_info: advisoryForm.watering_info
        })
      };

      const res = await api.post("/agriculture/advisories", payload, token);
      setData(prev => ({ ...prev, advisories: [...prev.advisories, res.advisory] }));
      setShowAdvisoryModal(false);
      setAdvisoryForm({ crop_name: "", advisory_message: "", month: "", soil_type: "", fertilizer_info: "", pest_warning: "", watering_info: "" });
      showToast("Seasonal advisory added successfully!");
    } catch (e) {
      showToast(e.message || "Failed to add advisory", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const token = localStorage.getItem("accessToken");
      if (deleteConfirm.type === "scheme") {
        await api.delete(`/agriculture/schemes/${deleteConfirm.id}`, token);
        setData(prev => ({ ...prev, schemes: prev.schemes.filter(s => s.id !== deleteConfirm.id) }));
      } else {
        await api.delete(`/agriculture/advisories/${deleteConfirm.id}`, token);
        setData(prev => ({ ...prev, advisories: prev.advisories.filter(a => a.id !== deleteConfirm.id) }));
      }
      showToast("Deleted successfully!");
    } catch (e) {
      showToast(e.message || "Failed to delete item", "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Helper to parse Scheme JSON description
  const parseSchemeDesc = (descStr) => {
    try {
      if (descStr.startsWith("{")) {
        return JSON.parse(descStr);
      }
    } catch (e) {}
    return { description: descStr, eligibility: "All Farmers", required_docs: "Aadhaar Card", deadline: "N/A" };
  };

  // Helper to parse Advisory JSON message
  const parseAdvisoryMsg = (msgStr) => {
    try {
      if (msgStr.startsWith("{")) {
        return JSON.parse(msgStr);
      }
    } catch (e) {}
    return { advisory_message: msgStr, soil_type: "All Types", pest_warning: "None reported", watering_info: "Standard irrigation" };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
            <Sprout className="w-3 h-3" /> Krishi Center Management
          </div>
          <h1 className="text-4xl font-black text-slate-900">Agriculture Panel</h1>
          <p className="text-slate-500 font-medium mt-1">Manage agriculture subsidies, eligibility, and detailed seasonal crop instructions.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowSchemeModal(true)} className="gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/10">
            <Plus className="w-4 h-4" /> Add Detailed Scheme
          </Button>
          <Button onClick={() => setShowAdvisoryModal(true)} className="gap-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-600/10">
            <Plus className="w-4 h-4" /> Add Detailed Advisory
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Subsidies & Schemes */}
        <Card>
          <CardHeader title="Agriculture Subsidies & Schemes" subtitle="Active financial aid, machinery & seeds schemes" />
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-center py-6 text-slate-400">Loading schemes...</p>
            ) : data.schemes.length === 0 ? (
              <p className="text-center py-8 text-slate-400 font-medium">No active schemes found.</p>
            ) : (
              data.schemes.map((scheme) => {
                const parsed = parseSchemeDesc(scheme.description);
                return (
                  <div key={scheme.id} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:border-emerald-500/20 transition-all space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-100/50 text-emerald-600 rounded-2xl">
                          <Tractor className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-base text-slate-900 leading-tight">{scheme.title}</h4>
                          <span className="font-black text-emerald-600 text-xs">{scheme.benefit}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedItemDetails({ type: "scheme", item: { ...scheme, parsed } })}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 rounded-xl text-xs font-bold transition-all"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ type: "scheme", id: scheme.id })}
                          className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed bg-white/50 p-3 rounded-xl border border-slate-100/50">
                      {parsed.description}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Right Column: Seasonal Advisories */}
        <Card>
          <CardHeader title="Seasonal Advisory Logs" subtitle="Crop instructions, fertilizers & warnings" />
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-center py-6 text-slate-400">Loading advisories...</p>
            ) : data.advisories.length === 0 ? (
              <p className="text-center py-8 text-slate-400 font-medium">No seasonal advisories found.</p>
            ) : (
              data.advisories.map((adv) => {
                const parsed = parseAdvisoryMsg(adv.advisory_message);
                return (
                  <div key={adv.id} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-3 hover:border-teal-500/20 transition-all">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                          {adv.crop_name}
                        </span>
                        <span className="text-[10px] bg-slate-200/50 text-slate-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">{adv.month} Session</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedItemDetails({ type: "advisory", item: { ...adv, parsed } })}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-teal-600 rounded-xl text-xs font-bold transition-all"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ type: "advisory", id: adv.id })}
                          className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-semibold">
                      {parsed.advisory_message}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Scheme Modal */}
      {showSchemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center"><Tractor className="w-5 h-5 text-emerald-600" /></div>
                <h2 className="text-xl font-black text-slate-900">New Detailed Scheme</h2>
              </div>
              <button onClick={() => setShowSchemeModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleAddScheme} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">Scheme Title *</label>
                  <input type="text" required placeholder="e.g. PM Kisan Kalyan" value={schemeForm.title} onChange={e => setSchemeForm({...schemeForm, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">Benefit details *</label>
                  <input type="text" required placeholder="e.g. ₹2000 every quarter" value={schemeForm.benefit} onChange={e => setSchemeForm({...schemeForm, benefit: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">Apply Link (Optional)</label>
                  <input type="url" placeholder="e.g. https://pmkisan.gov.in" value={schemeForm.link} onChange={e => setSchemeForm({...schemeForm, link: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">Application Deadline</label>
                  <input type="text" placeholder="e.g. 31st August 2026" value={schemeForm.deadline} onChange={e => setSchemeForm({...schemeForm, deadline: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">Scheme Description *</label>
                <textarea rows="2" required placeholder="What this scheme does and its goals..." value={schemeForm.description} onChange={e => setSchemeForm({...schemeForm, description: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none"></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">Eligibility Criteria *</label>
                <textarea rows="2" required placeholder="e.g. Small & marginal farmers holding cultivable land below 2 hectares." value={schemeForm.eligibility} onChange={e => setSchemeForm({...schemeForm, eligibility: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none"></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">Required Documents *</label>
                <textarea rows="2" required placeholder="e.g. Aadhaar Card, Land Records (Khatauni), Bank Passbook" value={schemeForm.required_docs} onChange={e => setSchemeForm({...schemeForm, required_docs: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none"></textarea>
              </div>

              <Button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xl shadow-emerald-600/20 font-bold">Add Scheme</Button>
            </form>
          </div>
        </div>
      )}

      {/* Add Advisory Modal */}
      {showAdvisoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500/10 rounded-2xl flex items-center justify-center"><Sprout className="w-5 h-5 text-teal-600" /></div>
                <h2 className="text-xl font-black text-slate-900">New Detailed Advisory</h2>
              </div>
              <button onClick={() => setShowAdvisoryModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleAddAdvisory} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">Crop Name *</label>
                  <input type="text" required placeholder="e.g. Paddy, Wheat, Cotton" value={advisoryForm.crop_name} onChange={e => setAdvisoryForm({...advisoryForm, crop_name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">Session Month *</label>
                  <input type="text" required placeholder="e.g. June, November" value={advisoryForm.month} onChange={e => setAdvisoryForm({...advisoryForm, month: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">Soil Suitability</label>
                  <input type="text" placeholder="e.g. Clayey loam, Sandy loam" value={advisoryForm.soil_type} onChange={e => setAdvisoryForm({...advisoryForm, soil_type: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">Watering / Irrigation Routine</label>
                  <input type="text" placeholder="e.g. Moderate, keep flooded first 2 weeks" value={advisoryForm.watering_info} onChange={e => setAdvisoryForm({...advisoryForm, watering_info: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">Advisory Message *</label>
                <textarea rows="2" required placeholder="What should the farmer do now for this crop..." value={advisoryForm.advisory_message} onChange={e => setAdvisoryForm({...advisoryForm, advisory_message: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all resize-none"></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">Fertilizer Dose & Timing</label>
                <textarea rows="2" placeholder="e.g. 50 kg Urea per acre at sowing, NPK details..." value={advisoryForm.fertilizer_info} onChange={e => setAdvisoryForm({...advisoryForm, fertilizer_info: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all resize-none"></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">Pest & Disease Warnings</label>
                <textarea rows="2" placeholder="e.g. Stem borer warning. Apply Neem Oil if needed." value={advisoryForm.pest_warning} onChange={e => setAdvisoryForm({...advisoryForm, pest_warning: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all resize-none"></textarea>
              </div>

              <Button type="submit" className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xl shadow-teal-600/20 font-bold">Add Advisory</Button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Delete Item?</h2>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                  Are you sure you want to delete this agriculture {deleteConfirm.type === 'scheme' ? 'scheme' : 'advisory'}? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full pt-4">
                <Button variant="outline" className="flex-1 rounded-xl py-6 font-bold" onClick={() => setDeleteConfirm(null)}>
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

      {/* View Details Modal */}
      {selectedItemDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  {selectedItemDetails.type === "scheme" ? <Tractor className="w-5 h-5 text-emerald-600" /> : <Sprout className="w-5 h-5 text-teal-600" />}
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {selectedItemDetails.type === "scheme" ? selectedItemDetails.item.title : selectedItemDetails.item.crop_name} Details
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {selectedItemDetails.type === "scheme" ? "Subsidy Scheme" : `${selectedItemDetails.item.month} Sowing`}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedItemDetails(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {selectedItemDetails.type === "scheme" ? (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Benefit Amount</p>
                    <p className="text-sm font-bold text-emerald-600">{selectedItemDetails.item.benefit}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Description</p>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedItemDetails.item.parsed.description}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Eligibility Criteria</p>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedItemDetails.item.parsed.eligibility}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Required Documents</p>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedItemDetails.item.parsed.required_docs}</p>
                  </div>
                  {selectedItemDetails.item.parsed.deadline && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Deadline</p>
                      <p className="text-xs text-slate-700 font-bold">{selectedItemDetails.item.parsed.deadline}</p>
                    </div>
                  )}
                  {selectedItemDetails.item.link && (
                    <div className="pt-2">
                      <a href={selectedItemDetails.item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10">
                        <Link2 className="w-3.5 h-3.5" /> Apply Online
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Advisory Message</p>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedItemDetails.item.parsed.advisory_message}</p>
                  </div>
                  {selectedItemDetails.item.parsed.soil_type && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Suitable Soil Type</p>
                      <p className="text-xs text-slate-700 font-bold">{selectedItemDetails.item.parsed.soil_type}</p>
                    </div>
                  )}
                  {selectedItemDetails.item.fertilizer_info && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Fertilizer Dose & Timing</p>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedItemDetails.item.fertilizer_info}</p>
                    </div>
                  )}
                  {selectedItemDetails.item.parsed.pest_warning && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Pest & Disease Warnings</p>
                      <p className="text-xs text-rose-600 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100/50">{selectedItemDetails.item.parsed.pest_warning}</p>
                    </div>
                  )}
                  {selectedItemDetails.item.parsed.watering_info && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Watering / Irrigation Routine</p>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedItemDetails.item.parsed.watering_info}</p>
                    </div>
                  )}
                </>
              )}
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
