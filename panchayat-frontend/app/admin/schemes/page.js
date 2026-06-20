"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, MoreHorizontal, Edit, Trash, Users, X, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import { api } from "@/lib/api";

export default function SchemeManagement() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ 
    scheme_name: "", 
    description: "",
    eligibility: "",
    documents: "",
    benefits: "" 
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewScheme, setViewScheme] = useState(null);

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
  }, []);

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

      const payload = {
        scheme_name: formData.scheme_name,
        description: fullDescription.trim()
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
       scheme_name: scheme.name,
       description: baseDesc,
       eligibility: elig,
       documents: docs,
       benefits: bens
    });
    setEditMode(true);
    setEditId(scheme.id);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditMode(false);
    setEditId(null);
    setFormData({ scheme_name: "", description: "", eligibility: "", documents: "", benefits: "" });
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
          <Card className="w-full max-w-2xl p-6 relative shadow-2xl border-0 my-8">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">{editMode ? "Yojna Edit Karein" : "Nayi Yojna Jodein"}</h2>
              <p className="text-sm font-medium text-slate-500">Add detailed logical information for the {editMode ? "selected" : "new"} scheme</p>
            </div>
            <form onSubmit={handleAddOrEditScheme} className="space-y-4">
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

              <Button type="submit" className="w-full mt-6 py-6 rounded-xl text-lg font-bold shadow-xl shadow-primary/20" disabled={adding}>
                {adding ? "Saving Scheme..." : editMode ? "Update Scheme" : "Save Scheme to Database"}
              </Button>
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
        <Button onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4 mr-2" /> Nayi Yojna Jodein</Button>
      </div>

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
    </div>
  );
}
