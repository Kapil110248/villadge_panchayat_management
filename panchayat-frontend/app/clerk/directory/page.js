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
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);
  const [vaultDocs, setVaultDocs] = useState([]);

  useEffect(() => {
    if (selectedCitizen) {
      fetchVaultDocs(selectedCitizen.id);
    } else {
      setVaultDocs([]);
    }
  }, [selectedCitizen]);

  const fetchVaultDocs = async (userId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const docs = await api.get(`/citizen/vault-documents/${userId}`, token);
      setVaultDocs(docs || []);
    } catch (e) {
      console.error(e);
      const savedDocsStr = localStorage.getItem(`vault_docs_${userId}`);
      if (savedDocsStr) setVaultDocs(JSON.parse(savedDocsStr));
    }
  };

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
                  <tr key={c.id} onClick={() => setSelectedCitizen(c)} className="border-b border-slate-50 hover:bg-violet-50/50 transition-all duration-300 group cursor-pointer">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div onClick={(e) => {
                          e.stopPropagation();
                          const imgUrl = c.avatar_url || c.profile?.avatar_url;
                          if (imgUrl) {
                            setSelectedImage(imgUrl.startsWith('http') ? imgUrl : `http://localhost:8001${imgUrl}`);
                          }
                        }} className={`w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform duration-300 overflow-hidden ${(c.avatar_url || c.profile?.avatar_url) ? 'cursor-pointer' : ''}`}>
                          {c.avatar_url || c.profile?.avatar_url ? (
                            <img src={(c.avatar_url || c.profile?.avatar_url).startsWith('http') ? (c.avatar_url || c.profile?.avatar_url) : `http://localhost:8001${c.avatar_url || c.profile?.avatar_url}`} alt={c.full_name} className="w-full h-full object-cover" />
                          ) : (
                            c.full_name?.charAt(0) || "?"
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-black text-slate-900 block group-hover:text-violet-700 transition-colors">{c.full_name}</span>
                          {c.profile?.father_name && (
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">S/O: {c.profile.father_name}</span>
                          )}
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

      {/* Detailed Citizen Profile Modal */}
      {selectedCitizen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200 overflow-hidden rounded-[2rem]">
            <button onClick={() => setSelectedCitizen(null)} className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            
            <CardContent className="p-0">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-violet-600 to-indigo-700 p-8 text-white flex items-center gap-5">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-black border border-white/20 overflow-hidden">
                  {selectedCitizen.avatar_url || selectedCitizen.profile?.avatar_url ? (
                    <img 
                      src={(selectedCitizen.avatar_url || selectedCitizen.profile?.avatar_url).startsWith('http') 
                        ? (selectedCitizen.avatar_url || selectedCitizen.profile?.avatar_url) 
                        : `http://localhost:8001${selectedCitizen.avatar_url || selectedCitizen.profile?.avatar_url}`} 
                      alt={selectedCitizen.full_name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    selectedCitizen.full_name?.charAt(0) || "?"
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{selectedCitizen.full_name}</h3>
                  <p className="text-violet-200 text-sm font-semibold mt-1">Citizen ID: #{selectedCitizen.id} • Registered Villager</p>
                </div>
              </div>
              
              <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Personal Details</h4>
                    
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Guardian / Father's Name</p>
                      <p className="text-sm font-bold text-slate-800">{selectedCitizen.profile?.father_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aadhaar Number</p>
                      <p className="text-sm font-bold text-slate-800">{selectedCitizen.profile?.aadhaar_number || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date of Birth</p>
                      <p className="text-sm font-bold text-slate-800">
                        {selectedCitizen.profile?.date_of_birth 
                          ? new Date(selectedCitizen.profile.date_of_birth).toLocaleDateString("en-IN", {day: '2-digit', month: 'long', year: 'numeric'}) 
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gender</p>
                      <p className="text-sm font-bold text-slate-800 capitalize">{selectedCitizen.profile?.gender || "—"}</p>
                    </div>
                  </div>
                  
                  {/* Contact & Location details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Contact & Scope</h4>
                    
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mobile Number</p>
                      <p className="text-sm font-bold text-slate-800">{selectedCitizen.mobile || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-bold text-slate-800">{selectedCitizen.email || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Panchayat Ward</p>
                      <p className="text-sm font-bold text-slate-800">
                        {selectedCitizen.family?.ward_number || selectedCitizen.family_head?.ward_number || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pincode</p>
                      <p className="text-sm font-bold text-slate-800">{selectedCitizen.profile?.pincode || "—"}</p>
                    </div>
                  </div>
                </div>
                
                {/* Full Address */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Primary Residence Address</h4>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {selectedCitizen.profile?.address || "—"}
                  </p>
                </div>
                
                {/* Family details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Family Mappings</h4>
                  {selectedCitizen.family_head ? (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500">This citizen is a Family Head. Mapped members:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedCitizen.family_head.members?.map((m) => {
                          const name = m.full_name || m.name || "";
                          const relation = m.bio || m.relation || "Family Member";
                          const age = m.date_of_birth ? new Date().getFullYear() - new Date(m.date_of_birth).getFullYear() : (m.age ? m.age : "N/A");
                          const avatar = m.avatar_url || m.profile?.avatar_url;
                          return (
                            <div 
                              key={m.id} 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFamilyMember(m);
                              }}
                              className="p-3 bg-violet-50/50 hover:bg-violet-100/50 border border-violet-100 hover:border-violet-200 rounded-xl flex items-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                              <div className="w-8 h-8 bg-violet-100 text-violet-700 rounded-lg flex items-center justify-center font-black text-xs overflow-hidden shrink-0">
                                {avatar ? (
                                  <img src={avatar.startsWith('http') ? avatar : `http://localhost:8001${avatar}`} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                  name.charAt(0) || "?"
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800">{name}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{relation} • {age} {typeof age === 'number' ? 'Years' : ''}</p>
                              </div>
                            </div>
                          );
                        })}
                        {(!selectedCitizen.family_head.members || selectedCitizen.family_head.members.length === 0) && (
                          <p className="text-xs text-slate-400 italic">No family members mapped yet.</p>
                        )}
                      </div>
                    </div>
                  ) : selectedCitizen.family ? (
                    <div>
                      <p className="text-xs font-bold text-slate-600">
                        Mapped to Family Head: <span className="font-extrabold text-violet-700">{selectedCitizen.family.head_name}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Relation: {selectedCitizen.family.members?.find(m => m.name === selectedCitizen.full_name)?.relation || "Member"}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No mapped household family unit found.</p>
                  )}
                </div>

                {/* Vault Documents */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Uploaded Vault Documents</h4>
                  {vaultDocs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No documents uploaded to vault yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {vaultDocs.map((d, index) => {
                        const fileUrl = d.url ? (d.url.startsWith('http') ? d.url : `http://localhost:8001${d.url}`) : '';
                        return (
                          <div 
                            key={index} 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (fileUrl) window.open(fileUrl, '_blank');
                            }}
                            className="p-3.5 bg-slate-50 hover:bg-violet-50/50 border border-slate-100 hover:border-violet-200 rounded-2xl flex items-center justify-between group transition-all cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-violet-100 text-violet-700 rounded-xl flex items-center justify-center font-black text-xs">
                                PDF
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-violet-700 transition-colors">{d.name}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{d.docType || "Document"}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-violet-600 group-hover:underline">View File</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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

      {/* Selected Family Member Sub-Modal */}
      {selectedFamilyMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md relative shadow-2xl border-0 animate-in fade-in zoom-in-95 duration-200 overflow-hidden rounded-[2rem] bg-white">
            <button onClick={() => setSelectedFamilyMember(null)} className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-6 text-white flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-black border border-white/20 overflow-hidden shrink-0">
                  {selectedFamilyMember.avatar_url || selectedFamilyMember.profile?.avatar_url ? (
                    <img 
                      src={(selectedFamilyMember.avatar_url || selectedFamilyMember.profile?.avatar_url).startsWith('http') 
                        ? (selectedFamilyMember.avatar_url || selectedFamilyMember.profile?.avatar_url) 
                        : `http://localhost:8001${selectedFamilyMember.avatar_url || selectedFamilyMember.profile?.avatar_url}`} 
                      alt={selectedFamilyMember.full_name || selectedFamilyMember.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    (selectedFamilyMember.full_name || selectedFamilyMember.name || "?").charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">{selectedFamilyMember.full_name || selectedFamilyMember.name}</h3>
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mt-0.5">{selectedFamilyMember.bio || selectedFamilyMember.relation || "Family Member"}</p>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Date of Birth</p>
                    <p className="text-xs font-bold text-slate-800">
                      {selectedFamilyMember.date_of_birth || selectedFamilyMember.dob
                        ? new Date(selectedFamilyMember.date_of_birth || selectedFamilyMember.dob).toLocaleDateString("en-IN", {day: '2-digit', month: 'long', year: 'numeric'}) 
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Gender</p>
                    <p className="text-xs font-bold text-slate-800 capitalize">{selectedFamilyMember.profile?.gender || selectedFamilyMember.gender || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Mobile Number</p>
                    <p className="text-xs font-bold text-slate-800">{selectedFamilyMember.mobile || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{selectedFamilyMember.email || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Aadhaar Number</p>
                    <p className="text-xs font-bold text-slate-800">{selectedFamilyMember.profile?.aadhaar_number || "—"}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Residence Address</p>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedFamilyMember.profile?.address || selectedFamilyMember.address || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
