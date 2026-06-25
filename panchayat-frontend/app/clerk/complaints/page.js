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

  const handleQuickResolve = async (id) => {
    const token = localStorage.getItem("accessToken");
    setActionLoading(id);
    try {
      await api.put(`/clerk/complaints/${id}/status`, { status: "resolved" }, token);
      fetchComplaints();
    } catch (err) {
      alert("Failed to resolve complaint.");
    } finally {
      setActionLoading(null);
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
          const isResolved = complaint.status?.toLowerCase() === "resolved" || complaint.status?.toLowerCase() === "closed";
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
                      {complaint.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{complaint.description}</p>
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
                          onClick={() => handleQuickResolve(complaint.id)}
                          disabled={actionLoading === complaint.id}
                        >
                          {actionLoading === complaint.id ? "..." : "Resolve"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Update Status</h3>
              <button onClick={() => setStatusModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500">
              Complaint <span className="font-mono font-bold">{statusModal.ref_id}</span> ka status update karein.
            </p>
            <div className="space-y-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setNewStatus(key)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${newStatus === key ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <span className="font-bold text-slate-800">{cfg.label}</span>
                  {newStatus === key && <CheckCircle className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setStatusModal(null)}>Cancel</Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleUpdateStatus}
                disabled={actionLoading !== null || newStatus === statusModal.currentStatus}
              >
                {actionLoading !== null ? "Saving..." : "Save Status"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
