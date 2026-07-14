"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MessageSquare, CheckCircle, AlertCircle, Search, RefreshCw, X, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";

const STATUS_CONFIG = {
  "open":        { label: "Open",        color: "text-rose-600",    bg: "bg-rose-50",    badge: "bg-rose-100 text-rose-700" },
  "in_progress": { label: "In Progress", color: "text-amber-600",   bg: "bg-amber-50",   badge: "bg-amber-100 text-amber-700" },
  "resolved":    { label: "Resolved",    color: "text-emerald-600", bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-700" },
  "closed":      { label: "Closed",      color: "text-slate-500",   bg: "bg-slate-50",   badge: "bg-slate-100 text-slate-500" },
};

const PRIORITY_CONFIG = {
  high:   { label: "URGENT", className: "bg-rose-500 text-white" },
  medium: { label: "MEDIUM", className: "bg-amber-100 text-amber-700" },
  low:    { label: "LOW",    className: "bg-slate-100 text-slate-500" },
};

export default function ClerkComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  // Update status modal
  const [statusModal, setStatusModal] = useState(null); // { id, currentStatus }
  const [newStatus, setNewStatus] = useState("");
  
  // Resolution modal
  const [resolutionModal, setResolutionModal] = useState({ show: false, complaintId: null, message: "", photo: null, uploading: false });

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await api.get("/clerk/complaints", token);
      setComplaints(Array.isArray(res) ? res : res.complaints || []);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const openStatusModal = (complaint) => {
    setStatusModal({ id: complaint.id, ref_id: complaint.ref_id, currentStatus: complaint.status });
    setNewStatus(complaint.status);
  };

  const handleUpdateStatus = async () => {
    if (!statusModal) return;
    const token = localStorage.getItem("accessToken");
    setActionLoading(statusModal.id);
    try {
      await api.put(`/clerk/complaints/${statusModal.id}/status`, { status: newStatus }, token);
      setStatusModal(null);
      fetchComplaints();
    } catch (err) {
      alert("Status update failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolutionSubmit = async (e) => {
    e.preventDefault();
    setResolutionModal(prev => ({ ...prev, uploading: true }));
    try {
      const token = localStorage.getItem("accessToken");
      let photo_url = null;
      if (resolutionModal.photo) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", resolutionModal.photo);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
        const uploadRes = await fetch(`${apiUrl}/upload`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formDataUpload
        });
        if (!uploadRes.ok) throw new Error("File upload failed");
        const uploadData = await uploadRes.json();
        photo_url = uploadData.secure_url;
      }

      await api.put(`/clerk/complaints/${resolutionModal.complaintId}/status`, { 
        status: "resolution_proposed",
        message: resolutionModal.message,
        image_url: photo_url
      }, token);

      alert("Resolution proposed and citizen notified!");
      setResolutionModal({ show: false, complaintId: null, message: "", photo: null, uploading: false });
      fetchComplaints();
    } catch (err) {
      alert("Error proposing resolution: " + err.message);
      setResolutionModal(prev => ({ ...prev, uploading: false }));
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch =
      c.citizen?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ref_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const statusKey = c.status?.toLowerCase().replace(" ", "_");
    const matchesStatus = statusFilter === "all" || statusKey === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all:         complaints.length,
    open:        complaints.filter(c => c.status?.toLowerCase() === "open").length,
    in_progress: complaints.filter(c => c.status?.toLowerCase().includes("progress")).length,
    resolved:    complaints.filter(c => c.status?.toLowerCase() === "resolved").length,
  };

  const getStatusConfig = (status) => {
    const key = status?.toLowerCase().replace(" ", "_");
    return STATUS_CONFIG[key] || STATUS_CONFIG["open"];
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complaint Tracking</h1>
          <p className="text-slate-500">Resolve citizen grievances and update status</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchComplaints} className="flex items-center gap-2 self-start sm:self-auto">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: "all",         label: "Total",       color: "text-slate-700" },
          { key: "open",        label: "Open",        color: "text-rose-600" },
          { key: "in_progress", label: "In Progress", color: "text-amber-600" },
          { key: "resolved",    label: "Resolved",    color: "text-emerald-600" },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`p-3 rounded-xl text-left border bg-white shadow-sm transition-all ${statusFilter === s.key ? "border-primary ring-2 ring-primary/20" : "border-slate-200 hover:border-slate-300"}`}
          >
            <p className={`text-2xl font-black ${s.color}`}>{counts[s.key]}</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, category or ID..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-full text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 bg-white"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400 font-bold animate-pulse">Loading complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-bold">No complaints found</div>
        ) : filteredComplaints.map((complaint) => {
          const cfg = getStatusConfig(complaint.status);
          const priorityKey = complaint.urgent ? "high" : "medium";
          const priorityCfg = PRIORITY_CONFIG[priorityKey];
          const isResolved = complaint.status?.toLowerCase() === "resolved" || complaint.status?.toLowerCase() === "closed" || complaint.status?.toLowerCase() === "resolution proposed";
          return (
            <Card
              key={complaint.id}
              className={`overflow-hidden transition-all hover:shadow-md ${complaint.urgent ? "border-l-4 border-l-rose-500" : ""}`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left - Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${cfg.bg}`}>
                      <MessageSquare className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900">{complaint.citizen}</h4>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">
                          {complaint.category}
                        </span>
                        {complaint.urgent && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${priorityCfg.className}`}>
                            URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        ID: <span className="font-mono font-bold">{complaint.ref_id}</span> • Submitted on {complaint.date}
                      </p>
                      {complaint.subject && (
                        <p className="text-sm font-semibold text-slate-800 mt-2">{complaint.subject}</p>
                      )}
                      {complaint.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{complaint.description}</p>
                      )}
                      {complaint.image_url && complaint.image_url !== "null" && (
                        <div className="mt-3">
                          <img 
                            src={complaint.image_url.startsWith('http') ? complaint.image_url : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8001'}${complaint.image_url}`} 
                            alt="Complaint Attachment" 
                            className="h-24 w-auto object-cover rounded-lg border border-slate-200" 
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right - Status + Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Current Status</p>
                      <p className={`text-sm font-black ${cfg.color}`}>{complaint.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => openStatusModal(complaint)}
                        disabled={actionLoading === complaint.id}
                      >
                        Update
                      </Button>
                      {!isResolved && (
                        <Button
                          size="sm"
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => setResolutionModal({ show: true, complaintId: complaint.id, message: "", photo: null, uploading: false })}
                        >
                          Resolve (with proof)
                        </Button>
                      )}
                      {isResolved && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 px-2">
                          <CheckCircle className="w-4 h-4" /> Done
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Update Status Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 relative bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
              <div className="absolute top-4 right-4">
                <button onClick={() => setStatusModal(null)} className="p-2 bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all shadow-sm border border-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Update Status</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Ref ID: <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{statusModal.ref_id}</span>
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3 mb-8">
                {Object.entries(STATUS_CONFIG)
                  .filter(([key]) => key !== "resolved" && key !== "closed")
                  .map(([key, cfg]) => {
                    const isSelected = newStatus === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setNewStatus(key)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${
                          isSelected 
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10 scale-[1.02]" 
                            : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-primary text-white shadow-inner" : "bg-slate-100 text-slate-400"}`}>
                           {key === "open" ? <AlertCircle className="w-5 h-5" /> : 
                            key === "in_progress" ? <RefreshCw className="w-5 h-5" /> : 
                            <CheckCircle className="w-5 h-5" />}
                        </div>
                        <div className="text-left flex-1">
                           <span className={`block font-black text-lg ${isSelected ? "text-primary" : "text-slate-700"}`}>{cfg.label}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-primary" : "border-slate-300"}`}>
                           {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                      </button>
                    )
                })}
              </div>

              <Button
                className={`w-full py-6 rounded-2xl text-base font-black transition-all ${
                  actionLoading !== null || newStatus === statusModal.currentStatus
                    ? "bg-slate-100 text-slate-400"
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20"
                }`}
                onClick={handleUpdateStatus}
                disabled={actionLoading !== null || newStatus === statusModal.currentStatus}
              >
                {actionLoading !== null ? "Saving Update..." : "Confirm Status Update"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {resolutionModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button onClick={() => setResolutionModal({ show: false, complaintId: null, message: "", photo: null, uploading: false })} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-black text-slate-900">Resolve Complaint</h3>
              <p className="text-sm text-slate-500 mt-1">Proof and message for the citizen.</p>
            </div>
            <form onSubmit={handleResolutionSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Resolution Message</label>
                <textarea 
                  required 
                  rows={3}
                  className="w-full p-3 border border-slate-200 focus:border-emerald-500 rounded-xl text-sm outline-none resize-none" 
                  value={resolutionModal.message} 
                  onChange={e => setResolutionModal({...resolutionModal, message: e.target.value})} 
                  placeholder="Describe how the issue was resolved..." 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Proof Photo (Required)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setResolutionModal({...resolutionModal, photo: e.target.files[0]})}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
              <Button type="submit" disabled={resolutionModal.uploading} className="w-full py-5 rounded-xl text-sm bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
                {resolutionModal.uploading ? "Submitting..." : "Submit Resolution"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
