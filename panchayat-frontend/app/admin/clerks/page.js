"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserPlus, Search, Phone, Shield, MoreVertical, Mail, X } from "lucide-react";
import { api } from "@/lib/api";

export default function ClerkManagement() {
  const [clerks, setClerks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [messageModal, setMessageModal] = useState({ show: false, clerkName: "", message: "", clerkId: null, history: [], loading: false });
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: "",
    village: "Sarahi",
    permissions: []
  });
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClerkId, setEditingClerkId] = useState(null);
  const [viewClerk, setViewClerk] = useState(null);

  const clerkPermissionsList = [
    { id: "Citizen Records", label: "Citizen Records" },
    { id: "Certificate Verification", label: "Certificate Verification" },
    { id: "Grievances", label: "Grievances" },
    { id: "Gram Sabha", label: "Gram Sabha" },
    { id: "Development Works", label: "Development Works" },
    { id: "Water Supply", label: "Water Supply" },
    { id: "Tax Center", label: "Tax Center" },
    { id: "Village Directory", label: "Village Directory" },
    { id: "Assets Ledger", label: "Assets Ledger" },
    { id: "Staff Attendance", label: "Staff Attendance" },
    { id: "Ration Schedule", label: "Ration Schedule" },
    { id: "Health Camps", label: "Health Camps" },
    { id: "Agriculture Center", label: "Agriculture Center" }
  ];

  const handlePermissionToggle = (permId) => {
    setFormData((prev) => {
      const current = prev.permissions;
      if (current.includes(permId)) {
        return { ...prev, permissions: current.filter(p => p !== permId) };
      } else {
        return { ...prev, permissions: [...current, permId] };
      }
    });
  };

  const fetchClerks = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/admin/clerks", token);
      setClerks(data.clerks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClerks();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleAddClerk = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      const token = localStorage.getItem("accessToken");
      await api.post("/admin/clerks", formData, token);
      showToast("Clerk added successfully!", "success");
      setShowAddModal(false);
      setFormData({ full_name: "", email: "", mobile: "", password: "", village: "Sarahi", permissions: [] });
      fetchClerks();
    } catch (err) {
      showToast("Failed to add clerk: " + err.message, "error");
    } finally {
      setAdding(false);
    }
  };

  const handleEditClick = (clerk) => {
    setFormData({
      full_name: clerk.name,
      email: clerk.email,
      mobile: clerk.mobile,
      village: clerk.village === 'Panchayat Office' ? 'Sarahi' : clerk.village,
      password: '',
      permissions: clerk.permissions || []
    });
    setEditingClerkId(clerk.id);
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleEditClerk = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const token = localStorage.getItem("accessToken");
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      
      await api.put(`/admin/clerks/${editingClerkId}`, payload, token);
      showToast("Clerk updated successfully!", "success");
      setShowEditModal(false);
      setFormData({ full_name: "", email: "", mobile: "", password: "", village: "Sarahi", permissions: [] });
      fetchClerks();
    } catch (err) {
      showToast("Failed to update clerk: " + err.message, "error");
    } finally {
      setAdding(false);
    }
  };

  const handleViewClick = (clerk) => {
    setViewClerk(clerk);
    setActiveDropdown(null);
  };

  const [performanceModal, setPerformanceModal] = useState({ show: false, clerk: null });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ show: false, clerkId: null, clerkName: "" });
  const [viewImageModal, setViewImageModal] = useState({ show: false, url: "" });
  const [activeDropdown, setActiveDropdown] = useState(null);

  const openMessageModal = async (clerk) => {
    setMessageModal({ show: true, clerkName: clerk.name, message: "", clerkId: clerk.id, history: [], loading: true });
    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.get(`/admin/clerks/${clerk.id}/messages`, token);
      setMessageModal(prev => ({ ...prev, history: res.messages || [], loading: false }));
    } catch (err) {
      console.error("Failed to load message history", err);
      setMessageModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (messageModal.message.trim() && messageModal.clerkId) {
      try {
        const token = localStorage.getItem("accessToken");
        await api.post(`/admin/clerks/${messageModal.clerkId}/message`, { message: messageModal.message }, token);
        showToast(`Message sent to ${messageModal.clerkName}!`, "success");
        // refresh history instead of closing
        openMessageModal({ name: messageModal.clerkName, id: messageModal.clerkId });
      } catch (err) {
        showToast("Failed to send message: " + err.message, "error");
      }
    }
  };

  const handleToggleStatus = async (clerkId, currentStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      await api.put(`/admin/clerks/${clerkId}/status`, { status: newStatus }, token);
      showToast(`Clerk status updated to ${newStatus}`, "success");
      fetchClerks();
    } catch (err) {
      showToast("Failed to update status: " + err.message, "error");
    }
    setActiveDropdown(null);
  };

  const handleDeleteClick = (clerkId, clerkName) => {
    setDeleteConfirmModal({ show: true, clerkId, clerkName });
    setActiveDropdown(null);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmModal.clerkId) return;
    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`/admin/clerks/${deleteConfirmModal.clerkId}`, token);
      showToast("Clerk removed successfully", "success");
      setDeleteConfirmModal({ show: false, clerkId: null, clerkName: "" });
      fetchClerks();
    } catch (err) {
      showToast("Failed to remove clerk: " + err.message, "error");
    }
  };

  const handlePerformance = (clerk) => {
    setPerformanceModal({ show: true, clerk });
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[60] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
           {toast.type === "success" ? <Shield className="w-5 h-5" /> : <X className="w-5 h-5" />}
           <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm p-6 relative shadow-2xl border-0">
            <div className="mb-6 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-rose-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Delete Clerk?</h2>
              <p className="text-sm font-medium text-slate-500">
                Are you sure you want to delete <span className="font-bold text-slate-700">{deleteConfirmModal.clerkName}</span>'s account? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 py-5 rounded-xl font-bold" 
                onClick={() => setDeleteConfirmModal({ show: false, clerkId: null, clerkName: "" })}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 py-5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20" 
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Message Modal */}
      {messageModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 relative shadow-2xl border-0">
            <button onClick={() => setMessageModal({ show: false, clerkName: "", message: "", clerkId: null, history: [], loading: false })} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-4">
              <h2 className="text-xl font-black text-slate-900">Send Message</h2>
              <p className="text-sm font-medium text-slate-500">To: {messageModal.clerkName}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-4 h-48 overflow-y-auto space-y-3">
              {messageModal.loading ? (
                 <div className="text-center text-sm font-bold text-slate-400 py-8">Loading history...</div>
              ) : messageModal.history.length === 0 ? (
                 <div className="text-center text-sm font-bold text-slate-400 py-8">No previous messages</div>
              ) : (
                 messageModal.history.map(msg => (
                   <div key={msg.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                     <p className="text-xs font-bold text-slate-400 mb-1">{new Date(msg.created_at).toLocaleString()}</p>
                     <p className="text-sm font-medium text-slate-700">{msg.message}</p>
                   </div>
                 ))
              )}
            </div>

            <form onSubmit={handleMessageSubmit} className="space-y-3">
              <textarea 
                required 
                rows={3}
                className="w-full mt-1 p-3 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none resize-none" 
                value={messageModal.message} 
                onChange={e => setMessageModal({...messageModal, message: e.target.value})} 
                placeholder="Type your official message here..." 
              />
              <Button type="submit" className="w-full py-6 rounded-xl text-sm shadow-xl shadow-primary/20">
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl p-0 relative shadow-2xl border-0 max-h-[95vh] flex flex-col overflow-hidden bg-white/95 backdrop-blur-3xl rounded-[2rem]">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-br from-primary to-emerald-700 p-8 pb-12 relative overflow-hidden shrink-0">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 blur-3xl rounded-full pointer-events-none" />
              <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md">
                <X className="w-5 h-5" />
              </button>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-1">Add New Clerk</h2>
              <p className="text-emerald-100 font-medium">Create a new staff account with specific permissions</p>
            </div>

            {/* Form Body - Scrollable */}
            <div className="p-8 pt-0 flex-1 overflow-y-auto scrollbar-none relative -mt-6">
              <form onSubmit={handleAddClerk} className="space-y-5 bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 relative">
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                    <input required type="text" className="w-full mt-1 p-4 bg-slate-50 border-2 border-transparent focus:border-primary/30 focus:bg-white rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="e.g. Rohan Das" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                    <input required type="email" className="w-full mt-1 p-4 bg-slate-50 border-2 border-transparent focus:border-primary/30 focus:bg-white rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. rohan@gram.in" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mobile No.</label>
                      <input required type="text" className="w-full mt-1 p-4 bg-slate-50 border-2 border-transparent focus:border-primary/30 focus:bg-white rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="9876543210" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Assigned Village</label>
                      <input required type="text" className="w-full mt-1 p-4 bg-slate-50 border-2 border-transparent focus:border-primary/30 focus:bg-white rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} placeholder="Sarahi" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Temporary Password</label>
                    <input required type="text" className="w-full mt-1 p-4 bg-slate-50 border-2 border-transparent focus:border-primary/30 focus:bg-white rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="password123" />
                  </div>
                </div>
                
                <div className="pt-6 mt-6 border-t border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-3 block">Module Permissions</label>
                  <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1 scrollbar-none">
                    {clerkPermissionsList.map((perm) => (
                      <label key={perm.id} className="relative flex items-center p-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => handlePermissionToggle(perm.id)}
                          className="peer sr-only"
                        />
                        <div className={`w-full h-full absolute inset-0 bg-slate-50 border-2 rounded-xl transition-all group-hover:border-primary/30 ${formData.permissions.includes(perm.id) ? 'border-primary bg-primary/5' : 'border-slate-100'}`}></div>
                        <div className="relative flex items-center gap-2 z-10 w-full">
                           <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.permissions.includes(perm.id) ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                             {formData.permissions.includes(perm.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                           </div>
                           <span className={`text-xs font-bold transition-colors truncate ${formData.permissions.includes(perm.id) ? 'text-primary' : 'text-slate-600'}`}>{perm.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <Button type="submit" className="w-full mt-8 py-6 rounded-2xl text-sm font-black shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-emerald-600 hover:scale-[1.02] transition-transform" disabled={adding}>
                  {adding ? "Creating Account..." : "Create Clerk Account"}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Clerk Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl p-0 relative shadow-2xl border-0 max-h-[95vh] flex flex-col overflow-hidden bg-white/95 backdrop-blur-3xl rounded-[2rem]">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-8 pb-12 relative overflow-hidden shrink-0">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 blur-3xl rounded-full pointer-events-none" />
              <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md">
                <X className="w-5 h-5" />
              </button>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-1">Edit Clerk Details</h2>
              <p className="text-amber-100 font-medium">Update account information and permissions</p>
            </div>

            {/* Form Body - Scrollable */}
            <div className="p-8 pt-0 flex-1 overflow-y-auto scrollbar-none relative -mt-6">
              <form onSubmit={handleEditClerk} className="space-y-5 bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 relative">
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                    <input required type="text" className="w-full mt-1 p-4 bg-slate-50 border-2 border-transparent focus:border-amber-500/30 focus:bg-white rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="e.g. Rohan Das" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                    <input required type="email" className="w-full mt-1 p-4 bg-slate-50 border-2 border-transparent focus:border-amber-500/30 focus:bg-white rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. rohan@gram.in" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mobile No.</label>
                      <input required type="text" className="w-full mt-1 p-4 bg-slate-50 border-2 border-transparent focus:border-amber-500/30 focus:bg-white rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="9876543210" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Assigned Village</label>
                      <input required type="text" className="w-full mt-1 p-4 bg-slate-50 border-2 border-transparent focus:border-amber-500/30 focus:bg-white rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} placeholder="Sarahi" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Reset Password <span className="lowercase font-normal">(optional)</span></label>
                    <input type="text" className="w-full mt-1 p-4 bg-slate-50 border-2 border-transparent focus:border-amber-500/30 focus:bg-white rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Leave blank to keep current" />
                  </div>
                </div>
                
                <div className="pt-6 mt-6 border-t border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-3 block">Module Permissions</label>
                  <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1 scrollbar-none">
                    {clerkPermissionsList.map((perm) => (
                      <label key={perm.id} className="relative flex items-center p-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => handlePermissionToggle(perm.id)}
                          className="peer sr-only"
                        />
                        <div className={`w-full h-full absolute inset-0 bg-slate-50 border-2 rounded-xl transition-all group-hover:border-amber-500/30 ${formData.permissions.includes(perm.id) ? 'border-amber-500 bg-amber-500/5' : 'border-slate-100'}`}></div>
                        <div className="relative flex items-center gap-2 z-10 w-full">
                           <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.permissions.includes(perm.id) ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                             {formData.permissions.includes(perm.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                           </div>
                           <span className={`text-xs font-bold transition-colors truncate ${formData.permissions.includes(perm.id) ? 'text-amber-600' : 'text-slate-600'}`}>{perm.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <Button type="submit" className="w-full mt-8 py-6 rounded-2xl text-sm font-black shadow-xl shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-amber-600 hover:scale-[1.02] transition-transform" disabled={adding}>
                  {adding ? "Saving Updates..." : "Save Changes"}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* View Clerk Details Modal */}
      {viewClerk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl p-0 relative shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-3xl rounded-[2rem]">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 relative overflow-hidden">
              <button onClick={() => setViewClerk(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                {viewClerk.avatar_url ? (
                  <img src={viewClerk.avatar_url.startsWith('http') ? viewClerk.avatar_url : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8001'}${viewClerk.avatar_url}`} alt="avatar" className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white/20" />
                ) : (
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-inner border border-white/20">
                    {viewClerk.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div className="text-white">
                  <h2 className="text-2xl font-black">{viewClerk.name}</h2>
                  <p className="text-indigo-100 font-medium flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${viewClerk.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                    {viewClerk.status} Clerk • {viewClerk.village}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                  <p className="text-sm font-bold text-slate-800">{viewClerk.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile No.</p>
                  <p className="text-sm font-bold text-slate-800">{viewClerk.mobile}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tasks</p>
                  <p className="text-sm font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded-md">{viewClerk.tasksHandled} completed</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assigned Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {viewClerk.permissions && viewClerk.permissions.length > 0 ? viewClerk.permissions.map(perm => (
                    <span key={perm} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      {perm}
                    </span>
                  )) : (
                    <span className="text-sm text-slate-400 font-medium italic">No specific permissions assigned</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
               <Button variant="outline" onClick={() => setViewClerk(null)} className="rounded-xl">Close</Button>
               <Button onClick={() => { setViewClerk(null); handleEditClick(viewClerk); }} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-600/20">Edit Clerk Details</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewImageModal.show && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setViewImageModal({ show: false, url: "" })}>
          <button className="absolute top-6 right-6 p-2 bg-white/10 text-white hover:bg-white/20 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
          <img src={viewImageModal.url} alt="Profile Full View" className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Performance Modal */}
      {performanceModal.show && performanceModal.clerk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 relative shadow-2xl border-0">
            <button onClick={() => setPerformanceModal({ show: false, clerk: null })} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900">Performance Report</h2>
              <p className="text-sm font-medium text-slate-500">{performanceModal.clerk.name}</p>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500">Assigned Village</span>
                <span className="text-sm font-black text-slate-900">{performanceModal.clerk.village}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500">Current Status</span>
                <span className={`text-sm font-black ${performanceModal.clerk.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'}`}>{performanceModal.clerk.status}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500">Total Tasks Handled</span>
                <span className="text-2xl font-black text-primary">{performanceModal.clerk.tasksHandled}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clerk Management</h1>
          <p className="text-slate-500">Manage Panchayat staff and their performance</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto"><UserPlus className="w-4 h-4 mr-2" /> Naya Clerk Add Karein</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading clerks...</div>
      ) : clerks.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-medium">No clerks found. Add a new clerk to get started.</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clerks.map((clerk) => (
          <Card key={clerk.id} className="relative overflow-hidden">
             <div className={`absolute top-0 left-0 w-full h-1 ${clerk.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
             <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                   {clerk.avatar_url ? (
                     <img 
                        src={clerk.avatar_url.startsWith('http') ? clerk.avatar_url : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8001'}${clerk.avatar_url}`} 
                        alt={clerk.name} 
                        className="w-12 h-12 rounded-2xl object-cover shadow-sm cursor-pointer hover:opacity-80 transition-opacity" 
                        onClick={() => setViewImageModal({ show: true, url: clerk.avatar_url.startsWith('http') ? clerk.avatar_url : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8001'}${clerk.avatar_url}` })}
                     />
                   ) : (
                     <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-lg text-slate-400">
                        {clerk.name.split(' ').map(n => n[0]).join('')}
                     </div>
                   )}
                   <div className="relative">
                      <button 
                        className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"
                        onClick={() => setActiveDropdown(activeDropdown === clerk.id ? null : clerk.id)}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {activeDropdown === clerk.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-10 overflow-hidden">
                          <button 
                            className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            onClick={() => handleViewClick(clerk)}
                          >
                            View Details
                          </button>
                          <button 
                            className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-50"
                            onClick={() => handleEditClick(clerk)}
                          >
                            Edit Clerk
                          </button>
                          <button 
                            className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            onClick={() => handleToggleStatus(clerk.id, clerk.status)}
                          >
                            {clerk.status === 'Active' ? 'Suspend Clerk' : 'Activate Clerk'}
                          </button>
                          <button 
                            className="w-full text-left px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                            onClick={() => handleDeleteClick(clerk.id, clerk.name)}
                          >
                            Delete Clerk
                          </button>
                        </div>
                      )}
                   </div>
                </div>
                <div>
                   <h3 className="text-lg font-bold text-slate-900">{clerk.name}</h3>
                   <p className="text-sm text-slate-500 font-medium">Secretary: {clerk.village}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                   <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Tasks</p>
                      <p className="text-sm font-bold text-slate-900">{clerk.tasksHandled}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                      <span className={`text-[10px] font-bold ${clerk.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'}`}>{clerk.status}</span>
                   </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-2">
                   <Button variant="outline" size="sm" className="text-xs" onClick={() => handlePerformance(clerk)}>Performance</Button>
                   <Button variant="outline" size="sm" className="text-xs" onClick={() => openMessageModal(clerk)}>Message</Button>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>
      )}

      <Card>
         <CardHeader title="Staff Performance Analytics" />
         <CardContent>
            {clerks.length > 0 ? (
               <div className="space-y-4 mt-4">
                  {clerks.map(clerk => (
                     <div key={clerk.id} className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700 w-32 truncate">{clerk.name}</span>
                        <div className="flex-1 mx-4 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                           <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(Math.min(clerk.tasksHandled * 5, 100), 5)}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{clerk.tasksHandled} tasks</span>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-200 text-slate-400 text-sm italic">
                  Clerk performance trends will appear here...
               </div>
            )}
         </CardContent>
      </Card>
    </div>
  );
}
