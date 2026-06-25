"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ClipboardList, UserCheck, Clock, CheckCircle, X, History } from "lucide-react";
import { api } from "@/lib/api";

export default function ClerkAttendance() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [markingId, setMarkingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [historyEmployee, setHistoryEmployee] = useState(null);

  useEffect(() => { fetchStaff(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/attendance/staff", token);
      setStaff(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleMarkAttendance = async (employee, status) => {
    try {
      setMarkingId(employee.id);
      const token = localStorage.getItem("accessToken");
      const now = new Date();
      await api.post("/attendance/mark", {
        employee_id: employee.id,
        status: status,
        check_in: status === 'present' ? now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }) : null,
        check_out: null
      }, token);
      await fetchStaff();
      setEditingId(null);
      showToast(`${employee.name} marked as ${status}`);
    } catch (e) { showToast(e.message, "error"); }
    finally { setMarkingId(null); }
  };

  const todayStr = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const totalPresent = staff.filter(s => s.attendance?.some(a => {
    const aDate = new Date(a.date).toDateString();
    return aDate === new Date().toDateString() && a.status === "present";
  })).length;

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 ${toast.type === 'error' ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-emerald-500 text-white shadow-emerald-500/20'}`}>
          <CheckCircle className="w-5 h-5" />
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}

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
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Yearly Summary</th>
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
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{new Date().getFullYear()} Stats</span>
                          <div className="flex gap-2">
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">{s.attendance?.filter(a => new Date(a.date).getFullYear() === new Date().getFullYear() && a.status === 'absent').length || 0} Absent</span>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">{s.attendance?.filter(a => new Date(a.date).getFullYear() === new Date().getFullYear() && a.status === 'leave').length || 0} Leave</span>
                          </div>
                          <button onClick={() => setHistoryEmployee(s)} className="text-[10px] font-black text-sky-600 hover:text-sky-700 hover:underline uppercase tracking-wide mt-1 flex items-center gap-1 w-max transition-colors">
                            <History className="w-3 h-3" /> View History
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {todayAtt ? (
                          <div className="flex flex-col items-start gap-1.5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${todayAtt.status === "present" ? "bg-emerald-500/10 text-emerald-700 border border-emerald-200" : todayAtt.status === "absent" ? "bg-rose-500/10 text-rose-700 border border-rose-200" : "bg-amber-500/10 text-amber-700 border border-amber-200"}`}>
                              {todayAtt.status}
                            </span>
                            {todayAtt.status === 'present' && todayAtt.check_in && (
                              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {todayAtt.check_in}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-bold italic">Not Marked</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {todayAtt && editingId !== s.id ? (
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Recorded
                            </span>
                            <button onClick={() => setEditingId(s.id)} className="text-[10px] font-black uppercase text-sky-600 hover:text-sky-700 hover:underline transition-all">Edit</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleMarkAttendance(s, 'present')} 
                              disabled={markingId === s.id}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed ${todayAtt?.status === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200/50 scale-105' : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
                            >
                              Present
                            </button>
                            <button 
                              onClick={() => handleMarkAttendance(s, 'absent')} 
                              disabled={markingId === s.id}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed ${todayAtt?.status === 'absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200/50 scale-105' : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600'}`}
                            >
                              Absent
                            </button>
                            <button 
                              onClick={() => handleMarkAttendance(s, 'leave')} 
                              disabled={markingId === s.id}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed ${todayAtt?.status === 'leave' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200/50 scale-105' : 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-600'}`}
                            >
                              Leave
                            </button>
                            {editingId === s.id && (
                              <button onClick={() => setEditingId(null)} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 ml-2 transition-colors">Cancel</button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* History Modal */}
      {historyEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setHistoryEmployee(null)}>
          <div className="relative max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transform transition-all scale-100 opacity-100" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2"><History className="w-5 h-5 text-sky-500" /> Attendance History</h3>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{historyEmployee.name} • {historyEmployee.designation}</p>
              </div>
              <button onClick={() => setHistoryEmployee(null)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-900 shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 bg-white space-y-3">
              {historyEmployee.attendance?.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                    <History className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-bold text-sm">No attendance records found</p>
                  <p className="text-slate-400 text-xs mt-1">Attendance history will appear here.</p>
                </div>
              ) : (
                [...historyEmployee.attendance]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map(att => (
                  <div key={att.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shadow-sm ${att.status === 'present' ? 'bg-emerald-500 shadow-emerald-200' : att.status === 'absent' ? 'bg-rose-500 shadow-rose-200' : 'bg-amber-500 shadow-amber-200'}`} />
                      <span className="text-sm font-bold text-slate-700">{new Date(att.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", weekday: "short" })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {att.status === 'present' && att.check_in && (
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm"><Clock className="w-3 h-3 text-slate-300" /> {att.check_in}</span>
                      )}
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase shadow-sm border ${att.status === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : att.status === 'absent' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{att.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
