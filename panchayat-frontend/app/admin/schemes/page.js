"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, MoreHorizontal, Edit, Trash, Users, X, Shield, ToggleLeft, ToggleRight, CheckCircle, XCircle, Clock, FileText, ArrowUp, ArrowDown } from "lucide-react";
import { api } from "@/lib/api";

export default function SchemeManagement() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("schemes"); // "schemes" or "applications"
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    scheme_name: "", 
    description: "",
    eligibility: "",
    documents: "",
    benefits: "",
    category: "General" 
  });
  const [formFields, setFormFields] = useState([]); // Dynamic custom fields

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewScheme, setViewScheme] = useState(null);
  const [viewingAppData, setViewingAppData] = useState(null);
  const [resultModal, setResultModal] = useState({ show: false, appId: null, remarks: "", fileUrl: "", uploading: false });
  const [rejectModal, setRejectModal] = useState({ show: false, appId: null, reason: "" });

  const fetchSchemes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/admin/schemes", token);
      setSchemes(data.schemes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setAppsLoading(true);
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/admin/scheme-applications", token);
      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleSendResult = async (e) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/admin/scheme-applications/${resultModal.appId}/ready`, {
        admin_remarks: resultModal.remarks,
        result_file: resultModal.fileUrl
      }, token);
      showToast("Result sent to citizen!");
      setResultModal({ show: false, appId: null, remarks: "", fileUrl: "", uploading: false });
      fetchApplications();
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  const handleRejectSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/admin/scheme-applications/${rejectModal.appId}/reject`, {
        rejection_reason: rejectModal.reason
      }, token);
      showToast("Application rejected with reason.");
      setRejectModal({ show: false, appId: null, reason: "" });
      fetchApplications();
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  const handleStartProgress = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/admin/scheme-applications/${id}/progress`, {}, token);
      showToast("Kaam shuru ho gaya hai!");
      fetchApplications();
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleAddOrEditScheme = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      let fullDescription = formData.description;
      if (formData.eligibility) fullDescription += `\n\n📌 Eligibility:\n${formData.eligibility}`;
      if (formData.documents) fullDescription += `\n\n📄 Required Documents:\n${formData.documents}`;
      if (formData.benefits) fullDescription += `\n\n💰 Benefits:\n${formData.benefits}`;

      let icon = "BookOpen";
      let color_theme = "bg-slate-100 text-slate-700";
      
      if (formData.category === "Agriculture") {
         icon = "Tractor"; color_theme = "bg-emerald-100 text-emerald-700";
      } else if (formData.category === "Education") {
         icon = "GraduationCap"; color_theme = "bg-purple-100 text-purple-700";
      } else if (formData.category === "Housing") {
         icon = "Home"; color_theme = "bg-blue-100 text-blue-700";
      } else if (formData.category === "Finance") {
         icon = "IndianRupee"; color_theme = "bg-amber-100 text-amber-700";
      }

      const payload = {
        scheme_name: formData.scheme_name,
        description: fullDescription.trim(),
        benefit: formData.benefits,
        category: formData.category,
        icon,
        color_theme,
        form_fields: formFields
      };

      if (editMode) {
        await api.put(`/admin/schemes/${editId}`, payload, token);
        showToast("Scheme updated successfully!");
      } else {
        await api.post("/admin/schemes", payload, token);
        showToast("Scheme added successfully!");
      }
      
      closeModal();
      fetchSchemes();
    } catch (err) {
      showToast("Error: " + err.message, "error");
    } finally {
      setAdding(false);
    }
  };

  const openEditModal = (scheme) => {
    // Basic extraction attempt if formatted
    let baseDesc = scheme.description;
    let elig = "", docs = "", bens = "";
    
    if (baseDesc.includes("📌 Eligibility:")) {
       const parts = baseDesc.split("📌 Eligibility:\n");
       baseDesc = parts[0].trim();
       if (parts[1]) {
          const docsParts = parts[1].split("📄 Required Documents:\n");
          elig = docsParts[0].trim();
          if (docsParts[1]) {
             const bensParts = docsParts[1].split("💰 Benefits:\n");
             docs = bensParts[0].trim();
             bens = bensParts[1] ? bensParts[1].trim() : "";
          }
       }
    }

    setFormData({
       scheme_name: scheme.scheme_name || scheme.name,
       description: baseDesc,
       eligibility: elig,
       documents: docs,
       benefits: bens,
       category: scheme.category || "General"
    });
    setFormFields(scheme.form_fields || []);
    setEditMode(true);
    setEditId(scheme.id);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditMode(false);
    setEditId(null);
    setFormData({ scheme_name: "", description: "", eligibility: "", documents: "", benefits: "", category: "General" });
    setFormFields([]);
  };

  const handleToggle = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/admin/schemes/${id}/toggle`, {}, token);
      showToast("Scheme status toggled.");
      fetchSchemes();
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`/admin/schemes/${id}`, token);
      showToast("Scheme deleted.");
      fetchSchemes();
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  // Safe check for schemes array before filtering
  const filteredSchemes = (schemes || []).filter(s =>
    (s.name || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  const activeCount = schemes.filter(s => s.is_active).length;
  const pausedCount = schemes.filter(s => !s.is_active).length;

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[60] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
           {toast.type === "success" ? <Shield className="w-5 h-5" /> : <X className="w-5 h-5" />}
           <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      {/* Add Scheme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl relative shadow-2xl border-0 bg-white max-h-[90vh] flex flex-col overflow-hidden rounded-2xl">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 pb-4 border-b border-slate-100 shrink-0 pr-12">
              <h2 className="text-2xl font-black text-slate-900">{editMode ? "Yojna Edit Karein" : "Nayi Yojna Jodein"}</h2>
              <p className="text-sm font-medium text-slate-500">Add detailed logical information for the {editMode ? "selected" : "new"} scheme</p>
            </div>
            <form onSubmit={handleAddOrEditScheme} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 pr-4 scrollbar-thin min-h-0">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Scheme Name *</label>
                    <input required type="text" className="w-full mt-1 p-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none" value={formData.scheme_name} onChange={e => setFormData({...formData, scheme_name: e.target.value})} placeholder="e.g. PM Awas Yojana" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Main Description *</label>
                    <textarea required rows={2} className="w-full mt-1 p-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="What is this scheme about?" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category *</label>
                    <select required className="w-full mt-1 p-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option value="General">General (Default)</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Education">Education</option>
                      <option value="Housing">Housing</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Eligibility Criteria</label>
                    <textarea rows={3} className="w-full mt-1 p-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none resize-none" value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} placeholder="Who can apply? (e.g. Age > 18)" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Required Documents</label>
                    <textarea rows={3} className="w-full mt-1 p-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none resize-none" value={formData.documents} onChange={e => setFormData({...formData, documents: e.target.value})} placeholder="Aadhaar, Ration Card, etc." />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Scheme Benefits</label>
                  <textarea rows={2} className="w-full mt-1 p-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none resize-none" value={formData.benefits} onChange={e => setFormData({...formData, benefits: e.target.value})} placeholder="Financial aid, subsidies, etc." />
                </div>

                {/* Form Builder Section */}
                <div className="border-t border-slate-100 pt-4 mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Custom Application Form Fields</h4>
                      <p className="text-xs text-slate-500 font-medium">Define custom inputs citizens must fill when applying</p>
                    </div>
                    <Button type="button" variant="outline" className="text-xs py-1.5 h-auto rounded-lg border-primary text-primary hover:bg-primary/5 flex items-center gap-1" onClick={() => {
                      setFormFields([...formFields, { label: "", type: "text", required: true, placeholder: "" }]);
                    }}>
                      <Plus className="w-3.5 h-3.5" /> Add Field
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {formFields.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-semibold">
                        No custom fields. Citizens will apply with a simple click.
                      </div>
                    ) : (
                      formFields.map((field, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 relative group">
                          {/* Field Label Input */}
                          <div className="flex-1 w-full">
                            <input
                              type="text"
                              required
                              placeholder={field.type === 'note' ? "Instructions or note content..." : "Field Label (e.g. Aadhaar Number)"}
                              className="w-full p-2 bg-white border border-slate-200 focus:border-primary/20 rounded-lg text-xs font-semibold outline-none"
                              value={field.label}
                              onChange={(e) => {
                                const updated = [...formFields];
                                updated[idx].label = e.target.value;
                                setFormFields(updated);
                              }}
                            />
                          </div>

                          {/* Field Type Select */}
                          <div className="w-full md:w-36">
                            <select
                              className="w-full p-2 bg-white border border-slate-200 focus:border-primary/20 rounded-lg text-xs font-semibold outline-none"
                              value={field.type}
                              onChange={(e) => {
                                const updated = [...formFields];
                                updated[idx].type = e.target.value;
                                if (e.target.value === 'note') {
                                  updated[idx].required = false;
                                }
                                setFormFields(updated);
                              }}
                            >
                              <option value="text">Text Input</option>
                              <option value="number">Number Input</option>
                              <option value="file">File Upload</option>
                              <option value="note">Info Note (Read-Only)</option>
                            </select>
                          </div>

                          {/* Required Checkbox (Hide if field type is note) */}
                          {field.type !== 'note' && (
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600 select-none">
                              <input
                                type="checkbox"
                                className="rounded border-slate-300 text-primary focus:ring-primary/20 w-3.5 h-3.5"
                                checked={field.required}
                                onChange={(e) => {
                                  const updated = [...formFields];
                                  updated[idx].required = e.target.checked;
                                  setFormFields(updated);
                                }}
                              />
                              Required
                            </label>
                          )}

                          {/* Reorder and Delete Controls */}
                          <div className="flex gap-1 items-center justify-end w-full md:w-auto">
                            <button
                              type="button"
                              disabled={idx === 0}
                              className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                              onClick={() => {
                                const updated = [...formFields];
                                const temp = updated[idx];
                                updated[idx] = updated[idx - 1];
                                updated[idx - 1] = temp;
                                setFormFields(updated);
                              }}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === formFields.length - 1}
                              className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                              onClick={() => {
                                const updated = [...formFields];
                                const temp = updated[idx];
                                updated[idx] = updated[idx + 1];
                                updated[idx + 1] = temp;
                                setFormFields(updated);
                              }}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"
                              onClick={() => {
                                setFormFields(formFields.filter((_, i) => i !== idx));
                              }}
                            >
                              <Trash className="w-3.5 h-3.5 text-rose-500" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50/50">
                <Button type="submit" className="w-full py-5 rounded-xl text-md font-bold shadow-xl shadow-primary/20" disabled={adding}>
                  {adding ? "Saving Scheme..." : editMode ? "Update Scheme" : "Save Scheme to Database"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* View Scheme Modal */}
      {viewScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 relative shadow-2xl border-0 my-8">
            <button onClick={() => setViewScheme(null)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-6 border-b border-slate-100 pb-4">
              <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest mb-3 inline-block ${
                 viewScheme.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}>
                 {viewScheme.status}
              </span>
              <h2 className="text-2xl font-black text-slate-900">{viewScheme.name}</h2>
              <p className="text-xs font-bold text-slate-400 mt-2">Added on: {viewScheme.created_at}</p>
            </div>
            <div className="space-y-6 text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
              {viewScheme.description}
            </div>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scheme Management</h1>
          <p className="text-slate-500">Add or manage government schemes for villagers</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-lg border border-border">
            <button onClick={() => setActiveTab("schemes")} className={`px-4 py-1.5 text-sm font-medium rounded-md shadow-sm transition-colors ${activeTab === 'schemes' ? 'bg-primary text-white' : 'text-slate-600 hover:text-primary'}`}>Schemes</button>
            <button onClick={() => setActiveTab("applications")} className={`px-4 py-1.5 text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2 ${activeTab === 'applications' ? 'bg-primary text-white' : 'text-slate-600 hover:text-primary'}`}>
              Applications
              {applications.filter(a => a.status === 'Pending').length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'applications' ? 'bg-white text-primary' : 'bg-rose-500 text-white'}`}>{applications.filter(a => a.status === 'Pending').length}</span>
              )}
            </button>
          </div>
          {activeTab === "schemes" && <Button onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4 mr-2" /> Nayi Yojna Jodein</Button>}
        </div>
      </div>

      {activeTab === "schemes" && (
      <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-6">
               <p className="text-sm font-medium text-primary mb-1">Total Schemes</p>
               <h3 className="text-3xl font-bold text-primary">{schemes.length}</h3>
               <div className="flex items-center gap-1 text-xs text-primary/60 mt-4">
                  <Users className="w-3.5 h-3.5" /> All registered schemes
               </div>
            </CardContent>
         </Card>
         <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-6">
               <p className="text-sm font-medium text-emerald-700 mb-1">Active Schemes</p>
               <h3 className="text-3xl font-bold text-emerald-700">{activeCount}</h3>
               <div className="flex items-center gap-1 text-xs text-emerald-600 mt-4">
                  Currently running
               </div>
            </CardContent>
         </Card>
         <Card className="bg-rose-50 border-rose-100">
            <CardContent className="p-6">
               <p className="text-sm font-medium text-rose-700 mb-1">Paused Schemes</p>
               <h3 className="text-3xl font-bold text-rose-700">{pausedCount}</h3>
               <div className="flex items-center gap-1 text-xs text-rose-600 mt-4">
                  Temporarily inactive
               </div>
            </CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 py-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none" placeholder="Search schemes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-slate-500 font-medium">Loading schemes...</div>
          ) : filteredSchemes.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">No schemes found.</div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredSchemes.map((scheme) => (
              <Card key={scheme.id} className="hover:shadow-xl transition-all group overflow-hidden border-slate-200/60 flex flex-col relative">
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                    scheme.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}>
                    {scheme.status}
                  </span>
                </div>

                <CardContent className="p-6 flex-1 flex flex-col pt-10">
                  <h3 className="font-black text-xl text-slate-900 mb-2 truncate pr-16" title={scheme.name}>
                    {scheme.name}
                  </h3>
                  
                  <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-3 flex-1">
                    {scheme.description.replace(/\n/g, ' ')}
                  </p>

                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400">Added: {scheme.created_at}</span>
                  </div>
                </CardContent>

                {/* Actions Footer */}
                <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-t border-slate-100">
                   <div className="flex gap-2">
                      <button onClick={() => setViewScheme(scheme)} className="flex items-center justify-center p-2 bg-white border border-slate-200 hover:border-primary hover:text-primary rounded-lg transition-colors shadow-sm" title="View Details">
                         <Search className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEditModal(scheme)} className="flex items-center justify-center p-2 bg-white border border-slate-200 hover:border-amber-500 hover:text-amber-500 rounded-lg transition-colors shadow-sm" title="Edit Scheme">
                         <Edit className="w-4 h-4" />
                      </button>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => handleToggle(scheme.id)} className="flex items-center justify-center p-2 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-500 rounded-lg transition-colors shadow-sm" title="Toggle Active/Paused">
                         {scheme.is_active ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                      </button>
                      <button onClick={() => handleDelete(scheme.id)} className="flex items-center justify-center p-2 bg-white border border-slate-200 hover:border-rose-500 hover:text-rose-500 rounded-lg transition-colors shadow-sm" title="Delete Scheme">
                         <Trash className="w-4 h-4 text-rose-500" />
                      </button>
                   </div>
                </div>
              </Card>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
      </>
      )}

      {/* Applications Tab */}
      {activeTab === "applications" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 py-4">
            <h2 className="text-lg font-bold text-slate-900">Scheme Applications</h2>
            <div className="flex gap-2 text-xs font-bold">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700">{applications.filter(a => a.status === 'Pending').length} Pending</span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">{applications.filter(a => a.status === 'Approved').length} Approved</span>
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700">{applications.filter(a => a.status === 'Rejected').length} Rejected</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {appsLoading ? (
              <div className="text-center py-12 text-slate-500 font-medium">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-medium">Abhi tak koi application nahi aayi hai.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-100">
                      <th className="text-left px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-widest">Citizen</th>
                      <th className="text-left px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-widest">Scheme</th>
                      <th className="text-left px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-widest">Date</th>
                      <th className="text-left px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-widest">Status</th>
                      <th className="text-center px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{app.citizen_name}</div>
                          <div className="text-xs text-slate-400">{app.citizen_mobile} &bull; {app.citizen_email}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{app.scheme_name}</td>
                        <td className="px-6 py-4 text-slate-500">{app.submitted_at}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                            app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                            app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                            app.status === 'Ready' ? 'bg-indigo-100 text-indigo-700' :
                            app.status === 'In Progress' ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {app.status === 'Ready' ? 'Ready (Waiting for Citizen)' : app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            {app.form_data && Object.keys(app.form_data).length > 0 && (
                              <button onClick={() => setViewingAppData(app)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors" title="View Citizen Form Data">
                                <FileText className="w-3.5 h-3.5" /> View Details
                              </button>
                            )}
                            {app.status === 'Pending' && (
                              <>
                                <button onClick={() => handleStartProgress(app.id)} className="flex items-center gap-1 px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold transition-colors">
                                  <Clock className="w-3.5 h-3.5" /> Start Work
                                </button>
                                <button onClick={() => setResultModal({ show: true, appId: app.id, remarks: "", fileUrl: "", uploading: false })} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors">
                                  <CheckCircle className="w-3.5 h-3.5" /> Send Result
                                </button>
                                <button onClick={() => setRejectModal({ show: true, appId: app.id, reason: "" })} className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors">
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            )}
                            {app.status === 'In Progress' && (
                              <>
                                <button onClick={() => setResultModal({ show: true, appId: app.id, remarks: "", fileUrl: "", uploading: false })} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors">
                                  <CheckCircle className="w-3.5 h-3.5" /> Send Result
                                </button>
                                <button onClick={() => setRejectModal({ show: true, appId: app.id, reason: "" })} className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors">
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            )}
                            {app.status !== 'Pending' && app.status !== 'In Progress' && (!app.form_data || Object.keys(app.form_data).length === 0) && (
                              <div className="text-center text-xs text-slate-400 font-medium">&mdash;</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Application Data Modal */}
      {viewingAppData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-lg relative shadow-2xl border-0 bg-white max-h-[90vh] flex flex-col overflow-hidden rounded-2xl">
            <button onClick={() => setViewingAppData(null)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 pb-4 border-b border-slate-100 shrink-0 pr-12">
              <h2 className="text-xl font-black text-slate-900 font-sans">Application Details</h2>
              <p className="text-sm font-medium text-slate-500">{viewingAppData.citizen_name} &bull; {viewingAppData.scheme_name}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-4 pr-4 scrollbar-thin min-h-0">
              {viewingAppData.form_data && Object.keys(viewingAppData.form_data).length > 0 ? (
                Object.entries(viewingAppData.form_data).map(([label, val]) => {
                  const isUrl = typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'));
                  const isImage = isUrl && (val.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || val.includes('/image/upload/'));
                  return (
                    <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-800 break-all pl-1">
                        {isUrl ? (
                          <div className="space-y-2 mt-1">
                            {isImage ? (
                              <div className="relative group max-w-full md:max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-white p-1">
                                <img src={val} alt={label} className="max-h-40 object-contain mx-auto w-full" />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100 w-fit">
                                <FileText className="w-4 h-4 text-primary" />
                                <span>PDF / Document File</span>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <a href={val} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-all">
                                View File &rarr;
                              </a>
                              <a href={val} download={label} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-all">
                                Download File
                              </a>
                            </div>
                          </div>
                        ) : (
                          val || <span className="text-slate-400 italic">Not provided</span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-400 font-medium text-sm">
                  No additional form data submitted.
                </div>
              )}

              {/* Admin Remarks & Output */}
              {(viewingAppData.admin_remarks || viewingAppData.result_file) && (
                <div className="border-t border-slate-100 pt-4">
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-3 pl-1 ${
                    viewingAppData.status === 'Rejected' ? 'text-rose-500' : 'text-indigo-500'
                  }`}>
                    {viewingAppData.status === 'Rejected' ? 'Rejection Details' : 'Sent Response & Certificate'}
                  </h3>
                  <div className={`p-4 rounded-xl border ${
                    viewingAppData.status === 'Rejected' 
                      ? 'bg-rose-50/50 border-rose-100/60' 
                      : 'bg-indigo-50/50 border-indigo-100/60'
                  } space-y-3`}>
                    {viewingAppData.admin_remarks && (
                      <div>
                        <div className={`text-[10px] font-black uppercase tracking-widest ${
                          viewingAppData.status === 'Rejected' ? 'text-rose-400' : 'text-indigo-400'
                        }`}>
                          {viewingAppData.status === 'Rejected' ? 'Reason for Rejection' : 'Remarks / Message'}
                        </div>
                        <p className="text-sm font-semibold text-slate-800 mt-1 leading-relaxed whitespace-pre-wrap">{viewingAppData.admin_remarks}</p>
                      </div>
                    )}
                    
                    {viewingAppData.result_file && (
                      <div>
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Attached Document / Certificate</div>
                        {(() => {
                           const val = viewingAppData.result_file;
                           const isImage = val.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || val.includes('/image/upload/');
                           return (
                             <div className="space-y-2">
                               {isImage ? (
                                 <div className="max-w-full md:max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-white p-1">
                                   <img src={val} alt="Result Document" className="max-h-36 object-contain mx-auto w-full" />
                                 </div>
                               ) : (
                                 <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-white p-2 rounded-lg border border-indigo-100 w-fit">
                                   <FileText className="w-4 h-4 text-indigo-600" />
                                   <span>PDF / Certificate Document</span>
                                 </div>
                               )}
                               <div className="flex gap-2">
                                 <a href={val} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold transition-all">
                                   View Certificate
                                 </a>
                                 <a href={val} download="Certificate" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-all">
                                   Download
                                 </a>
                               </div>
                             </div>
                           );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Send Result Modal */}
      {resultModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-lg relative shadow-2xl border-0 bg-white max-h-[90vh] flex flex-col overflow-hidden rounded-2xl">
            <button onClick={() => setResultModal({ show: false, appId: null, remarks: "", fileUrl: "", uploading: false })} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 pb-4 border-b border-slate-100 shrink-0 pr-12">
              <h2 className="text-xl font-black text-slate-900 font-sans">Send Scheme Result / Certificate</h2>
              <p className="text-sm font-medium text-slate-500">Provide the final output to the citizen for review</p>
            </div>
            
            <form onSubmit={handleSendResult} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 pr-4 scrollbar-thin min-h-0">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Admin Remarks *</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full mt-1 p-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none resize-none"
                    placeholder="Enter message for citizen (e.g. Aapka certificate issue ho gya hai)"
                    value={resultModal.remarks}
                    onChange={(e) => setResultModal({ ...resultModal, remarks: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Attach Certificate / Document</label>
                  <div className="mt-1 flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      disabled={resultModal.uploading}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setResultModal(prev => ({ ...prev, uploading: true }));
                        const fd = new FormData();
                        fd.append('file', file);
                        try {
                          const token = localStorage.getItem("accessToken");
                          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
                          const res = await fetch(`${apiUrl}/upload`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: fd,
                          });
                          if (!res.ok) throw new Error("Upload failed");
                          const uploadData = await res.json();
                          setResultModal(prev => ({ ...prev, fileUrl: uploadData.secure_url, uploading: false }));
                          showToast("File uploaded successfully!");
                        } catch (err) {
                          console.error(err);
                          showToast("Failed to upload document.", "error");
                          setResultModal(prev => ({ ...prev, uploading: false }));
                        }
                      }}
                    />
                    {resultModal.uploading && (
                      <span className="text-xs text-primary font-bold animate-pulse">Uploading file...</span>
                    )}
                    {resultModal.fileUrl && (
                      <div className="text-xs text-emerald-600 font-bold">
                        ✓ File attached. <a href={resultModal.fileUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">Preview</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50/50">
                <Button type="button" variant="outline" className="w-1/2 py-5 rounded-xl text-sm font-bold border-slate-200" onClick={() => setResultModal({ show: false, appId: null, remarks: "", fileUrl: "", uploading: false })}>
                  Cancel
                </Button>
                <Button type="submit" disabled={resultModal.uploading} className="w-1/2 py-5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25">
                  Send to Citizen
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-md relative shadow-2xl border-0 bg-white max-h-[90vh] flex flex-col overflow-hidden rounded-2xl">
            <button onClick={() => setRejectModal({ show: false, appId: null, reason: "" })} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 pb-4 border-b border-slate-100 shrink-0 pr-12">
              <h2 className="text-xl font-black text-slate-900 font-sans">Reject Application</h2>
              <p className="text-sm font-medium text-slate-500">Provide a reason for rejecting this application</p>
            </div>
            
            <form onSubmit={handleRejectSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 pr-4 scrollbar-thin min-h-0">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Rejection Reason *</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full mt-1 p-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none resize-none"
                    placeholder="Enter reason (e.g. Document unclear, ineligible criteria)"
                    value={rejectModal.reason}
                    onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50/50">
                <Button type="button" variant="outline" className="w-1/2 py-5 rounded-xl text-sm font-bold border-slate-200" onClick={() => setRejectModal({ show: false, appId: null, reason: "" })}>
                  Cancel
                </Button>
                <Button type="submit" className="w-1/2 py-5 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25">
                  Confirm Reject
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
