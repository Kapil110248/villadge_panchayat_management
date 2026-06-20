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

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/gram-sabha", token);
      setMeetings(data);
      // Find the first scheduled meeting to accept suggestions
      const scheduled = data.find(m => m.status === "scheduled");
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
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full uppercase tracking-wider">
                        Upcoming Meeting
                      </span>
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                        <Calendar className="w-4 h-4" />
                        {new Date(meet.date_time).toLocaleString("en-IN")}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">Agenda:</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium bg-white p-4 rounded-2xl border border-slate-100">
                      {meet.agenda}
                    </p>

                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      Location: {meet.location}
                    </div>

                    {/* Suggestions list for this meeting */}
                    {meet.suggestions && meet.suggestions.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                          Sadasya Suggestions ({meet.suggestions.length})
                        </h4>
                        <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                          {meet.suggestions.map((sug, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100/50 text-xs">
                              <p className="font-semibold text-slate-800">{sug.suggestion_text}</p>
                              <p className="text-[10px] text-slate-400 mt-1 font-bold">
                                By {sug.citizen?.full_name || "Citizen"}
                              </p>
                            </div>
                          ))}
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
                      <p className="text-xs text-slate-500 font-semibold truncate max-w-md">{meet.agenda}</p>
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
