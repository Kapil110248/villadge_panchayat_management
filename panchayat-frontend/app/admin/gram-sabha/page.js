"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar, MapPin, Users, Plus, FileText, CheckCircle, Send, Download, Eye, Clock, X, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminGramSabha() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date_time: "", agenda: "", location: "", type: "Regular", presidingOfficer: "", quorum: "" });
  
  // Custom Modal State
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [activeMeetingId, setActiveMeetingId] = useState(null);
  const [minutesUrl, setMinutesUrl] = useState("");
  const [resolutions, setResolutions] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Postpone & Cancel States
  const [postponeModalOpen, setPostponeModalOpen] = useState(false);
  const [postponeDate, setPostponeDate] = useState("");
  const [postponeReason, setPostponeReason] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [replyTexts, setReplyTexts] = useState({});
  const [expandedMeetings, setExpandedMeetings] = useState({});

  const handleReplySubmit = async (e, sugId) => {
    e.preventDefault();
    const text = replyTexts[sugId];
    if (!text || !text.trim()) return;

    try {
      const token = localStorage.getItem("accessToken");
      await api.post(`/gram-sabha/suggestion/${sugId}/reply`, {
        reply_text: text
      }, token);
      setReplyTexts(prev => ({ ...prev, [sugId]: "" }));
      showToast("Reply submitted successfully!", "success");
      fetchMeetings();
    } catch (error) {
      console.error(error);
      showToast("Failed to submit reply.", "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const handleBroadcastStart = async (meetingId) => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.post(`/admin/gram-sabha/${meetingId}/broadcast-start`, {}, token);
      showToast("Meeting start notice broadcasted successfully!", "success");
      fetchMeetings();
    } catch (e) {
      showToast(e.message || "Failed to broadcast meeting start", "error");
    }
  };

  const handlePostponeSubmit = async () => {
    if (!postponeDate) return;
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/admin/gram-sabha/${activeMeetingId}/postpone`, {
        new_date_time: new Date(postponeDate).toISOString(),
        reason: postponeReason
      }, token);
      showToast("Meeting postponed successfully!", "success");
      setPostponeModalOpen(false);
      fetchMeetings();
    } catch (e) {
      showToast(e.message || "Failed to postpone meeting", "error");
    }
  };

  const handleCancelSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/admin/gram-sabha/${activeMeetingId}/cancel`, {
        reason: cancelReason
      }, token);
      showToast("Meeting cancelled successfully!", "success");
      setCancelModalOpen(false);
      fetchMeetings();
    } catch (e) {
      showToast(e.message || "Failed to cancel meeting", "error");
    }
  };

  const [tick, setTick] = useState(0);

  const getElapsedDuration = (startedAtString) => {
    if (!startedAtString) return "00:00";
    const startedAt = new Date(startedAtString);
    const diffMs = new Date() - startedAt;
    if (diffMs < 0) return "00:00";
    const diffSecs = Math.floor(diffMs / 1000);
    const mins = Math.floor(diffSecs / 60);
    const secs = diffSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMeetingDuration = (start, end) => {
    if (!start || !end) return "";
    const diffMs = new Date(end) - new Date(start);
    if (diffMs < 0) return "";
    const diffMins = Math.round(diffMs / (1000 * 60));
    return `${diffMins} mins`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => { 
    fetchMeetings(); 
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    const tickTimer = setInterval(() => setTick(t => t + 1), 1000);
    return () => {
      clearInterval(timer);
      clearInterval(tickTimer);
    };
  }, []);

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/admin/gram-sabha", token);
      setMeetings(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const parseAgenda = (text) => {
    if (!text) return { tags: [], content: '' };
    const regex = /\[(.*?)\]/g;
    let match;
    const tags = [];
    let content = text;
    while ((match = regex.exec(text)) !== null) {
      tags.push(match[1]);
      content = content.replace(match[0], '');
    }
    return { tags, content: content.trim() };
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      
      const bundledAgenda = `[TYPE:${form.type}] [OFFICER:${form.presidingOfficer || 'N/A'}] [QUORUM:${form.quorum || 'N/A'}] ${form.agenda}`;
      
      await api.post("/admin/gram-sabha", { 
        date_time: new Date(form.date_time).toISOString(),
        location: form.location,
        agenda: bundledAgenda
      }, token);
      
      showToast("Gram Sabha meeting scheduled successfully!", "success");
      setShowForm(false);
      setForm({ date_time: "", agenda: "", location: "", type: "Regular", presidingOfficer: "", quorum: "" });
      fetchMeetings();
    } catch (e) { showToast(e.message || "Failed to schedule meeting", "error"); }
  };

  const openCompleteModal = (meetingId) => {
    setActiveMeetingId(meetingId);
    setMinutesUrl("");
    setResolutions("");
    setCompleteModalOpen(true);
  };

  const submitComplete = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/admin/gram-sabha/${activeMeetingId}/minutes`, {
        minutes_url: minutesUrl || "",
        resolutions: resolutions || ""
      }, token);
      
      showToast("Meeting marked as completed!", "success");
      setCompleteModalOpen(false);
      fetchMeetings();
    } catch (e) { showToast(e.message || "Failed to complete meeting", "error"); }
  };

  const scheduled = meetings.filter(m => m.status === "scheduled" || m.status === "ongoing");
  const completed = meetings.filter(m => m.status === "completed");

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
            <Users className="w-3 h-3" /> Gram Sabha Management
          </div>
          <h1 className="text-4xl font-black text-slate-900">Gram Sabha</h1>
          <p className="text-slate-500 font-medium mt-1">Schedule meetings, manage attendance, publish notices & minutes.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-2xl shadow-xl shadow-indigo-200">
          <Plus className="w-5 h-5" /> New Meeting
        </Button>
      </div>

      {/* Create Meeting Form */}
      {showForm && (
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white">
          <CardContent className="p-8">
            <form onSubmit={handleCreate} className="space-y-6">
              <h3 className="text-lg font-black text-slate-900">Schedule New Gram Sabha</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</label>
                  <input type="datetime-local" required value={form.date_time} onChange={e => setForm({...form, date_time: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                  <input type="text" placeholder="e.g. Panchayat Bhawan" required value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Type</label>
                  <select required value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none">
                    <option value="Regular">Regular</option>
                    <option value="Special Session">Special Session</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presiding Officer</label>
                  <input type="text" placeholder="e.g. Sarpanch Name" value={form.presidingOfficer} onChange={e => setForm({...form, presidingOfficer: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Quorum</label>
                  <input type="number" placeholder="e.g. 50" value={form.quorum} onChange={e => setForm({...form, quorum: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Agenda</label>
                <textarea placeholder="Describe meeting topics and discussion points..." required value={form.agenda} onChange={e => setForm({...form, agenda: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none min-h-[100px] resize-none" />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-xl"><Send className="w-4 h-4" /> Publish Meeting</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center"><Calendar className="w-6 h-6 text-indigo-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Upcoming</p><h3 className="text-2xl font-black text-slate-900">{scheduled.length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Completed</p><h3 className="text-2xl font-black text-slate-900">{completed.length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center"><Users className="w-6 h-6 text-amber-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Meetings</p><h3 className="text-2xl font-black text-slate-900">{meetings.length}</h3></div>
          </div>
        </Card>
      </div>

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader title="Scheduled Meetings" subtitle="Manage upcoming Gram Sabha sessions" />
        <CardContent className="space-y-4">
          {loading ? <p className="text-center py-8 text-slate-400">Loading...</p> :
            scheduled.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-400">No upcoming meetings scheduled</p>
              </div>
            ) : scheduled.map(meet => {
              const hasStarted = currentTime >= new Date(meet.date_time);
              return (
              <div key={meet.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {meet.status === "ongoing" && (
                      <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-black rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                        ● Live In Progress
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-bold"><Clock className="w-4 h-4" />{new Date(meet.date_time).toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Meeting Agenda (Mudda)</h3>
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    {(() => {
                      const { tags, content } = parseAgenda(meet.agenda);
                      return (
                        <>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {tags.map((tag, i) => {
                                const [key, val] = tag.split(':');
                                return (
                                  <span key={i} className="px-2.5 py-1 bg-white text-indigo-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-indigo-100 shadow-sm flex items-center gap-1">
                                    <span className="text-indigo-400">{key}:</span> {val || ''}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          <p className="text-base text-slate-700 font-medium leading-relaxed">{content}</p>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-600 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-500" />{meet.location}</div>
                </div>

                {meet.status === "ongoing" && meet.started_at && (
                  <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100/50 flex items-center gap-2 mt-2 shadow-sm animate-pulse">
                    <Clock className="w-4 h-4 text-emerald-500 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>Meeting started! Active Duration: {getElapsedDuration(meet.started_at)}</span>
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                  <Button 
                    onClick={() => openCompleteModal(meet.id)} 
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200/50 text-xs font-bold gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark Completed & Upload Minutes
                  </Button>

                  {meet.status === "scheduled" && (
                    <Button 
                      onClick={() => handleBroadcastStart(meet.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200/50 text-xs font-bold gap-1.5"
                    >
                      <Send className="w-4 h-4" /> Broadcast Start Notice
                    </Button>
                  )}

                  {meet.status === "scheduled" && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setActiveMeetingId(meet.id);
                        setPostponeDate(new Date(meet.date_time).toISOString().slice(0, 16));
                        setPostponeReason("");
                        setPostponeModalOpen(true);
                      }}
                      className="border-amber-200 hover:bg-amber-50 text-amber-700 rounded-xl text-xs font-bold gap-1.5"
                    >
                      <Clock className="w-4 h-4 text-amber-500" /> Postpone / Reschedule
                    </Button>
                  )}

                  {meet.status === "scheduled" && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setActiveMeetingId(meet.id);
                        setCancelReason("");
                        setCancelModalOpen(true);
                      }}
                      className="border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-bold gap-1.5"
                    >
                      <X className="w-4 h-4 text-rose-500" /> Cancel Meeting
                    </Button>
                  )}
                </div>

                {/* Suggestions list for this meeting */}
                {meet.suggestions && meet.suggestions.length > 0 && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                      Sadasya Suggestions ({meet.suggestions.length})
                    </h4>
                    <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                      {meet.suggestions.map((sug, idx) => {
                        const avatarUrl = sug.citizen?.avatar_url
                          ? (sug.citizen.avatar_url.startsWith('http')
                              ? sug.citizen.avatar_url
                              : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8001'}${sug.citizen.avatar_url}`)
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${sug.citizen?.full_name || 'Citizen'}`;

                        return (
                          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100/50 text-xs flex flex-col gap-3 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start gap-3">
                              <img
                                src={avatarUrl}
                                alt={sug.citizen?.full_name || "Citizen"}
                                className="w-8 h-8 rounded-full object-cover border border-slate-100 shrink-0"
                                onError={(e) => {
                                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${sug.citizen?.full_name || 'Citizen'}`;
                                }}
                              />
                              <div className="space-y-1 min-w-0 flex-1">
                                <p className="font-semibold text-slate-800 break-words leading-relaxed">{sug.suggestion_text}</p>
                                <p className="text-[10px] text-slate-400 font-bold">
                                  By {sug.citizen?.full_name || "Citizen"}
                                </p>
                              </div>
                            </div>

                            {/* Replies list */}
                            {sug.replies && sug.replies.length > 0 && (
                              <div className="pl-6 space-y-2 border-l border-slate-100 ml-4">
                                {sug.replies.map((reply, rIdx) => {
                                  const replyAvatarUrl = reply.citizen?.avatar_url
                                    ? (reply.citizen.avatar_url.startsWith('http')
                                        ? reply.citizen.avatar_url
                                        : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8001'}${reply.citizen.avatar_url}`)
                                    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.citizen?.full_name || 'Citizen'}`;

                                  return (
                                    <div key={rIdx} className="flex items-start gap-2 bg-slate-50/50 p-2 rounded-lg">
                                      <img
                                        src={replyAvatarUrl}
                                        alt={reply.citizen?.full_name || "Citizen"}
                                        className="w-6 h-6 rounded-full object-cover border border-slate-100 shrink-0"
                                        onError={(e) => {
                                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.citizen?.full_name || 'Citizen'}`;
                                        }}
                                      />
                                      <div className="min-w-0">
                                        <p className="font-medium text-slate-700 break-words">{reply.reply_text}</p>
                                        <p className="text-[9px] text-slate-400 font-bold">
                                          By {reply.citizen?.full_name || "Citizen"}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Reply Input Box */}
                            <form onSubmit={(e) => handleReplySubmit(e, sug.id)} className="flex items-center gap-2 pl-6 ml-4">
                              <input
                                type="text"
                                placeholder="Type a reply..."
                                value={replyTexts[sug.id] || ""}
                                onChange={(e) => setReplyTexts(prev => ({ ...prev, [sug.id]: e.target.value }))}
                                className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                              />
                              <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shadow-sm transition-colors">
                                Reply
                              </button>
                            </form>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )})
          }
        </CardContent>
      </Card>

      {/* Completed Meetings Archive */}
      <Card className="overflow-hidden border-slate-100 shadow-md">
        <CardHeader title="Gram Sabha Meeting Archives" subtitle="Past completed meetings, resolutions (nishkarsh), and public suggestions" />
        
        {/* Quick History Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-slate-50/50 border-b border-slate-100">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Completed Meetings</p>
              <p className="text-lg font-black text-slate-900">{completed.length} Sessions</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Last Sabha Date</p>
              <p className="text-lg font-black text-slate-900">
                {completed.length > 0 ? new Date(completed[0].date_time).toLocaleDateString("en-IN") : "No past meetings"}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {completed.map(meet => {
              const isExpanded = expandedMeetings[meet.id];
              return (
              <div key={meet.id} className="p-6 hover:bg-slate-50/30 transition-colors border-l-4 border-indigo-500 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 text-slate-950 font-bold text-base">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span>Gram Sabha — {new Date(meet.date_time).toLocaleDateString("en-IN")}</span>
                      </div>
                      
                      {meet.started_at && meet.completed_at && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-emerald-500" />
                          Active: {formatTime(meet.started_at)} to {formatTime(meet.completed_at)} ({getMeetingDuration(meet.started_at, meet.completed_at)})
                        </span>
                      )}
                    </div>

                    {/* Agenda & Parsed Badges */}
                    <div className="space-y-1.5">
                      {(() => {
                        const { tags, content } = parseAgenda(meet.agenda);
                        const typeTag = tags.find(t => t.toLowerCase().startsWith('type:'));
                        const officerTag = tags.find(t => t.toLowerCase().startsWith('officer:'));
                        const typeVal = typeTag ? typeTag.split(':')[1] : null;
                        const officerVal = officerTag ? officerTag.split(':')[1] : null;

                        return (
                          <>
                            <div className="flex flex-wrap gap-2">
                              {typeVal && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-slate-200">
                                  Meeting: {typeVal}
                                </span>
                              )}
                              {officerVal && (
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-indigo-100">
                                  Presided By: {officerVal}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">
                              <span className="font-bold text-slate-700">Agenda:</span> {content}
                            </p>
                          </>
                        );
                      })()}
                    </div>

                    {/* Outcome (Nishkarsh) */}
                    {meet.resolutions && (
                      <div className="bg-gradient-to-r from-amber-50 to-amber-50/30 border border-amber-100 rounded-2xl p-4 max-w-2xl shadow-sm">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1.5">
                          <FileText className="w-3.5 h-3.5 text-amber-500" />
                          <span>Panchayat Nishkarsh (Outcomes & Resolutions)</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-line bg-white/70 p-3 rounded-xl border border-amber-100/50">
                          {meet.resolutions}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Attachment & View Document */}
                  {meet.minutes_url ? (
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <a href={meet.minutes_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs font-bold border-indigo-100 hover:bg-indigo-50">
                          {meet.minutes_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                            <>
                              <Eye className="w-4 h-4 text-indigo-500" /> View Image
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 text-indigo-500" /> Minutes PDF
                            </>
                          )}
                        </Button>
                      </a>
                      {meet.minutes_url.match(/\.(jpeg|jpg|gif|png|webp)/i) && (
                        <div className="mt-1 max-w-[120px] rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white p-1">
                          <img
                            src={meet.minutes_url}
                            alt="Minutes Preview"
                            className="w-full h-auto object-cover cursor-zoom-in hover:scale-105 transition-transform rounded-lg"
                            onClick={() => window.open(meet.minutes_url, "_blank")}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-bold uppercase italic shrink-0">No minutes uploaded</span>
                  )}
                </div>

                {/* Toggleable citizen suggestions */}
                {meet.suggestions && meet.suggestions.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => setExpandedMeetings(prev => ({ ...prev, [meet.id]: !prev[meet.id] }))}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50/50 hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100/50"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      <span>
                        {isExpanded ? "Hide Discussions" : `Show Discussions & Suggestions (${meet.suggestions.length})`}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="space-y-2 mt-3 max-w-3xl border-t border-slate-100/50 pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        {meet.suggestions.map((sug, idx) => {
                          const avatarUrl = sug.citizen?.avatar_url
                            ? (sug.citizen.avatar_url.startsWith('http')
                                ? sug.citizen.avatar_url
                                : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8001'}${sug.citizen.avatar_url}`)
                            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${sug.citizen?.full_name || 'Citizen'}`;

                          return (
                            <div key={idx} className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50 text-xs flex flex-col gap-2 shadow-sm">
                              <div className="flex items-start gap-2.5">
                                <img
                                  src={avatarUrl}
                                  alt={sug.citizen?.full_name || "Citizen"}
                                  className="w-6 h-6 rounded-full object-cover border border-slate-100 shrink-0"
                                  onError={(e) => {
                                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${sug.citizen?.full_name || 'Citizen'}`;
                                  }}
                                />
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <p className="font-semibold text-slate-800 break-words leading-relaxed">{sug.suggestion_text}</p>
                                  <p className="text-[9px] text-slate-400 font-bold">
                                    By {sug.citizen?.full_name || "Citizen"}
                                  </p>
                                </div>
                              </div>

                              {/* Replies list */}
                              {sug.replies && sug.replies.length > 0 && (
                                <div className="pl-5 space-y-1.5 border-l border-slate-200 ml-3">
                                  {sug.replies.map((reply, rIdx) => {
                                    const replyAvatarUrl = reply.citizen?.avatar_url
                                      ? (reply.citizen.avatar_url.startsWith('http')
                                          ? reply.citizen.avatar_url
                                          : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8001'}${reply.citizen.avatar_url}`)
                                      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.citizen?.full_name || 'Citizen'}`;

                                    return (
                                      <div key={rIdx} className="flex items-start gap-2 bg-white/70 p-2 rounded-lg border border-slate-100/30">
                                        <img
                                          src={replyAvatarUrl}
                                          alt={reply.citizen?.full_name || "Citizen"}
                                          className="w-5 h-5 rounded-full object-cover border border-slate-100 shrink-0"
                                          onError={(e) => {
                                            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.citizen?.full_name || 'Citizen'}`;
                                          }}
                                        />
                                        <div className="min-w-0">
                                          <p className="font-medium text-slate-700 break-words">{reply.reply_text}</p>
                                          <p className="text-[8px] text-slate-400 font-bold">
                                            By {reply.citizen?.full_name || "Citizen"}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )})}
          </div>
        </CardContent>
      </Card>

      {/* Modern Completion Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setCompleteModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-6">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                 <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Complete Meeting</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Upload the meeting minutes PDF URL to mark this session as officially completed.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Minutes Document (Upload Image/Doc or Paste URL)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="https://drive.google.com/..." 
                    value={minutesUrl} 
                    onChange={e => setMinutesUrl(e.target.value)}
                    className="flex-1 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-xl p-3.5 text-sm font-semibold transition-all outline-none" 
                  />
                  <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-4 py-3.5 text-sm font-semibold cursor-pointer shrink-0 transition-colors flex items-center justify-center border border-slate-200 gap-1.5">
                    <Download className="w-4 h-4 rotate-180" /> Upload File
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,application/pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const formData = new FormData();
                          formData.append("file", file);
                          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
                          const res = await fetch(`${apiUrl}/upload`, {
                            method: "POST",
                            body: formData
                          });
                          const data = await res.json();
                          if (data.secure_url) {
                            setMinutesUrl(data.secure_url);
                            showToast("File uploaded successfully!", "success");
                          } else {
                            showToast("Upload failed: " + (data.error || "Unknown error"), "error");
                          }
                        } catch (error) {
                          console.error(error);
                          showToast("Upload error occurred.", "error");
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Summary / Message (Resolutions)</label>
                <textarea
                  placeholder="Summarize key decisions, outcomes, or notes from the meeting..."
                  value={resolutions}
                  onChange={e => setResolutions(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-xl p-3.5 text-sm font-semibold transition-all outline-none min-h-[80px] resize-none"
                />
              </div>
              <Button onClick={submitComplete} className="w-full py-6 rounded-xl text-md font-bold bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20">
                Confirm & Complete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reschedule/Postpone Modal */}
      {postponeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setPostponeModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-6">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
                 <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Postpone Gram Sabha</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Select a new date & time and provide a reason to notify citizens.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Date & Time</label>
                <input 
                  type="datetime-local" 
                  required 
                  value={postponeDate} 
                  onChange={e => setPostponeDate(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-amber-500/20 focus:bg-white rounded-xl p-3.5 text-sm font-semibold transition-all outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Postponement Reason / Message</label>
                <textarea
                  placeholder="Explain why the meeting is postponed..."
                  value={postponeReason}
                  onChange={e => setPostponeReason(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-amber-500/20 focus:bg-white rounded-xl p-3.5 text-sm font-semibold transition-all outline-none min-h-[80px] resize-none"
                />
              </div>
              <Button onClick={handlePostponeSubmit} className="w-full py-6 rounded-xl text-md font-bold bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-600/20 text-white">
                Reschedule & Notify
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setCancelModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-6">
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-4">
                 <XCircle className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 text-rose-600">Cancel Gram Sabha</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">This will cancel the meeting. Provide a cancellation reason to notify all citizens.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancellation Reason / Message</label>
                <textarea
                  placeholder="Explain why the meeting is cancelled..."
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-500/20 focus:bg-white rounded-xl p-3.5 text-sm font-semibold transition-all outline-none min-h-[80px] resize-none"
                />
              </div>
              <Button onClick={handleCancelSubmit} className="w-full py-6 rounded-xl text-md font-bold bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/20 text-white">
                Cancel Meeting & Notify
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modern Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-sm text-white ${
            toast.type === "error" ? "bg-rose-600 shadow-rose-600/20" : "bg-slate-900 shadow-slate-900/20"
          }`}>
            {toast.type === "error" ? (
              <XCircle className="w-5 h-5 text-rose-200" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            )}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
