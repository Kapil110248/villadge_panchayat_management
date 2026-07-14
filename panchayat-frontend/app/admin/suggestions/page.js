"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Lightbulb, ThumbsUp, CheckCircle, Clock, Eye, MessageSquare, Trash2, Edit2 } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => { fetchSuggestions(); }, []);

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/suggestions", token);
      setSuggestions(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/suggestions/${id}/status`, { status: newStatus }, token);
      showToast(`Status updated to ${newStatus.replace(/_/g, " ")}`);
      fetchSuggestions();
    } catch (e) {
      showToast("Status update failed: " + e.message, "error");
    }
  };

  const handleVote = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.post(`/suggestions/${id}/vote`, {}, token);
      showToast("Suggestion upvoted!");
      fetchSuggestions();
    } catch (e) {
      showToast(e.message || "You have already upvoted this suggestion", "error");
    }
  };

  const pending = suggestions.filter(s => s.status === "pending");
  const underReview = suggestions.filter(s => s.status === "under_consideration");
  const accepted = suggestions.filter(s => s.status === "accepted");

  const statusBadge = (status) => {
    const map = {
      pending: "bg-amber-500/10 text-amber-700",
      under_consideration: "bg-blue-500/10 text-blue-700",
      accepted: "bg-emerald-500/10 text-emerald-700",
      rejected: "bg-rose-500/10 text-rose-700",
    };
    return map[status] || "bg-slate-100 text-slate-500";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
            <Lightbulb className="w-3 h-3" /> Suggestion Box
          </div>
          <h1 className="text-4xl font-black text-slate-900">Citizen Suggestions</h1>
          <p className="text-slate-500 font-medium mt-1">Review ideas submitted by village residents and take action.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center"><Clock className="w-6 h-6 text-amber-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending Review</p><h3 className="text-2xl font-black text-slate-900">{pending.length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center"><Eye className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Under Review</p><h3 className="text-2xl font-black text-slate-900">{underReview.length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accepted</p><h3 className="text-2xl font-black text-slate-900">{accepted.length}</h3></div>
          </div>
        </Card>
      </div>

      {/* Suggestion Cards */}
      <Card>
        <CardHeader title="All Suggestions" subtitle={`${suggestions.length} ideas from village residents`} />
        <CardContent className="space-y-4">
          {loading ? <p className="text-center py-8 text-slate-400">Loading...</p> :
            suggestions.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-400">No suggestions submitted yet</p>
              </div>
            ) : suggestions.map(s => (
              <div key={s.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase ${statusBadge(s.status)}`}>{s.status?.replace(/_/g, " ")}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{s.description}</p>
                  <p className="text-[10px] text-slate-400 font-bold">
                    By {s.citizen?.full_name || "Anonymous"} • {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString("en-IN") : ""}
                  </p>

                  {s.votes && s.votes.length > 0 && (
                    <div className="text-[10px] text-slate-500 font-semibold bg-white border border-slate-100 rounded-xl px-3 py-1.5 mt-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider block text-[8px] mb-0.5">Upvoted By:</span>
                      {s.votes.map(v => v.citizen?.full_name || "Anonymous").join(", ")}
                    </div>
                  )}

                  {s.processed_by && (
                    <div className="text-[10px] text-slate-500 font-semibold bg-white border border-slate-100 rounded-xl px-3 py-1.5 mt-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider block text-[8px] mb-0.5">Processed By:</span>
                      {s.status === 'accepted' ? 'Accepted' : s.status === 'rejected' ? 'Rejected' : 'Reviewed'} by {s.processed_by.full_name} ({s.processed_by.role})
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
                  <button onClick={() => handleVote(s.id)} className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-indigo-50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors cursor-pointer group">
                    <ThumbsUp className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 group-active:scale-95 transition-all" />
                    <span className="text-sm font-black text-slate-700 group-hover:text-indigo-700">{s.votes?.length || 0}</span>
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <select 
                      value={s.status} 
                      onChange={(e) => handleStatusChange(s.id, e.target.value)}
                      className="text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="pending">Pending</option>
                      <option value="under_consideration">Under Review</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          }
        </CardContent>
      </Card>

      {/* Toast Notification */}
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
