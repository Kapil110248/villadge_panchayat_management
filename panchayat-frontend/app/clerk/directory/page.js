"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Users, Search, Download, MapPin, Mail, Phone, Calendar, X } from "lucide-react";
import { api } from "@/lib/api";

export default function ClerkDirectory() {
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
    <div className="space-y-8 relative">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-violet-50/80 to-transparent -z-10 rounded-3xl" />

      <div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-sm border border-violet-200/50">
          <Users className="w-3.5 h-3.5" /> Village Directory — Clerk View
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-700 tracking-tight">Citizen Directory</h1>
        <p className="text-slate-500 font-medium mt-2 text-lg">Search and view registered village residents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        <div className="lg:col-span-3 relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search citizens by name, email or phone..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 font-bold text-slate-900 shadow-xl shadow-slate-200/40 transition-all placeholder:text-slate-400 placeholder:font-semibold" 
          />
        </div>
        <Card className="p-5 flex items-center gap-5 bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-0 shadow-2xl shadow-violet-500/30 rounded-[2rem]">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-black text-violet-200 uppercase tracking-widest mb-0.5">Total Citizens</p>
            <h3 className="text-4xl font-black text-white">{citizens.length}</h3>
          </div>
        </Card>
      </div>

      <Card className="border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden rounded-[2rem]">
        <div className="p-6 border-b border-slate-50 bg-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">Registered Citizens</h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">Showing {filtered.length} records</p>
          </div>
        </div>
        <CardContent className="p-0 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left bg-slate-50/50">
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Citizen</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Ward / Area</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Registered Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-16 text-center text-slate-400 font-bold animate-pulse text-lg">Loading citizens...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-bold text-lg">No citizens found</p>
                        <p className="text-slate-400 text-sm mt-1">Try adjusting your search criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-violet-50/50 transition-all duration-300 group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div onClick={() => {
                          const imgUrl = c.avatar_url || c.profile?.avatar_url;
                          if (imgUrl) {
                            setSelectedImage(imgUrl.startsWith('http') ? imgUrl : `http://localhost:8000${imgUrl}`);
                          }
                        }} className={`w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform duration-300 overflow-hidden ${(c.avatar_url || c.profile?.avatar_url) ? 'cursor-pointer' : ''}`}>
                          {c.avatar_url || c.profile?.avatar_url ? (
                            <img src={(c.avatar_url || c.profile?.avatar_url).startsWith('http') ? (c.avatar_url || c.profile?.avatar_url) : `http://localhost:8000${c.avatar_url || c.profile?.avatar_url}`} alt={c.full_name} className="w-full h-full object-cover" />
                          ) : (
                            c.full_name?.charAt(0) || "?"
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-black text-slate-900 block group-hover:text-violet-700 transition-colors">{c.full_name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Citizen ID: #{c.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {c.mobile || "—"}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {c.email || "—"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-xl text-xs font-black uppercase tracking-wider border border-violet-100">
                        <MapPin className="w-3.5 h-3.5" />
                        {c.family?.ward_number || c.family_head?.ward_number || c.profile?.village || "Not Assigned"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Calendar className="w-4 h-4 text-slate-300" />
                        {c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN", {day: '2-digit', month: 'short', year: 'numeric'}) : "—"}
                      </div>
                    </td>
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
