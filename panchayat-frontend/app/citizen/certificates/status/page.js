"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { FileText, Clock, CheckCircle2, XCircle, Search, Filter, Download, AlertCircle, Loader2, X, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function MyCertificates() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const data = await api.get("/certificates", token);
        setApplications(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load your certificates.");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const getStatusStyles = (app) => {
    const s = app.status?.toLowerCase();
    if (s === "approved") return { color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2, label: "Approved" };
    if (s === "rejected") return { color: "text-rose-600", bg: "bg-rose-50", icon: XCircle, label: "Rejected" };
    if (s === "pending" && app.processed_by_id) return { color: "text-blue-600", bg: "bg-blue-50", icon: Search, label: "In Process" };
    return { color: "text-amber-600", bg: "bg-amber-50", icon: Clock, label: "Pending" };
  };

  const getStepProgress = (app) => {
    const s = app.status?.toLowerCase();
    if (s === "rejected") return -1;
    if (s === "approved") return 4;
    if (s === "pending" && app.processed_by_id) return 2;
    return 1; // Pending
  };

  const [deleteModal, setDeleteModal] = useState(null);

  const handleDelete = async (certId) => {
    setDeleteModal(certId);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`/certificates/${deleteModal}`, token);
      setApplications(applications.filter(app => app.id !== deleteModal));
      setDeleteModal(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete the application.");
      setDeleteModal(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
        <p className="font-bold">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mere Certificates</h1>
          <p className="text-slate-500 font-medium mt-1">Aapke dwara apply kiye gaye sabhi praman patro ka status</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <input 
              type="text" 
              placeholder="Search App ID or Type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 h-12 w-full rounded-xl border border-slate-200 bg-white text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 shadow-sm"
            />
          </div>
          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/10 appearance-none shadow-sm cursor-pointer"
            >
              <option value="all">All Certificates</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl flex items-center gap-3 border border-rose-100">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {applications.filter(app => {
          const searchMatch = !searchQuery || 
            app.application_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
            app.certificate_type.toLowerCase().includes(searchQuery.toLowerCase());
          const filterMatch = filterStatus === "all" || app.status?.toLowerCase() === filterStatus;
          return searchMatch && filterMatch;
        }).map((app) => {
          const { color, bg, icon: StatusIcon, label } = getStatusStyles(app);
          const progress = getStepProgress(app);
          const dateStr = new Date(app.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

          return (
            <Card key={app.id} className="rounded-[2rem] border-white shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/50 transition-all overflow-hidden group">
              <CardContent className="p-0">
                <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 capitalize tracking-tight">
                        {app.certificate_type.toLowerCase().includes('other') && app.data?.other_certificate_name 
                          ? app.data.other_certificate_name 
                          : app.certificate_type.replace('_', ' ')} Certificate
                      </h4>
                      <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">APP ID: {app.application_number}</p>
                    </div>
                  </div>

                  <div className="flex-1 md:text-center w-full md:w-auto border-y md:border-y-0 md:border-x border-slate-100 py-4 md:py-0 md:px-8">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Applied On</p>
                    <p className="text-base font-bold text-slate-900">{dateStr}</p>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-6 h-6 ${color}`} />
                      <span className={`text-base font-black ${color}`}>{label}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {app.status === "approved" && app.certificate_url ? (
                        <Button size="sm" onClick={() => window.open(app.certificate_url, '_blank')} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/30">
                          <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setViewModal(app)} className="rounded-xl font-bold bg-slate-50 border-slate-200 hover:bg-slate-100">Details & Docs</Button>
                      )}
                      
                      {app.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => handleDelete(app.id)} className="rounded-xl font-bold text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Stepper */}
                {progress !== -1 && (
                  <div className="bg-slate-50/50 border-t border-slate-100 px-8 py-6 flex items-center justify-between">
                     <div className="flex flex-col items-center gap-2 w-full">
                        <div className={`w-6 h-6 flex items-center justify-center rounded-full text-white ${progress >= 1 ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-slate-200'}`}>
                           <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className={`text-xs font-bold ${progress >= 1 ? 'text-primary' : 'text-slate-400'}`}>Submitted</span>
                     </div>
                     <div className={`flex-1 h-1 rounded-full mx-2 ${progress >= 2 ? 'bg-primary' : 'bg-slate-200'}`}></div>
                     
                     <div className="flex flex-col items-center gap-2 w-full">
                        <div className={`w-6 h-6 flex items-center justify-center rounded-full text-white ${progress >= 2 ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-slate-200'}`}>
                           {progress >= 2 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className={`text-xs font-bold ${progress >= 2 ? 'text-primary' : 'text-slate-400'}`}>Clerk Verified</span>
                     </div>
                     <div className={`flex-1 h-1 rounded-full mx-2 ${progress >= 3 ? 'bg-primary' : 'bg-slate-200'}`}></div>
                     
                     <div className="flex flex-col items-center gap-2 w-full">
                        <div className={`w-6 h-6 flex items-center justify-center rounded-full text-white ${progress >= 4 ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-slate-200'}`}>
                           {progress >= 4 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className={`text-xs font-bold ${progress >= 4 ? 'text-emerald-600' : 'text-slate-400'}`}>Admin Approved</span>
                     </div>
                  </div>
                )}
                {progress === -1 && (
                  <div className="bg-rose-50/50 border-t border-rose-100 px-8 py-4 flex items-center gap-3">
                     <XCircle className="w-5 h-5 text-rose-500" />
                     <span className="text-sm font-bold text-rose-700">Application Rejected: {app.remarks || "No reason provided."}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {!loading && applications.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 p-16 text-center rounded-[2.5rem] shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Abhi tak koi application nahi hai</h3>
          <p className="text-slate-500 mt-2 font-medium">Lagta hai aapne abhi tak kisi praman patra ke liye apply nahi kiya hai.</p>
          <Button onClick={() => window.location.href = "/citizen/certificates/apply"} className="mt-8 h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20">
             Pehla Certificate Apply Karein
          </Button>
        </div>
      )}

      {/* View Details Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 md:p-8 space-y-6 relative animate-in slide-in-from-bottom-8 duration-300">
            <button onClick={() => setViewModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            
            <div className="border-b border-slate-100 pb-4">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight">Application Details</h2>
               <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">APP ID: {viewModal.application_number}</p>
            </div>
            
            {/* Submitted Form Data */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Submitted Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                   <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Certificate Type</p>
                   <p className="text-sm font-semibold text-slate-800 break-words capitalize">
                     {viewModal.certificate_type.toLowerCase().includes('other') && viewModal.data?.other_certificate_name 
                        ? viewModal.data.other_certificate_name 
                        : viewModal.certificate_type.replace('_', ' ')}
                   </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                   <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Purpose</p>
                   <p className="text-sm font-semibold text-slate-800 break-words">{viewModal.purpose || "N/A"}</p>
                </div>
                
                {viewModal.data && Object.entries(viewModal.data).map(([key, value]) => {
                  if (key === 'documents' || key === 'other_certificate_name') return null;
                  const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  return (
                    <div key={key} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm shadow-slate-100/50">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{formattedKey}</p>
                      <p className="text-sm font-semibold text-slate-800 break-words">{value || "N/A"}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Remarks */}
            {viewModal.remarks && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Official Remarks / Message</h4>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-sm font-semibold text-blue-800 break-words">{viewModal.remarks}</p>
                </div>
              </div>
            )}

            {/* Documents */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Uploaded Documents</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {viewModal.data?.documents && Object.keys(viewModal.data.documents).length > 0 ? (
                  Object.entries(viewModal.data.documents).map(([docName, docUrl]) => (
                    <a key={docName} href={docUrl} target="_blank" rel="noopener noreferrer" className="group block relative overflow-hidden rounded-2xl border border-slate-200 hover:border-primary transition-colors shadow-sm">
                      <div className="aspect-square bg-slate-50 flex items-center justify-center p-2 relative">
                         {docUrl.toLowerCase().endsWith('.pdf') ? (
                           <FileText className="w-12 h-12 text-rose-500" />
                         ) : (
                           <img src={docUrl} alt={docName} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform" />
                         )}
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                         </div>
                      </div>
                      <div className="p-3 bg-white border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-700 truncate text-center capitalize">{docName.replace(/_/g, ' ')}</p>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="col-span-full p-6 bg-slate-50 rounded-2xl text-center text-sm font-medium text-slate-500 border border-slate-100">
                    No documents uploaded.
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 md:p-8 space-y-6 relative animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Delete Application?</h3>
                <p className="text-slate-500 font-medium mt-2">Kya aap sach me ye application delete karna chahte hain? Ye wapas nahi aayegi.</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold bg-slate-50 border-slate-200 hover:bg-slate-100" onClick={() => setDeleteModal(null)}>Cancel</Button>
              <Button className="flex-1 rounded-xl h-12 font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30" onClick={confirmDelete}>Yes, Delete</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
