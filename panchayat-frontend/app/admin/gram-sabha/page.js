"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar, MapPin, Users, Plus, FileText, CheckCircle, Send, Download, Eye, Clock, X } from "lucide-react";
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
  const [toastMessage, setToastMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => { 
    fetchMeetings(); 
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
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
      
      setToastMessage("Gram Sabha meeting scheduled successfully!");
      setTimeout(() => setToastMessage(""), 3000);
      setShowForm(false);
      setForm({ date_time: "", agenda: "", location: "", type: "Regular", presidingOfficer: "", quorum: "" });
      fetchMeetings();
    } catch (e) { alert(e.message); }
  };

  const openCompleteModal = (meetingId) => {
    setActiveMeetingId(meetingId);
    setMinutesUrl("");
    setCompleteModalOpen(true);
  };

  const submitComplete = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/admin/gram-sabha/${activeMeetingId}/minutes?minutes_url=${encodeURIComponent(minutesUrl || "")}`, {}, token);
      
      setToastMessage("Meeting marked as completed!");
      setTimeout(() => setToastMessage(""), 3000);
      setCompleteModalOpen(false);
      fetchMeetings();
    } catch (e) { alert(e.message); }
  };

  const scheduled = meetings.filter(m => m.status === "scheduled");
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
                
                {hasStarted ? (
                  <Button onClick={() => openCompleteModal(meet.id)} className="w-full sm:w-auto mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200">
                    <CheckCircle className="w-4 h-4 mr-2" /> Mark Completed & Upload Minutes
                  </Button>
                ) : (
                  <div className="text-xs text-slate-500 font-bold bg-white p-4 rounded-xl border border-slate-200/60 inline-flex items-center gap-2 mt-4">
                    <Clock className="w-4 h-4 text-slate-400" /> Actions will be enabled once the meeting starts.
                  </div>
                )}
              </div>
            )})
          }
        </CardContent>
      </Card>

      {/* Completed Meetings Archive */}
      <Card>
        <CardHeader title="Meeting Archives" subtitle="Past meetings with resolutions and minutes" />
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {completed.map(meet => {
              return (
              <div key={meet.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900">Gram Sabha — {new Date(meet.date_time).toLocaleDateString("en-IN")}</h4>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Agenda</p>
                    {(() => {
                      const { tags, content } = parseAgenda(meet.agenda);
                      return (
                        <>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {tags.slice(0, 2).map((tag, i) => {
                                const [key, val] = tag.split(':');
                                return (
                                  <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black rounded uppercase tracking-wider border border-slate-200">
                                    {key}: {val || ''}
                                  </span>
                                );
                              })}
                              {tags.length > 2 && <span className="text-[9px] font-bold text-slate-400">+{tags.length - 2} more</span>}
                            </div>
                          )}
                          <p className="text-xs text-slate-600 font-semibold line-clamp-2">{content}</p>
                        </>
                      );
                    })()}
                  </div>
                </div>
                {meet.minutes_url ? (
                  <a href={meet.minutes_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl"><Download className="w-4 h-4" /> Minutes PDF</Button>
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 font-bold uppercase italic">No minutes</span>
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
                          } else {
                            alert("Upload failed.");
                          }
                        } catch (error) {
                          console.error(error);
                          alert("Upload error.");
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <Button onClick={submitComplete} className="w-full py-6 rounded-xl text-md font-bold bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20">
                Confirm & Complete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modern Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
