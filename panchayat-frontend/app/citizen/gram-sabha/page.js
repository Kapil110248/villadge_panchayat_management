"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar, MapPin, MessageSquare, Download, AlertCircle, FileText, Send } from "lucide-react";
import { api } from "@/lib/api";

export default function CitizenGramSabha() {
  const [meetings, setMeetings] = useState([]);
  const [suggestion, setSuggestion] = useState("");
  const [activeMeetingId, setActiveMeetingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyTexts, setReplyTexts] = useState({});

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
      fetchMeetings();
    } catch (error) {
      console.error(error);
      alert("Reply submit karne me dikkat aayi.");
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

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

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/gram-sabha", token);
      setMeetings(data);
      // Find the first scheduled meeting in the future to accept suggestions
      const scheduled = data.find(m => m.status === "scheduled" && new Date(m.date_time) > new Date());
      if (scheduled) {
        setActiveMeetingId(scheduled.id);
      }
    } catch (error) {
      console.error("Failed to load meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion || !activeMeetingId) return;

    try {
      const token = localStorage.getItem("accessToken");
      await api.post(`/gram-sabha/${activeMeetingId}/suggestion`, {
        suggestion_text: suggestion
      }, token);
      alert("Aapka sujhaav (suggestion) submit ho gaya hai.");
      setSuggestion("");
      fetchMeetings();
    } catch (error) {
      console.error(error);
      alert("Sujhaav jama karne me dikkat aayi.");
    }
  };

  const activeMeeting = meetings.find(m => m.id === activeMeetingId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 mb-2">Gram Sabha</h1>
        <p className="text-slate-500 font-medium">Schedule checks, submit agenda suggestions, and read previous minutes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Meeting list & Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Schedules & Announcements" subtitle="Upcoming Gram Sabha meetings" />
            <CardContent className="space-y-6">
              {loading ? (
                <p className="text-center py-6 text-slate-400 font-medium">Loading meetings...</p>
              ) : meetings.filter(m => m.status === "scheduled").length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-500">Filhal koi scheduled meeting nahi hai.</p>
                </div>
              ) : (
                meetings.filter(m => m.status === "scheduled").map((meet) => (
                  <div key={meet.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {new Date(meet.date_time) > new Date() ? (
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full uppercase tracking-wider">
                          Upcoming Meeting
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-700 text-xs font-black rounded-full uppercase tracking-wider animate-pulse">
                          Awaiting Minutes / In Progress
                        </span>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                        <Calendar className="w-4 h-4" />
                        {new Date(meet.date_time).toLocaleString("en-IN")}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">Agenda:</h3>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                      {(() => {
                        const { tags, content } = parseAgenda(meet.agenda);
                        return (
                          <>
                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {tags.map((tag, i) => {
                                  const [key, val] = tag.split(':');
                                  return (
                                    <span key={i} className="px-2.5 py-1 bg-slate-50 text-indigo-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-indigo-100 shadow-sm flex items-center gap-1">
                                      <span className="text-indigo-400">{key}:</span> {val || ''}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                              {content}
                            </p>
                          </>
                        );
                      })()}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      Location: {meet.location}
                    </div>

                    {/* Suggestions list for this meeting */}
                    {meet.suggestions && meet.suggestions.length > 0 && (
                      <div className="space-y-3 mt-4">
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
                ))
              )}
            </CardContent>
          </Card>

          {/* Meeting history */}
          <Card>
            <CardHeader title="Meeting Archives" subtitle="Download resolutions and minutes of past meetings" />
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {meetings.filter(m => m.status === "completed").map((meet) => (
                  <div key={meet.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900">Gram Sabha - {new Date(meet.date_time).toLocaleDateString("en-IN")}</h4>
                      {(() => {
                        const { tags, content } = parseAgenda(meet.agenda);
                        return (
                          <div className="space-y-1">
                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
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
                            <p className="text-xs text-slate-500 font-semibold truncate max-w-md">{content}</p>
                          </div>
                        );
                      })()}
                    </div>
                    {meet.minutes_url ? (
                      <a href={meet.minutes_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="w-4 h-4" /> Minutes PDF
                        </Button>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 font-bold uppercase italic">Unavailable</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Suggestion Box */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200/50">
            <CardContent className="p-8 space-y-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg border border-indigo-100">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Sujhaav Box</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Gram Sabha meeting se pehle aap agenda ke vishay me apne sujhaav prastut kar sakte hain.
                </p>
              </div>

              {activeMeetingId ? (
                <form onSubmit={handleSuggestionSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Suggestion Description</label>
                    <textarea
                      placeholder="e.g. Ward 4 ki drainage cleaning vishay ko agenda me include kiya jaye."
                      className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none min-h-[120px] resize-none shadow-sm"
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
                    Submit Suggestion <Send className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <div className="p-4 bg-white rounded-xl border border-indigo-100 text-xs text-indigo-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Abhi koi active upcoming meeting nahi hai jiske liye suggestion accept kiye ja sakein.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
