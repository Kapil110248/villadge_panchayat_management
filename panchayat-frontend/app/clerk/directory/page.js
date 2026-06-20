"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Users, Search, Download } from "lucide-react";
import { api } from "@/lib/api";

export default function ClerkDirectory() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchDirectory(); }, []);

  const fetchDirectory = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/directory", token);
      setCitizens(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filtered = citizens.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 text-violet-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
          <Users className="w-3 h-3" /> Village Directory — Clerk View
        </div>
        <h1 className="text-4xl font-black text-slate-900">Citizen Directory</h1>
        <p className="text-slate-500 font-medium mt-1">Search and view registered village residents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search by name, email or phone..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none shadow-sm" />
        </div>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center"><Users className="w-6 h-6 text-violet-600" /></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p><h3 className="text-2xl font-black text-slate-900">{citizens.length}</h3></div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Registered Citizens" subtitle={`${filtered.length} records`} />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Citizen</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ward</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading...</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xs font-black">{c.full_name?.charAt(0) || "?"}</div>
                        <span className="text-sm font-bold text-slate-900">{c.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{c.email || "—"}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{c.phone || "—"}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{c.profile?.ward_number || "—"}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400">{c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN") : "—"}</td>
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
