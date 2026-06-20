"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ClipboardList, UserCheck, Clock, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function ClerkAttendance() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/attendance/staff", token);
      setStaff(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleMarkAttendance = async (employee) => {
    const status = prompt("Enter status (present / absent / leave):", "present");
    if (!status) return;
    try {
      const token = localStorage.getItem("accessToken");
      const now = new Date();
      await api.post("/attendance/mark", {
        employee_id: employee.id,
        status: status,
        check_in: now.toLocaleTimeString("en-IN"),
        check_out: null
      }, token);
      alert(`${employee.name} marked as ${status}`);
      fetchStaff();
    } catch (e) { alert(e.message); }
  };

  const todayStr = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const totalPresent = staff.filter(s => s.attendance?.some(a => {
    const aDate = new Date(a.date).toDateString();
    return aDate === new Date().toDateString() && a.status === "present";
  })).length;

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 text-sky-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
          <ClipboardList className="w-3 h-3" /> Staff Attendance — Clerk View
        </div>
        <h1 className="text-4xl font-black text-slate-900">Staff Attendance</h1>
        <p className="text-slate-500 font-medium mt-1">{todayStr}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center"><ClipboardList className="w-6 h-6 text-sky-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Staff</p><h3 className="text-2xl font-black text-slate-900">{staff.length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center"><UserCheck className="w-6 h-6 text-emerald-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Present Today</p><h3 className="text-2xl font-black text-slate-900">{totalPresent}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center"><Clock className="w-6 h-6 text-amber-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending Leaves</p><h3 className="text-2xl font-black text-slate-900">{staff.reduce((n, s) => n + (s.leave_requests?.filter(l => l.status === "pending").length || 0), 0)}</h3></div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Daily Register" subtitle="Mark attendance for panchayat employees" />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Records</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Today</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading staff...</td></tr>
                ) : staff.map(s => {
                  const todayAtt = s.attendance?.find(a => new Date(a.date).toDateString() === new Date().toDateString());
                  return (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-black">{s.name?.charAt(0) || "?"}</div>
                          <span className="text-sm font-bold text-slate-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase">{s.designation}</span></td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-600">{s.attendance?.length || 0}</td>
                      <td className="px-6 py-4">
                        {todayAtt ? (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${todayAtt.status === "present" ? "bg-emerald-500/10 text-emerald-700" : todayAtt.status === "absent" ? "bg-rose-500/10 text-rose-700" : "bg-amber-500/10 text-amber-700"}`}>{todayAtt.status}</span>
                        ) : (
                          <span className="text-xs text-slate-400 font-bold italic">Not Marked</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => handleMarkAttendance(s)} className="text-xs rounded-xl gap-1">
                          <CheckCircle className="w-3 h-3" /> Mark
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
