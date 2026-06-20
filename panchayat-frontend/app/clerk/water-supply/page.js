"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Droplets, Plus, AlertTriangle, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function ClerkWaterSupply() {
  const [schedules, setSchedules] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ area: "", timing: "", status: "active", notes: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const [sched, tankData] = await Promise.all([
        api.get("/water-supply", token),
        api.get("/water-supply/tanks", token)
      ]);
      setSchedules(sched);
      setTanks(tankData);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      await api.post("/water-supply", form, token);
      alert("Water schedule added!");
      setShowForm(false);
      setForm({ area: "", timing: "", status: "active", notes: "" });
      fetchData();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
            <Droplets className="w-3 h-3" /> Water Supply — Clerk View
          </div>
          <h1 className="text-4xl font-black text-slate-900">Water Supply</h1>
          <p className="text-slate-500 font-medium mt-1">Update ward water schedules and report interruptions.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 rounded-2xl shadow-xl shadow-cyan-200">
          <Plus className="w-5 h-5" /> Add Schedule
        </Button>
      </div>

      {showForm && (
        <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50/50 to-white">
          <CardContent className="p-8">
            <form onSubmit={handleCreate} className="space-y-6">
              <h3 className="text-lg font-black text-slate-900">New Water Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Area / Wards</label>
                  <input type="text" required value={form.area} onChange={e => setForm({...form, area: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timing</label>
                  <input type="text" required value={form.timing} onChange={e => setForm({...form, timing: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold outline-none">
                    <option value="active">Active</option>
                    <option value="interrupted">Interrupted</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
                  <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold outline-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl">Save</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-cyan-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Lines</p><h3 className="text-2xl font-black text-slate-900">{schedules.filter(s => s.status === "active").length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-rose-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Interrupted</p><h3 className="text-2xl font-black text-slate-900">{schedules.filter(s => s.status === "interrupted").length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center"><Droplets className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Water Tanks</p><h3 className="text-2xl font-black text-slate-900">{tanks.length}</h3></div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Schedules" subtitle="Ward-wise water distribution" />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Area</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timing</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(s => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{s.area}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{s.timing}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${s.status === "active" ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-700"}`}>{s.status}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{s.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
