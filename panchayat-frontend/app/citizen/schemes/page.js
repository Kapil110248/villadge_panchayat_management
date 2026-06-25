"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BookOpen, CheckCircle, ArrowRight, Home, IndianRupee, Tractor, GraduationCap, X, AlertCircle, FileText } from "lucide-react";
import { api } from "@/lib/api";

const IconMap = {
  "Home": Home,
  "Tractor": Tractor,
  "GraduationCap": GraduationCap,
  "IndianRupee": IndianRupee,
  "BookOpen": BookOpen
};

export default function SchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [applying, setApplying] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [formResponses, setFormResponses] = useState({});
  const [uploadingField, setUploadingField] = useState(null);
  const [viewingApp, setViewingApp] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      const [schemesRes, appsRes] = await Promise.all([
        api.get('/citizen/schemes', token),
        api.get('/citizen/schemes/my-applications', token)
      ]);
      
      setSchemes(schemesRes.schemes || []);
      setApplications(appsRes.applications || []);
    } catch (error) {
      console.error("Error fetching schemes data", error);
      showToast("Failed to load schemes.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleApply = async (e) => {
    if (e) e.preventDefault();
    if (!selectedScheme) return;
    
    // Validate required fields
    if (selectedScheme.form_fields) {
      for (const field of selectedScheme.form_fields) {
        if (field.type !== 'note' && field.required && !formResponses[field.label]) {
          showToast(`Kripya "${field.label}" bharein.`, "error");
          return;
        }
      }
    }

    try {
      setApplying(true);
      const token = localStorage.getItem("accessToken");
      await api.post('/citizen/schemes/apply', 
        { 
          scheme_id: selectedScheme.id,
          form_data: formResponses
        },
        token
      );
      showToast("Application submitted successfully.");
      setSelectedScheme(null);
      setFormResponses({});
      fetchData(); // Refresh applications list
    } catch (error) {
      showToast(error.response?.data?.detail || "Failed to apply.", "error");
    } finally {
      setApplying(false);
    }
  };

  const handleConfirmCompletion = async (appId) => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/citizen/schemes/applications/${appId}/approve`, {}, token);
      showToast("Aapne scheme completion approve kar diya hai!");
      setViewingApp(null);
      fetchData(); // Refresh list
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  const hasApplied = (schemeId) => {
    return applications.some(app => app.scheme_id === schemeId);
  };

  const getSchemeBenefit = (scheme) => {
    if (!scheme) return "N/A";
    if (scheme.benefit) return scheme.benefit;
    if (scheme.description) {
      const match = scheme.description.match(/💰 Benefits:\s*([\s\S]+)$/i);
      if (match) return match[1].trim();
    }
    return 'N/A';
  };

  const renderContent = () => {
    if (loading) return <div className="text-center py-12 text-slate-500 font-medium">Loading schemes...</div>;

    if (activeTab === "My Applications") {
      if (applications.length === 0) return <div className="text-center py-12 text-slate-500 font-medium">You have not applied for any schemes yet.</div>;
      
      return (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{app.scheme.scheme_name}</h3>
                  <p className="text-sm text-slate-500">Applied on {new Date(app.submitted_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                    app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                    app.status === 'Ready' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {app.status === 'Ready' ? 'Action Taken' : app.status}
                  </div>
                  <Button size="sm" variant="outline" className="text-xs font-bold" onClick={() => setViewingApp(app)}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    // "All" tab
    if (schemes.length === 0) return <div className="text-center py-12 text-slate-500 font-medium">Koi scheme uplabdh nahi hai.</div>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {schemes.map((scheme) => {
          const IconComponent = IconMap[scheme.icon] || BookOpen;
          const isApplied = hasApplied(scheme.id);
          
          return (
            <Card key={scheme.id} className="group hover:border-primary/50 transition-all overflow-hidden cursor-pointer" onClick={() => { setSelectedScheme(scheme); setFormResponses({}); setUploadingField(null); }}>
              <CardContent className="p-0">
                 <div className="flex h-full">
                    <div className={`w-28 flex flex-col items-center justify-center gap-2 ${scheme.color_theme || 'bg-slate-100 text-slate-600'} border-r border-border/10`}>
                       <IconComponent className="w-10 h-10" />
                       <span className="text-[10px] font-bold uppercase text-center px-1">{scheme.category || 'General'}</span>
                    </div>
                    <div className="flex-1 p-6 space-y-4">
                       <div>
                          <div className="flex justify-between items-start">
                             <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{scheme.scheme_name}</h3>
                             {isApplied && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold uppercase">Applied</span>}
                          </div>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{scheme.description}</p>
                       </div>
                       <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                          <div>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">Benefit</p>
                             <p className="text-sm font-bold text-slate-900">{getSchemeBenefit(scheme)}</p>
                          </div>
                          <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10">
                             Details <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                       </div>
                    </div>
                 </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Government Schemes</h1>
          <p className="text-slate-500">Sarkari yojnaon ka labh uthayein</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-border">
          <button onClick={() => setActiveTab("All")} className={`px-4 py-1.5 text-sm font-medium rounded-md shadow-sm transition-colors ${activeTab === 'All' ? 'bg-primary text-white' : 'text-slate-600 hover:text-primary'}`}>All Schemes</button>
          <button onClick={() => setActiveTab("My Applications")} className={`px-4 py-1.5 text-sm font-medium rounded-md shadow-sm transition-colors ${activeTab === 'My Applications' ? 'bg-primary text-white' : 'text-slate-600 hover:text-primary'}`}>My Applications</button>
        </div>
      </div>

      {renderContent()}



      {/* Scheme Details Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-0 bg-white rounded-2xl">
            <div className="p-6 shrink-0 flex justify-between items-start border-b border-slate-100 pr-12">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedScheme.color_theme || 'bg-slate-100 text-slate-600'}`}>
                  {IconMap[selectedScheme.icon] ? (() => { const Icon = IconMap[selectedScheme.icon]; return <Icon className="w-6 h-6" />; })() : <BookOpen className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedScheme.scheme_name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedScheme.category || 'General'}</p>
                </div>
              </div>
              <Button variant="ghost" type="button" className="rounded-full w-10 h-10 p-0 hover:bg-rose-50 hover:text-rose-500" onClick={() => setSelectedScheme(null)}><X className="w-5 h-5" /></Button>
            </div>
            
            <form onSubmit={handleApply} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl whitespace-pre-wrap">{selectedScheme.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 rounded-xl">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Benefit</h4>
                     <p className="font-bold text-slate-900">{getSchemeBenefit(selectedScheme)}</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-xl">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Status</h4>
                     <p className="font-bold text-emerald-600">Active</p>
                   </div>
                </div>

                {/* Dynamic Form Fields */}
                {selectedScheme.form_fields && selectedScheme.form_fields.length > 0 && !hasApplied(selectedScheme.id) && (
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Application Details</h4>
                      <p className="text-xs text-slate-500 font-medium">Kripya aavedan ke liye niche diye gye details bharein</p>
                    </div>
                    
                    {selectedScheme.form_fields.map((field, idx) => {
                      if (field.type === 'note') {
                        return (
                          <div key={idx} className="p-3 bg-amber-50/60 border border-amber-100/70 text-amber-800 rounded-xl text-xs font-bold leading-relaxed">
                            📌 {field.label}
                          </div>
                        );
                      }
                      
                      return (
                        <div key={idx} className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            {field.label} {field.required && <span className="text-rose-500">*</span>}
                          </label>
                          
                          {field.type === 'file' ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-3">
                                <input
                                  type="file"
                                  required={field.required && !formResponses[field.label]}
                                  accept="image/*,application/pdf"
                                  disabled={uploadingField !== null}
                                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                  onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    if (file.size > 5 * 1024 * 1024) {
                                      showToast("File size must be less than 5MB.", "error");
                                      return;
                                    }
                                    
                                    setUploadingField(field.label);
                                    const fd = new FormData();
                                    fd.append('file', file);
                                    
                                    try {
                                      const token = localStorage.getItem("accessToken");
                                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
                                      const res = await fetch(`${apiUrl}/upload`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}` },
                                        body: fd,
                                      });
                                      if (!res.ok) throw new Error("Upload failed");
                                      const uploadData = await res.json();
                                      setFormResponses(prev => ({ ...prev, [field.label]: uploadData.secure_url }));
                                      showToast(`${field.label} upload ho gaya!`);
                                    } catch (err) {
                                      console.error(err);
                                      showToast("Failed to upload document. Try again.", "error");
                                    } finally {
                                      setUploadingField(null);
                                    }
                                  }}
                                />
                                {uploadingField === field.label && (
                                  <span className="text-xs text-primary font-bold animate-pulse">Uploading...</span>
                                )}
                              </div>
                              {formResponses[field.label] && (
                                <a href={formResponses[field.label]} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                                  ✓ View uploaded file
                                </a>
                              )}
                            </div>
                          ) : (
                            <input
                              type={field.type === 'number' ? 'number' : 'text'}
                              required={field.required}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-primary/20 focus:bg-white rounded-lg text-xs font-semibold outline-none transition-all"
                              value={formResponses[field.label] || ""}
                              onChange={(e) => {
                                setFormResponses({ ...formResponses, [field.label]: e.target.value });
                              }}
                              placeholder={`Enter ${field.label}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
                {hasApplied(selectedScheme.id) ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-center font-bold text-sm">
                    <CheckCircle className="w-5 h-5 inline-block mr-2 -mt-1" />
                    Aapne is scheme ke liye apply kar diya hai.
                  </div>
                ) : (
                  <Button type="submit" disabled={applying || uploadingField !== null} className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 font-bold shadow-lg shadow-primary/30 text-base">
                    {applying ? "Submitting Application..." : uploadingField ? "Waiting for Upload..." : "Apply Now"}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* View Application Details Modal (Citizen side) */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-lg relative shadow-2xl border-0 bg-white max-h-[90vh] flex flex-col overflow-hidden rounded-2xl">
            <button onClick={() => setViewingApp(null)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 pb-4 border-b border-slate-100 shrink-0 pr-12">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                  viewingApp.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                  viewingApp.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                  viewingApp.status === 'Ready' ? 'bg-indigo-100 text-indigo-700 animate-pulse' : 'bg-amber-100 text-amber-700'
                }`}>
                  {viewingApp.status === 'Ready' ? 'Action Taken / Ready' : viewingApp.status}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 font-sans">{viewingApp.scheme.scheme_name}</h2>
              <p className="text-xs font-bold text-slate-400">Applied on: {new Date(viewingApp.submitted_at).toLocaleDateString()}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-5 pr-4 scrollbar-thin min-h-0">
              {/* Submitted Details */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Your Submitted Details</h3>
                <div className="space-y-3">
                  {viewingApp.form_data && Object.keys(viewingApp.form_data).length > 0 ? (
                    Object.entries(viewingApp.form_data).map(([label, val]) => {
                      const isUrl = typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'));
                      const isImage = isUrl && (val.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || val.includes('/image/upload/'));
                      return (
                        <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</div>
                          <div className="mt-1 text-sm font-semibold text-slate-800 break-all pl-1">
                            {isUrl ? (
                              <div className="space-y-2 mt-1">
                                {isImage ? (
                                  <div className="relative group max-w-full md:max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-white p-1">
                                    <img src={val} alt={label} className="max-h-32 object-contain mx-auto w-full" />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100 w-fit">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <span>PDF / Document File</span>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <a href={val} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-[11px] font-bold transition-all">
                                    View File
                                  </a>
                                </div>
                              </div>
                            ) : (
                              val || <span className="text-slate-400 italic">Not provided</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-slate-400 text-xs italic pl-1">No custom fields submitted.</div>
                  )}
                </div>
              </div>
              
              {/* Admin Remarks & Output */}
              {(viewingApp.admin_remarks || viewingApp.result_file) && (
                <div className="border-t border-slate-100 pt-4">
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-3 pl-1 ${
                    viewingApp.status === 'Rejected' ? 'text-rose-500' : 'text-indigo-500'
                  }`}>
                    {viewingApp.status === 'Rejected' ? 'Rejection Details' : 'Panchayat Office Response'}
                  </h3>
                  <div className={`p-4 rounded-xl border ${
                    viewingApp.status === 'Rejected' 
                      ? 'bg-rose-50/50 border-rose-100/60' 
                      : 'bg-indigo-50/50 border-indigo-100/60'
                  } space-y-3`}>
                    {viewingApp.admin_remarks && (
                      <div>
                        <div className={`text-[10px] font-black uppercase tracking-widest ${
                          viewingApp.status === 'Rejected' ? 'text-rose-400' : 'text-indigo-400'
                        }`}>
                          {viewingApp.status === 'Rejected' ? 'Reason for Rejection' : 'Remarks / Message'}
                        </div>
                        <p className="text-sm font-semibold text-slate-800 mt-1 leading-relaxed whitespace-pre-wrap">{viewingApp.admin_remarks}</p>
                      </div>
                    )}
                    
                    {viewingApp.result_file && (
                      <div>
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Attached Document / Certificate</div>
                        {(() => {
                           const val = viewingApp.result_file;
                           const isImage = val.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || val.includes('/image/upload/');
                           return (
                             <div className="space-y-2">
                               {isImage ? (
                                 <div className="max-w-full md:max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-white p-1">
                                   <img src={val} alt="Result Document" className="max-h-36 object-contain mx-auto w-full" />
                                 </div>
                               ) : (
                                 <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-white p-2 rounded-lg border border-indigo-100 w-fit">
                                   <FileText className="w-4 h-4 text-indigo-600" />
                                   <span>PDF / Certificate Document</span>
                                 </div>
                               )}
                               <div className="flex gap-2">
                                 <a href={val} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold transition-all">
                                   View Certificate
                                 </a>
                                 <a href={val} download="Certificate" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-all">
                                   Download
                                 </a>
                               </div>
                             </div>
                           );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Citizen Action Bottom Bar */}
            {viewingApp.status === 'Ready' && (
              <div className="p-6 pt-4 border-t border-slate-100 shrink-0">
                <Button
                  onClick={() => handleConfirmCompletion(viewingApp.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4" /> Verify & Approve Completion
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} z-50 flex items-center gap-2 animate-in slide-in-from-bottom-5`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
