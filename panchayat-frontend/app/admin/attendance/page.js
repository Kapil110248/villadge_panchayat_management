"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ClipboardList, UserCheck, UserX, Clock, Calendar, CheckCircle, X, Check, XCircle, FileText, History } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminAttendance() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markModalEmployee, setMarkModalEmployee] = useState(null);
  const [historyModalEmployee, setHistoryModalEmployee] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/attendance/staff", token);
      setStaff(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleMarkAttendance = async (status) => {
    if (!markModalEmployee) return;
    try {
      const token = localStorage.getItem("accessToken");
      const now = new Date();
      await api.post("/attendance/mark", {
        employee_id: markModalEmployee.id,
        status: status,
        check_in: now.toLocaleTimeString("en-IN"),
        check_out: null
      }, token);
      showToast(`${markModalEmployee.name} marked as ${status}`);
      setMarkModalEmployee(null);
      fetchStaff();
    } catch (e) { showToast(e.message, "error"); }
  };

  const todayStr = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const totalPresent = staff.filter(s => s.attendance?.some(a => {
    const aDate = new Date(a.date).toDateString();
    return aDate === new Date().toDateString() && a.status === "present";
  })).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 text-sky-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
            <ClipboardList className="w-3 h-3" /> Staff Management
          </div>
          <h1 className="text-4xl font-black text-slate-900">Staff Attendance</h1>
          <p className="text-slate-500 font-medium mt-1">{todayStr}</p>
        </div>
      </div>

      {/* Stats */}
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

      {/* Staff Table */}
      <Card>
        <CardHeader title="Employee Register" subtitle="Mark daily attendance for panchayat staff" />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Overall Present</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Overall Absent</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Overall Leave</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Today</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading staff...</td></tr>
                ) : staff.map(s => {
                  const todayAtt = s.attendance?.find(a => new Date(a.date).toDateString() === new Date().toDateString());
                  return (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-black">
                            {s.name?.charAt(0) || "?"}
                          </div>
                          <span className="text-sm font-bold text-slate-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase">{s.designation}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-700">
                          <Check className="w-3 h-3" />
                          <span className="text-sm font-black">{s.attendance?.filter(a => a.status === 'present').length || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-rose-50 rounded-lg border border-rose-100 text-rose-700">
                          <XCircle className="w-3 h-3" />
                          <span className="text-sm font-black">{s.attendance?.filter(a => a.status === 'absent').length || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg border border-amber-100 text-amber-700">
                          <FileText className="w-3 h-3" />
                          <span className="text-sm font-black">{s.attendance?.filter(a => a.status === 'leave').length || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {todayAtt ? (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${todayAtt.status === "present" ? "bg-emerald-500/10 text-emerald-700" : todayAtt.status === "absent" ? "bg-rose-500/10 text-rose-700" : "bg-amber-500/10 text-amber-700"}`}>
                            {todayAtt.status}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-bold italic">Not Marked</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setMarkModalEmployee(s)} className="text-xs rounded-xl gap-1">
                            <CheckCircle className="w-3 h-3" /> Mark
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setHistoryModalEmployee(s)} className="text-xs rounded-xl gap-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-200">
                            <History className="w-3 h-3" /> History
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modern Mark Attendance Modal */}
      {markModalEmployee && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Mark Attendance</h2>
                <p className="text-sm font-semibold text-slate-500">{markModalEmployee.name}</p>
              </div>
              <button onClick={() => setMarkModalEmployee(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => handleMarkAttendance('present')} className="flex items-center gap-3 w-full p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 transition-all text-left">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center"><Check className="w-5 h-5" /></div>
                <div><h4 className="font-bold text-sm">Present</h4><p className="text-xs opacity-70 font-semibold">Mark as present for today</p></div>
              </button>
              
              <button onClick={() => handleMarkAttendance('absent')} className="flex items-center gap-3 w-full p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 transition-all text-left">
                <div className="w-10 h-10 bg-rose-500/10 rounded-full flex items-center justify-center"><XCircle className="w-5 h-5" /></div>
                <div><h4 className="font-bold text-sm">Absent</h4><p className="text-xs opacity-70 font-semibold">Mark as absent for today</p></div>
              </button>
              
              <button onClick={() => handleMarkAttendance('leave')} className="flex items-center gap-3 w-full p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-700 transition-all text-left">
                <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                <div><h4 className="font-bold text-sm">On Leave</h4><p className="text-xs opacity-70 font-semibold">Mark on approved leave</p></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModalEmployee && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-sky-500/30">
                  {historyModalEmployee.name?.charAt(0) || "?"}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{historyModalEmployee.name}</h2>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-black rounded-full uppercase">{historyModalEmployee.designation}</span>
                </div>
              </div>
              <button onClick={() => setHistoryModalEmployee(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                  <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-1">Total Present</p>
                  <p className="text-2xl font-black text-emerald-700">{historyModalEmployee.attendance?.filter(a => a.status === 'present').length || 0} <span className="text-sm font-bold text-emerald-600/50">days</span></p>
                </div>
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100/50">
                  <p className="text-[10px] font-black text-rose-600/70 uppercase tracking-widest mb-1">Total Absent</p>
                  <p className="text-2xl font-black text-rose-700">{historyModalEmployee.attendance?.filter(a => a.status === 'absent').length || 0} <span className="text-sm font-bold text-rose-600/50">days</span></p>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
                  <p className="text-[10px] font-black text-amber-600/70 uppercase tracking-widest mb-1">Total Leave</p>
                  <p className="text-2xl font-black text-amber-700">{historyModalEmployee.attendance?.filter(a => a.status === 'leave').length || 0} <span className="text-sm font-bold text-amber-600/50">days</span></p>
                </div>
              </div>

              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><History className="w-4 h-4 text-slate-400" /> Attendance Log</h3>
              
              {(!historyModalEmployee.attendance || historyModalEmployee.attendance.length === 0) ? (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold">No attendance records found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...historyModalEmployee.attendance].sort((a,b) => new Date(b.date) - new Date(a.date)).map((record, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          record.status === 'present' ? 'bg-emerald-500/10 text-emerald-600' :
                          record.status === 'absent' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {record.status === 'present' ? <Check className="w-5 h-5" /> : record.status === 'absent' ? <XCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{new Date(record.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>
                          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {record.check_in || "--:--"}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${
                          record.status === 'present' ? 'bg-emerald-500/10 text-emerald-700' :
                          record.status === 'absent' ? 'bg-rose-500/10 text-rose-700' : 'bg-amber-500/10 text-amber-700'
                        }`}>
                        {record.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
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
