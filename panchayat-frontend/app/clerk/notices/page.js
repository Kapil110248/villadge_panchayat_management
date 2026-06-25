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

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/clerk/notices", token);
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
        await api.put(`/clerk/notices/${editId}`, payload, token);
        showToast("Notice updated successfully!");
      } else {
        await api.post("/clerk/notices", payload, token);
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

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`/clerk/notices/${id}`, token);
      showToast("Notice deleted.");
      fetchNotices();
    } catch (err) {
      showToast("Error deleting: " + err.message, "error");
    }
  };

  return (
    <div className="space-y-10 relative pb-12">
      {/* Background Abstract */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[60] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
           {toast.type === "success" ? <Shield className="w-5 h-5" /> : <X className="w-5 h-5" />}
           <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 relative shadow-2xl border-0 my-8">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">Nayi Notice Banayein</h2>
              <p className="text-sm font-medium text-slate-500">Village ke liye ek detailed aur logical notice publish karein</p>
            </div>
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
          </Card>
        </div>
      )}

      {/* View Notice Modal */}
      {viewNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 relative shadow-2xl border-0 my-8">
            <button onClick={() => setViewNotice(null)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-6 border-b border-slate-100 pb-4">
              <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest mb-3 inline-block ${
                 viewNotice.notice_type === 'important' ? 'bg-rose-100 text-rose-700' : viewNotice.notice_type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
              }`}>
                 {viewNotice.notice_type}
              </span>
              <h2 className="text-2xl font-black text-slate-900">{viewNotice.title}</h2>
              <p className="text-xs font-bold text-slate-400 mt-2">Published by {viewNotice.created_by} on {viewNotice.created_at}</p>
            </div>
            <div className="space-y-6 text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
              {viewNotice.content}
            </div>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-end relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
            <Bell className="w-3 h-3" /> Broadcast Hub
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Notice Management</h1>
          <p className="text-slate-500 font-medium mt-2 max-w-md">Create and broadcast village-wide announcements instantly to all citizens.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl px-6 py-6 h-auto font-bold">
          <Plus className="w-5 h-5 mr-2" /> Nayi Notice Banayein
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading notices...</div>
      ) : notices.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-medium">No notices found. Create a new notice to get started.</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 rounded-[2rem] hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-500 hover:-translate-y-1 group overflow-hidden flex flex-col relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100 to-transparent rounded-bl-full -z-10 opacity-50" />
             
             <div className="p-6 pb-2 flex items-center justify-between">
               <span className={`text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest flex items-center gap-1.5 ${
                 notice.notice_type === 'important' ? 'bg-rose-50 text-rose-600 border border-rose-100' : notice.notice_type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
               }`}>
                 <span className={`w-1.5 h-1.5 rounded-full ${notice.notice_type === 'important' ? 'bg-rose-500' : notice.notice_type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                 {notice.notice_type}
               </span>
               <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button onClick={() => setViewNotice(notice)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 hover:border-sky-200 text-slate-400 hover:text-sky-600 rounded-full transition-colors shadow-sm" title="View Details">
                     <Search className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => openEditModal(notice)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 hover:border-amber-200 text-slate-400 hover:text-amber-500 rounded-full transition-colors shadow-sm" title="Edit Notice">
                     <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(notice.id)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 hover:border-rose-200 text-slate-400 hover:text-rose-500 rounded-full transition-colors shadow-sm" title="Delete Notice">
                     <Trash className="w-3.5 h-3.5" />
                  </button>
               </div>
             </div>

             <div className="p-6 flex-1 flex flex-col pt-4">
               <h3 className="font-black text-xl text-slate-900 mb-3 leading-tight group-hover:text-primary transition-colors" title={notice.title}>
                 {notice.title}
               </h3>
               
               <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-3 leading-relaxed flex-1">
                 {notice.content.replace(/\n/g, ' ')}
               </p>

               <div className="flex items-center justify-between pt-5 border-t border-slate-100/60 mt-auto">
                 <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-slate-300" /> {notice.created_at}
                 </span>
                 <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[8px] font-black text-slate-600">{notice.created_by?.charAt(0) || "U"}</div>
                   <span className="text-[10px] font-black uppercase text-slate-400 truncate max-w-[80px]">{notice.created_by || "User"}</span>
                 </div>
               </div>
             </div>
          </div>
        ))}
      </div>
      )}

      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl shadow-slate-900/20 mt-12 p-10 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 z-10 border border-slate-800">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 mix-blend-lighten pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 mix-blend-lighten pointer-events-none" />
         
         <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest mb-5 border border-white/10 backdrop-blur-md">
              <Globe className="w-3 h-3" /> Premium Future Add-on
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Need to send an SMS Alert?</h3>
            <p className="text-slate-400 font-medium text-base md:text-lg leading-relaxed">
               Instantly broadcast critical notices directly to villagers' mobile phones via our automated SMS integration gateway. Keep everyone informed in real-time.
            </p>
         </div>
         <Button className="bg-white text-slate-900 hover:bg-slate-50 border-0 shadow-2xl shadow-white/10 rounded-2xl px-8 py-6 h-auto text-lg font-black shrink-0 hover:scale-105 hover:-translate-y-1 transition-all duration-500">
            Setup SMS Gateway
         </Button>
      </div>
    </div>
  );
}
