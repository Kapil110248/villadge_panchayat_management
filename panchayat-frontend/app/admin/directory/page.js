"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, Search, Phone, Mail, MapPin, Download, X } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminDirectory() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

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
    c.mobile?.includes(search)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 text-violet-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
            <Users className="w-3 h-3" /> Village Directory
          </div>
          <h1 className="text-4xl font-black text-slate-900">Citizen Directory</h1>
          <p className="text-slate-500 font-medium mt-1">Complete registry of all registered village residents.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 rounded-2xl"><Download className="w-4 h-4" /> Export CSV</Button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 flex flex-col justify-center">
          <div className="relative w-full">
            <input type="text" placeholder="Search by name, email or phone..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none shadow-sm" />
          </div>
        </div>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center"><Users className="w-6 h-6 text-violet-600" /></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Citizens</p><h3 className="text-2xl font-black text-slate-900">{citizens.length}</h3></div>
        </Card>
      </div>

      {/* Directory Table */}
      <Card>
        <CardHeader title="Registered Citizens" subtitle={`Showing ${filtered.length} of ${citizens.length} records`} />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Citizen</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ward</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Family</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading directory...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No citizens found</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div onClick={() => {
                          const imgUrl = c.avatar_url || c.profile?.avatar_url;
                          if (imgUrl) {
                            setSelectedImage(imgUrl.startsWith('http') ? imgUrl : `http://localhost:8000${imgUrl}`);
                          }
                        }} className={`w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xs font-black overflow-hidden ${(c.avatar_url || c.profile?.avatar_url) ? 'cursor-pointer' : ''}`}>
                          {c.avatar_url || c.profile?.avatar_url ? (
                            <img src={(c.avatar_url || c.profile?.avatar_url).startsWith('http') ? (c.avatar_url || c.profile?.avatar_url) : `http://localhost:8000${c.avatar_url || c.profile?.avatar_url}`} alt={c.full_name} className="w-full h-full object-cover" />
                          ) : (
                            c.full_name?.charAt(0) || "?"
                          )}
                        </div>
                        <span className="text-sm font-bold text-slate-900">{c.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{c.email || "—"}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{c.mobile || "—"}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{c.family?.ward_number || c.family_head?.ward_number || "—"}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      {c.family_head ? `${(c.family_head.members?.length || 0) + 1} Member(s)` : (c.family ? "Family Member" : "—")}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400">{c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-2xl w-full max-h-[80vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors">
              <X className="w-8 h-8" />
            </button>
            <img src={selectedImage} alt="Citizen Avatar" className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
