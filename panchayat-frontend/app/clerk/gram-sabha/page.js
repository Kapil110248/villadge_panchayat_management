"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar, MapPin, Users, CheckCircle, Clock, UserCheck, X, Search, FileText, ChevronRight, AlertCircle, Download } from "lucide-react";
import { api } from "@/lib/api";

export default function ClerkGramSabha() {
  const [meetings, setMeetings] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const [currentMeeting, setCurrentMeeting] = useState(null);

  // Form states
  const [citizenId, setCitizenId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [resolutions, setResolutions] = useState("");
  const [minutesUrl, setMinutesUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => { 
    fetchData(); 
    // Update current time every minute to refresh UI conditions dynamically
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const [meetingsData, citizensData] = await Promise.all([
        api.get("/gram-sabha", token),
        api.get("/citizens", token)
      ]);
      setMeetings(meetingsData);
      setCitizens(citizensData?.citizens || []);
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

  const showMessage = (msg, isError = false) => {
    if (isError) { setErrorMsg(msg); setTimeout(() => setErrorMsg(""), 3000); }
    else { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3000); }
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    if (!citizenId) return;
    try {
      const token = localStorage.getItem("accessToken");
      await api.post(`/gram-sabha/${currentMeeting?.id}/attendance?citizen_id=${citizenId}`, {}, token);
      showMessage("Attendance marked successfully!");
      setCitizenId("");
      setIsAttendanceModalOpen(false);
      fetchData();
    } catch (e) { showMessage(e.message || "Failed to mark attendance", true); }
  };

  const handleResolutionSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/gram-sabha/${currentMeeting?.id}/minutes`, { resolutions, minutes_url: minutesUrl }, token);
      showMessage("Meeting completed and resolutions saved!");
      setResolutions("");
      setMinutesUrl("");
      setIsResolutionModalOpen(false);
      fetchData();
    } catch (e) { showMessage(e.message, true); }
  };

  const scheduled = meetings.filter(m => m.status === "scheduled");
  const completed = meetings.filter(m => m.status === "completed");

  const filteredCitizens = citizens.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.aadhaar?.includes(searchQuery)
  );

  return (
    <div className="space-y-8 relative">
      {/* Messages */}
      {successMsg && (
        <div className="fixed top-20 right-8 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-20 right-8 bg-rose-500 text-white px-6 py-3 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold">{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
          <Users className="w-3 h-3" /> Gram Sabha — Clerk View
        </div>
        <h1 className="text-4xl font-black text-slate-900">Gram Sabha Attendance</h1>
        <p className="text-slate-500 font-medium mt-1">Manage attendance and record outcomes during active meetings.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scheduled</p><h3 className="text-3xl font-black text-slate-900">{scheduled.length}</h3></div>
          </div>
        </Card>
        <Card className="p-6 border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Completed</p><h3 className="text-3xl font-black text-slate-900">{completed.length}</h3></div>
          </div>
        </Card>
        <Card className="p-6 border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Meetings</p><h3 className="text-3xl font-black text-slate-900">{meetings.length}</h3></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active & Scheduled Meetings (Main Area) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Calendar className="w-6 h-6 text-indigo-500" /> Active & Scheduled</h2>
          {loading ? <p className="text-center py-8 text-slate-400">Loading...</p> :
            scheduled.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100">
                <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-lg font-bold text-slate-400">No active meetings</p>
                <p className="text-sm text-slate-400 mt-2">There are currently no meetings scheduled.</p>
              </div>
            ) : scheduled.map(meet => {
              const meetingTime = new Date(meet.date_time);
              const meetingEndTime = new Date(meetingTime.getTime() + 6 * 60 * 60 * 1000); // 6 hours window
              
              const isFuture = currentTime < meetingTime;
              const isOngoing = currentTime >= meetingTime && currentTime <= meetingEndTime;
              const isExpired = currentTime > meetingEndTime;

              return (
              <div key={meet.id} className={`p-8 bg-white border border-slate-100 rounded-3xl shadow-lg shadow-slate-100 hover:shadow-xl transition-all space-y-6 relative overflow-hidden`}>
                {isOngoing && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}

                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  {isOngoing ? (
                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-black rounded-full uppercase tracking-wider flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>Live Now</span>
                  ) : isFuture ? (
                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full uppercase tracking-wider flex items-center gap-2">Upcoming</span>
                  ) : (
                    <span className="px-4 py-1.5 bg-rose-50 text-rose-600 text-xs font-black rounded-full uppercase tracking-wider flex items-center gap-2">Expired</span>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-bold bg-slate-50 px-4 py-2 rounded-xl">
                    <Clock className="w-4 h-4 text-indigo-500" /> {meetingTime.toLocaleString("en-IN")}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Meeting Agenda (Mudda)</h3>
                  <div className="bg-slate-50/50 p-4 rounded-2xl">
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

                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-600 bg-slate-50 px-5 py-3 rounded-2xl">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-500" />{meet.location}</div>
                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                  <div className="flex items-center gap-2 text-indigo-600"><UserCheck className="w-4 h-4" /> Attendance: {meet.attendance?.length || 0} Citizens</div>
                </div>

                <div className="pt-2">
                  {isFuture && (
                    <div className="bg-slate-50 border border-slate-200 text-slate-500 text-sm font-bold py-4 rounded-xl text-center flex items-center justify-center gap-2">
                      <Clock className="w-5 h-5 text-slate-400" /> Actions will be enabled when the meeting starts.
                    </div>
                  )}
                  {isExpired && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold py-4 rounded-xl text-center flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Meeting time window has expired.</div>
                      <span className="text-xs text-rose-400 font-medium">This meeting must be completed by an administrator.</span>
                    </div>
                  )}
                  {isOngoing && (
                    <div className="flex flex-wrap items-center gap-3">
                      <Button onClick={() => { setCurrentMeeting(meet); setIsAttendanceModalOpen(true); }} className="bg-white border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 gap-2 rounded-xl font-bold transition-all flex-1 py-6">
                        <UserCheck className="w-5 h-5" /> Mark Citizen Attendance
                      </Button>
                      <Button onClick={() => { setCurrentMeeting(meet); setIsResolutionModalOpen(true); }} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-2 border-emerald-200 gap-2 rounded-xl font-bold transition-all flex-1 py-6">
                        <CheckCircle className="w-5 h-5" /> Complete & Add Resolutions
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )})
          }
        </div>

        {/* Past Meetings (Sidebar) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><FileText className="w-6 h-6 text-slate-500" /> Past Records</h2>
          <div className="space-y-4">
            {completed.length === 0 ? (
               <div className="text-center py-10 bg-white rounded-3xl shadow-sm border border-slate-100">
                 <p className="text-sm font-bold text-slate-400">No past records</p>
               </div>
            ) : completed.map(meet => (
              <div key={meet.id} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 text-sm">{new Date(meet.date_time).toLocaleDateString("en-IN")}</h4>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-wider">Completed</span>
                </div>
                <div className="space-y-3 flex-1">
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
                  {meet.resolutions && (
                    <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Resolutions (Niwarn)</p>
                      <p className="text-xs text-indigo-900 font-medium line-clamp-2 mt-1">{meet.resolutions}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-3 border-t border-slate-50 mt-auto">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {meet.attendance?.length || 0} Attended</span>
                    <button onClick={() => { setCurrentMeeting(meet); setIsDetailsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* Attendance Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 slide-in-from-bottom-4 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-slate-900">Mark Attendance</h2>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6 font-medium">Select a citizen from the village directory to mark them as present.</p>
            
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input type="text" placeholder="Search by name or aadhaar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900" />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-6">
              {filteredCitizens.length === 0 ? (
                <p className="text-center text-slate-400 font-medium py-8">No citizens found matching your search.</p>
              ) : filteredCitizens.map(citizen => (
                <div key={citizen.id} onClick={() => setCitizenId(citizen.id)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${citizenId === citizen.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                  <div>
                    <h4 className={`font-bold ${citizenId === citizen.id ? 'text-indigo-900' : 'text-slate-900'}`}>{citizen.name}</h4>
                    <p className="text-xs font-medium text-slate-500">ID: {citizen.id} • Aadhaar: **** {citizen.aadhaar?.slice(-4) || 'N/A'}</p>
                  </div>
                  {citizenId === citizen.id && <CheckCircle className="w-6 h-6 text-indigo-600" />}
                </div>
              ))}
            </div>

            <Button onClick={handleAttendanceSubmit} disabled={!citizenId} className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl py-6 font-bold text-lg shadow-lg shadow-slate-200">
              Mark Citizen Present
            </Button>
          </div>
        </div>
      )}

      {/* Resolutions Modal */}
      {isResolutionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Complete Meeting</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Add resolutions (niwarn) to mark this meeting as completed.</p>
              </div>
              <button onClick={() => setIsResolutionModalOpen(false)} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResolutionSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Resolutions & Outcomes (Niwarn)</label>
                <textarea required rows={6} placeholder="Summarize the decisions made, issues resolved, and next steps..." value={resolutions} onChange={e => setResolutions(e.target.value)} className="w-full px-5 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-emerald-950 resize-none text-base placeholder:text-emerald-300" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Minutes Document (Upload Image/Doc or Paste URL)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="https://drive.google.com/..." 
                    value={minutesUrl} 
                    onChange={e => setMinutesUrl(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-500/20 focus:bg-white rounded-xl p-3 text-xs font-semibold outline-none transition-all" 
                  />
                  <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-4 py-3 text-xs font-semibold cursor-pointer shrink-0 transition-colors flex items-center justify-center border border-slate-200 gap-1.5">
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
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 font-bold text-lg shadow-lg shadow-emerald-200 mt-2 flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6" /> Save Resolutions & Complete
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Meeting Details Modal (Past History) */}
      {isDetailsModalOpen && currentMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg uppercase tracking-wider mb-2 inline-block">Historical Record</span>
                <h2 className="text-2xl font-black text-slate-900">Meeting Details</h2>
                <p className="text-sm text-slate-500 font-bold mt-1"><Clock className="w-4 h-4 inline mr-1" /> {new Date(currentMeeting.date_time).toLocaleString("en-IN")}</p>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="w-10 h-10 bg-white shadow-sm hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 space-y-8">
              {/* Agenda */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Agenda (Mudda)</h3>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                  {(() => {
                    const { tags, content } = parseAgenda(currentMeeting.agenda);
                    return (
                      <>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {tags.map((tag, i) => {
                              const [key, val] = tag.split(':');
                              return (
                                <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-indigo-100 flex items-center gap-1">
                                  <span className="text-indigo-400">{key}:</span> {val || ''}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-slate-800 font-medium leading-relaxed">{content}</p>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Resolutions */}
              {currentMeeting.resolutions && (
                <div>
                  <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Resolutions (Niwarn)</h3>
                  <p className="text-emerald-900 font-medium leading-relaxed bg-emerald-50 border border-emerald-100 p-5 rounded-2xl shadow-sm">{currentMeeting.resolutions}</p>
                </div>
              )}

              {/* Attendance List */}
              <div>
                <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Attendance Log ({currentMeeting.attendance?.length || 0})</h3>
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                  {(!currentMeeting.attendance || currentMeeting.attendance.length === 0) ? (
                    <p className="p-6 text-center text-slate-500 font-medium">No attendance recorded for this meeting.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {currentMeeting.attendance.map((att, idx) => (
                        <div key={idx} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50">
                          <div>
                            <p className="font-bold text-slate-900">{att.citizen?.full_name || 'Unknown Citizen'}</p>
                            <p className="text-xs text-slate-500 font-medium">Citizen ID: {att.citizen_id}</p>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full"><CheckCircle className="w-3 h-3 inline mr-1" />Present</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
