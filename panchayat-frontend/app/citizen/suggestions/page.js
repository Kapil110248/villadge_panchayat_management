"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sparkles, MessageSquare, ThumbsUp, Calendar, Send, Info, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function CitizenSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/suggestions", token);
      setSuggestions(data);
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !desc) return;
    try {
      const token = localStorage.getItem("accessToken");
      await api.post("/suggestions", {
        title,
        description: desc
      }, token);
      showToast("Idea submitted to suggestion box.");
      setTitle("");
      setDesc("");
      fetchSuggestions();
    } catch (error) {
      console.error("Failed to create suggestion:", error);
      showToast("Failed to submit suggestion.", "error");
    }
  };

  const handleVote = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.post(`/suggestions/${id}/vote`, {}, token);
      showToast("Sujhaav upvoted successfully!");
      fetchSuggestions();
    } catch (error) {
      console.error(error);
      showToast("Aap is sujhaav ko pehle hi vote kar chuke hain.", "error");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 mb-2">Citizen Suggestion Box</h1>
        <p className="text-slate-500 font-medium">Submit ideas for village improvement, upvote ideas, and track implementation status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Suggestions feed */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Community Suggestions" subtitle="Recent proposals submitted by residents" />
            <CardContent className="space-y-6">
              {loading ? (
                <p className="text-center py-6 text-slate-400">Loading ideas...</p>
              ) : suggestions.length === 0 ? (
                <p className="text-center py-6 text-slate-400">No suggestions recorded yet.</p>
              ) : (
                suggestions.map((sug) => (
                  <div key={sug.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        sug.status === "implemented" ? "bg-emerald-100 text-emerald-800" :
                        sug.status === "approved" ? "bg-blue-100 text-blue-800" :
                        sug.status === "under_consideration" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700"
                      }`}>
                        {sug.status.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(sug.submitted_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{sug.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed font-semibold mt-1">{sug.description}</p>
                    </div>

                    <div className="flex flex-col gap-2 border-t border-slate-100/50 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-bold">Submitted by: {sug.citizen?.full_name || "Citizen"}</span>
                        <Button
                          onClick={() => handleVote(sug.id)}
                          variant="outline"
                          size="sm"
                          className="gap-2 text-primary border-primary/20 hover:bg-primary/5 rounded-xl font-bold"
                        >
                          <ThumbsUp className="w-4 h-4" /> Upvote ({sug.votes?.length || 0})
                        </Button>
                      </div>

                      {sug.votes && sug.votes.length > 0 && (
                        <div className="text-xs text-slate-500 font-semibold bg-slate-100/55 rounded-2xl p-3 border border-slate-200/50">
                          <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest block mb-1">Upvoted By:</span>
                          <span className="text-slate-700">{sug.votes.map(v => v.citizen?.full_name || "Anonymous").join(", ")}</span>
                        </div>
                      )}

                      {sug.processed_by && (
                        <div className="text-xs font-semibold bg-slate-100/55 rounded-2xl p-3 border border-slate-200/50 flex items-center justify-between">
                          <div>
                            <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest block mb-1">Action Details:</span>
                            <span className="text-slate-700">
                              {sug.status === 'accepted' ? 'Accepted' : sug.status === 'rejected' ? 'Rejected' : 'Status updated'} by{" "}
                              <span className="font-bold text-slate-900">{sug.processed_by.full_name}</span>
                            </span>
                          </div>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
                            {sug.processed_by.role}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Submit box */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 space-y-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-lg border border-primary/10">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Naya Idea Submit Karein</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Gaav ke vikas (water, library, parks, etc.) ke liye apna idea yahan likhein aur logo ke votes prapt karein.
                </p>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Suggestion Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Village park playground upgrade"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none shadow-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Idea Details</label>
                  <textarea
                    placeholder="Describe how this benefits our Gram Panchayat..."
                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none min-h-[140px] resize-none shadow-sm"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    required
                  ></textarea>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl gap-2">
                  Post Proposal <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} flex items-center gap-2 animate-in slide-in-from-top-5`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
