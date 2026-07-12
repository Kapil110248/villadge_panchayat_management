"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Bell, Calendar, Trash, Edit2, Globe, X, Shield, Search } from "lucide-react";
import { api } from "@/lib/api";

export default function NoticeManagement() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [formData, setFormData] = useState({ 
    title: "", 
    content: "", 
    target_audience: "All Villagers",
    action_required: "",
    valid_until: "",
    notice_type: "update" 
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewNotice, setViewNotice] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/admin/notices", token);
      setNotices(data.notices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleAddOrEditNotice = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      let fullContent = formData.content;
      if (formData.target_audience && formData.target_audience !== "All Villagers") fullContent += `\n\n👥 Target Audience: ${formData.target_audience}`;
      if (formData.action_required) fullContent += `\n\n⚡ Action Required: ${formData.action_required}`;
      if (formData.valid_until) fullContent += `\n\n📅 Valid Until: ${formData.valid_until}`;

      const payload = {
        title: formData.title,
        content: fullContent.trim(),
        notice_type: formData.notice_type
      };

      if (editMode) {
        await api.put(`/admin/notices/${editId}`, payload, token);
        showToast("Notice updated successfully!");
      } else {
        await api.post("/admin/notices", payload, token);
        showToast("Notice published successfully!");
      }

      closeModal();
      fetchNotices();
    } catch (err) {
      showToast("Error: " + err.message, "error");
    } finally {
      setAdding(false);
    }
  };

  const openEditModal = (notice) => {
    let baseContent = notice.content;
    let aud = "All Villagers", act = "", val = "";
    
    if (baseContent.includes("👥 Target Audience:")) {
       const parts = baseContent.split("👥 Target Audience: ");
       baseContent = parts[0].trim();
       const lines = parts[1].split("\n");
       aud = lines[0].trim();
       
       if (notice.content.includes("⚡ Action Required:")) {
          act = notice.content.split("⚡ Action Required: ")[1].split("\n")[0].trim();
       }
       if (notice.content.includes("📅 Valid Until:")) {
          val = notice.content.split("📅 Valid Until: ")[1].split("\n")[0].trim();
       }
    } else {
       // Also check without target audience
       if (baseContent.includes("⚡ Action Required:")) {
          const parts = baseContent.split("⚡ Action Required: ");
          baseContent = parts[0].trim();
          act = parts[1].split("\n")[0].trim();
       }
       if (notice.content.includes("📅 Valid Until:")) {
          const parts = notice.content.split("📅 Valid Until: ");
          baseContent = baseContent.replace("📅 Valid Until: " + parts[1].split("\n")[0], "").trim();
          val = parts[1].split("\n")[0].trim();
       }
    }

    setFormData({
       title: notice.title,
       content: baseContent,
       target_audience: aud,
       action_required: act,
       valid_until: val,
       notice_type: notice.notice_type
    });
    setEditMode(true);
    setEditId(notice.id);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditMode(false);
    setEditId(null);
    setFormData({ title: "", content: "", target_audience: "All Villagers", action_required: "", valid_until: "", notice_type: "update" });
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`/admin/notices/${deleteConfirmId}`, token);
      showToast("Notice deleted.");
      fetchNotices();
    } catch (err) {
      showToast("Error deleting: " + err.message, "error");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[60] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
           {toast.type === "success" ? <Shield className="w-5 h-5" /> : <X className="w-5 h-5" />}
           <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm p-6 relative shadow-2xl border-0 bg-white rounded-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Trash className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Delete Notice?</h2>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete this notice? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3 w-full">
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1 bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700" 
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white border-0" 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl p-6 relative shadow-2xl border-0 max-h-[90vh] flex flex-col">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-6 shrink-0 pr-8">
              <h2 className="text-2xl font-black text-slate-900">{editMode ? "Notice Update Karein" : "Nayi Notice Banayein"}</h2>
              <p className="text-sm font-medium text-slate-500">Village ke liye ek detailed aur logical notice publish karein</p>
            </div>
            <div className="overflow-y-auto -mx-2 px-2 pb-2">
              <form onSubmit={handleAddOrEditNotice} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Title *</label>
                  <input required type="text" className="w-full mt-1 p-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Gram Sabha Meeting" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Main Message *</label>
                  <textarea required rows={3} className="w-full mt-1 p-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none resize-none" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Notice ka main content yahan likhein..." />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Audience</label>
                  <select className="w-full mt-1 p-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none" value={formData.target_audience} onChange={e => setFormData({...formData, target_audience: e.target.value})}>
                    <option value="All Villagers">All Villagers</option>
                    <option value="Farmers">Farmers</option>
                    <option value="Senior Citizens">Senior Citizens</option>
                    <option value="Students">Students</option>
                    <option value="Panchayat Staff">Panchayat Staff</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Notice Category</label>
                  <select className="w-full mt-1 p-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none" value={formData.notice_type} onChange={e => setFormData({...formData, notice_type: e.target.value})}>
                    <option value="update">General Update</option>
                    <option value="important">Important / Urgent</option>
                    <option value="success">Good News / Success</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Action Required (Optional)</label>
                  <input type="text" className="w-full mt-1 p-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none" value={formData.action_required} onChange={e => setFormData({...formData, action_required: e.target.value})} placeholder="e.g. Bring Aadhaar Card" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Valid Until (Optional)</label>
                  <input type="date" className="w-full mt-1 p-3.5 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none" value={formData.valid_until} onChange={e => setFormData({...formData, valid_until: e.target.value})} />
                </div>
              </div>

              <Button type="submit" className="w-full mt-6 py-6 rounded-xl text-lg font-bold shadow-xl shadow-primary/20" disabled={adding}>
                {adding ? "Publishing to Database..." : "Save Broadcast Notice"}
              </Button>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* View Notice Modal */}
      {viewNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl p-6 relative shadow-2xl border-0 max-h-[90vh] flex flex-col">
            <button onClick={() => setViewNotice(null)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-6 border-b border-slate-100 pb-4 shrink-0 pr-8">
              <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest mb-3 inline-block ${
                 viewNotice.notice_type === 'important' ? 'bg-rose-100 text-rose-700' : viewNotice.notice_type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
              }`}>
                 {viewNotice.notice_type}
              </span>
              <h2 className="text-2xl font-black text-slate-900">{viewNotice.title}</h2>
              <p className="text-xs font-bold text-slate-400 mt-2">Published by {viewNotice.created_by} on {viewNotice.created_at}</p>
            </div>
            <div className="space-y-6 text-slate-700 whitespace-pre-wrap leading-relaxed text-sm overflow-y-auto -mx-2 px-2 pb-2">
              {viewNotice.content}
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notice Management</h1>
          <p className="text-sm text-slate-500">Create and broadcast village-wide announcements</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto shadow-xl shadow-slate-900/20"><Plus className="w-4 h-4 mr-2" /> Nayi Notice Banayein</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading notices...</div>
      ) : notices.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-medium">No notices found. Create a new notice to get started.</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notices.map((notice) => (
          <Card key={notice.id} className="hover:shadow-xl transition-all group overflow-hidden border-slate-200/60 flex flex-col relative">
             <div className="absolute top-4 right-4 flex items-center gap-2">
               <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                 notice.notice_type === 'important' ? 'bg-rose-100 text-rose-700' : notice.notice_type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
               }`}>
                 {notice.notice_type}
               </span>
               <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                 notice.is_published ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
               }`}>
                 {notice.is_published ? "Published" : "Draft"}
               </span>
             </div>

             <CardContent className="p-6 flex-1 flex flex-col pt-12">
               <h3 className="font-black text-xl text-slate-900 mb-2 truncate pr-16" title={notice.title}>
                 {notice.title}
               </h3>
               
               <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-3 flex-1">
                 {notice.content.replace(/\n/g, ' ')}
               </p>

               <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-100">
                 <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {notice.created_at}
                 </span>
                 <span className="text-[10px] font-bold uppercase text-slate-400 truncate">By: {notice.created_by}</span>
               </div>
             </CardContent>

             {/* Actions Footer */}
             <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-t border-slate-100">
                <div className="flex gap-2">
                   <button onClick={() => setViewNotice(notice)} className="flex items-center justify-center p-2 bg-white border border-slate-200 hover:border-primary hover:text-primary rounded-lg transition-colors shadow-sm" title="View Details">
                      <Search className="w-4 h-4" />
                   </button>
                   <button onClick={() => openEditModal(notice)} className="flex items-center justify-center p-2 bg-white border border-slate-200 hover:border-amber-500 hover:text-amber-500 rounded-lg transition-colors shadow-sm" title="Edit Notice">
                      <Edit2 className="w-4 h-4" />
                   </button>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => handleDelete(notice.id)} className="flex items-center justify-center p-2 bg-white border border-slate-200 hover:border-rose-500 hover:text-rose-500 rounded-lg transition-colors shadow-sm" title="Delete Notice">
                      <Trash className="w-4 h-4 text-rose-500" />
                   </button>
                </div>
             </div>
          </Card>
        ))}
      </div>
      )}

      <Card className="bg-primary/5 border-primary/20">
         <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-primary">Need to send an SMS Alert?</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
               Important notices can be sent directly to villagers' mobile phones via SMS integration.
            </p>
            <Button variant="outline" className="border-primary/20 text-primary">Setup SMS Gateway</Button>
         </CardContent>
      </Card>
    </div>
  );
}
