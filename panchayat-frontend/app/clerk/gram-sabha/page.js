"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar, MapPin, Users, CheckCircle, Clock, UserCheck } from "lucide-react";
import { api } from "@/lib/api";

export default function ClerkGramSabha() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/gram-sabha", token);
      setMeetings(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleMarkAttendance = async (meetingId) => {
    const citizenId = prompt("Enter Citizen ID to mark attendance:");
    if (!citizenId) return;
    try {
      const token = localStorage.getItem("accessToken");
      await api.post(`/gram-sabha/${meetingId}/attendance?citizen_id=${citizenId}`, {}, token);
      alert("Attendance marked successfully!");
      fetchMeetings();
    } catch (e) { alert(e.message); }
  };

  const scheduled = meetings.filter(m => m.status === "scheduled");
  const completed = meetings.filter(m => m.status === "completed");

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
          <Users className="w-3 h-3" /> Gram Sabha — Clerk View
        </div>
        <h1 className="text-4xl font-black text-slate-900">Gram Sabha</h1>
        <p className="text-slate-500 font-medium mt-1">Manage meeting attendance and view scheduled sessions.</p>
      </div>

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

      <Card>
        <CardHeader title="Upcoming Meetings" subtitle="Mark citizen attendance for scheduled Gram Sabha" />
        <CardContent className="space-y-4">
          {loading ? <p className="text-center py-8 text-slate-400">Loading...</p> :
            scheduled.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-400">No upcoming meetings</p>
              </div>
            ) : scheduled.map(meet => (
              <div key={meet.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 text-xs font-black rounded-full uppercase tracking-wider">Upcoming</span>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-bold"><Clock className="w-4 h-4" />{new Date(meet.date_time).toLocaleString("en-IN")}</div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Agenda:</h3>
                <p className="text-sm text-slate-600 font-medium bg-white p-4 rounded-2xl border border-slate-100">{meet.agenda}</p>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500"><MapPin className="w-4 h-4 text-rose-500" />{meet.location}</div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <UserCheck className="w-4 h-4" /> Attendance Marked: {meet.attendance?.length || 0}
                </div>
                <Button onClick={() => handleMarkAttendance(meet.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-xl text-xs">
                  <UserCheck className="w-4 h-4" /> Mark Citizen Attendance
                </Button>
              </div>
            ))
          }
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Past Meetings" subtitle="Completed sessions archive" />
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {completed.map(meet => (
              <div key={meet.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                <h4 className="font-bold text-slate-900">Gram Sabha — {new Date(meet.date_time).toLocaleDateString("en-IN")}</h4>
                <p className="text-xs text-slate-500 font-semibold mt-1">{meet.agenda}</p>
                <p className="text-xs text-slate-400 font-bold mt-1">Attendance: {meet.attendance?.length || 0} members</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
