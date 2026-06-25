"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, CheckCircle, XCircle, ExternalLink, Clock, Search, X, RefreshCw, UploadCloud, Send } from "lucide-react";
import { api } from "@/lib/api";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   className: "bg-blue-100 text-blue-700"   },
  forwarded: { label: "Forwarded", className: "bg-amber-100 text-amber-700" },
  approved:  { label: "Approved",  className: "bg-emerald-100 text-emerald-700" },
  rejected:  { label: "Rejected",  className: "bg-rose-100 text-rose-700"   },
};

export default function CertificateVerification() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  // Remarks modal state
  const [remarksModal, setRemarksModal] = useState(null); // { certId, action }
  const [remarks, setRemarks] = useState("");
  const [issueFile, setIssueFile] = useState(null);
  const [viewModal, setViewModal] = useState(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await api.get("/certificates", token);
      // Backend returns array directly
      setCertificates(Array.isArray(res) ? res : res.certificates || []);
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCertificates(); }, []);

  const handleVerify = async (certId) => {
    setRemarksModal({ certId, action: "verify" });
    setRemarks("");
  };

  const handleReject = async (certId) => {
    setRemarksModal({ certId, action: "reject" });
    setRemarks("");
    setIssueFile(null);
  };

  const handleIssue = async (certId) => {
    setRemarksModal({ certId, action: "issue" });
    setRemarks("");
    setIssueFile(null);
  };

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const confirmAction = async () => {
    if (!remarksModal) return;
    const { certId, action } = remarksModal;
    const token = localStorage.getItem("accessToken");
    setActionLoading(certId);
    try {
      if (action === "verify") {
        await api.put(`/certificates/verify/${certId}`, { remarks }, token);
        showToast("Certificate verified and pushed to Admin successfully!", "success");
      } else if (action === "reject") {
        await api.put(`/certificates/reject/${certId}`, { remarks }, token);
        showToast("Certificate rejected and noted.", "error");
      } else if (action === "issue") {
        if (!issueFile) {
          showToast("Please select a certificate PDF file to upload.", "error");
          setActionLoading(null);
          return;
        }
        
        // Upload the file first
        const formData = new FormData();
        formData.append("file", issueFile);
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
        const uploadRes = await fetch(`${apiUrl}/upload`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });
        
        if (!uploadRes.ok) throw new Error("File upload failed");
        const uploadData = await uploadRes.json();
        const certificate_url = uploadData.secure_url;

        await api.put(`/certificates/issue/${certId}`, { remarks, certificate_url }, token);
        showToast("Certificate directly issued successfully!", "success");
      }
      setRemarksModal(null);
      fetchCertificates();
    } catch (err) {
      showToast("Action failed. Please try again.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCerts = certificates.filter(cert => {
    const name = cert.citizen?.full_name || "";
    const type = cert.certificate_type || "";
    const appNum = cert.application_number || "";
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appNum.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatType = (cert) => {
    const type = cert?.certificate_type;
    if (!type) return "Certificate";
    if (type.toLowerCase() === 'other' && cert.data?.other_certificate_name) {
      return cert.data.other_certificate_name.charAt(0).toUpperCase() + cert.data.other_certificate_name.slice(1) + " Certificate";
    }
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ") + " Certificate";
  };

  const counts = {
    all: certificates.length,
    pending: certificates.filter(c => c.status === "pending" && !c.processed_by_id).length,
    forwarded: certificates.filter(c => c.status === "pending" && c.processed_by_id).length,
    approved: certificates.filter(c => c.status === "approved").length,
    rejected: certificates.filter(c => c.status === "rejected").length,
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Certificate Verification</h1>
          <p className="text-slate-500">Naye applications ki janch karein aur aage bhejein</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCertificates} className="flex items-center gap-2 self-start sm:self-auto">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: "all",       label: "Total",     color: "bg-slate-100 text-slate-700" },
          { key: "pending",   label: "Pending",   color: "bg-blue-100 text-blue-700" },
          { key: "forwarded", label: "Forwarded", color: "bg-amber-100 text-amber-700" },
          { key: "approved",  label: "Approved",  color: "bg-emerald-100 text-emerald-700" },
          { key: "rejected",  label: "Rejected",  color: "bg-rose-100 text-rose-700" },
        ].map(s => (
          <button key={s.key} onClick={() => setStatusFilter(s.key)}
            className={`p-3 rounded-xl text-left border transition-all ${statusFilter === s.key ? "border-primary ring-2 ring-primary/20" : "border-slate-200 hover:border-slate-300"} bg-white shadow-sm`}>
            <p className={`text-2xl font-black ${s.color.split(" ")[1]}`}>{counts[s.key]}</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, type or App no..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-full text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 bg-white"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400 font-bold animate-pulse">Loading certificates...</div>
        ) : filteredCerts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-bold">No certificates found</div>
        ) : filteredCerts.map((cert) => {
          let displayStatus = cert.status || "pending";
          if (displayStatus === "pending" && cert.processed_by_id) {
            displayStatus = "forwarded";
          }
          const cfg = STATUS_CONFIG[displayStatus] || STATUS_CONFIG.pending;
          const isPending = displayStatus === "pending";
          return (
            <Card key={cert.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {/* Info */}
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{cert.citizen?.full_name || "Unknown Citizen"}</h4>
                          <p className="text-xs text-slate-500">Applied for {formatType(cert)}</p>
                          {cert.purpose && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">Purpose: {cert.purpose}</p>}
                        </div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase shrink-0 ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5 uppercase tracking-widest text-[10px] font-bold">Application No.</span>
                        <span className="font-bold text-slate-700 font-mono">{cert.application_number}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5 uppercase tracking-widest text-[10px] font-bold">Date Submitted</span>
                        <span className="font-bold text-slate-700">{formatDate(cert.submitted_at)}</span>
                      </div>
                      {cert.processed_at && (
                        <div>
                          <span className="text-slate-400 block mb-0.5 uppercase tracking-widest text-[10px] font-bold">Processed On</span>
                          <span className="font-bold text-slate-700">{formatDate(cert.processed_at)}</span>
                        </div>
                      )}
                      {cert.remarks && (
                        <div className="col-span-2">
                          <span className="text-slate-400 block mb-0.5 uppercase tracking-widest text-[10px] font-bold">Remarks</span>
                          <span className="font-medium text-slate-600 text-xs line-clamp-2">{cert.remarks}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 bg-slate-50 w-full md:w-56 flex flex-col justify-center space-y-2">
                    {cert.certificate_url ? (
                      <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                          <ExternalLink className="w-3.5 h-3.5 mr-2" /> View Certificate
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setViewModal(cert)} className="w-full justify-start text-xs">
                        <ExternalLink className="w-3.5 h-3.5 mr-2" /> View Details & Docs
                      </Button>
                    )}
                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleVerify(cert.id)}
                          disabled={actionLoading === cert.id}
                          className="w-full justify-start text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-2" />
                          Verify & Forward
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleIssue(cert.id)}
                          disabled={actionLoading === cert.id}
                          className="w-full justify-start text-xs bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Send className="w-3.5 h-3.5 mr-2" />
                          Issue Directly
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(cert.id)}
                          disabled={actionLoading === cert.id}
                          className="w-full justify-start text-xs text-rose-600 border-rose-100 hover:bg-rose-50"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-2" /> Reject
                        </Button>
                      </>
                    )}
                    {!isPending && (
                      <div className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg ${cfg.className}`}>
                        {displayStatus === "approved" ? <CheckCircle className="w-3.5 h-3.5" /> : displayStatus === "rejected" ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {cfg.label}
                      </div>
                    )}
                    {displayStatus === "forwarded" && (
                      <Button
                        size="sm"
                        onClick={() => handleIssue(cert.id)}
                        disabled={actionLoading === cert.id}
                        className="w-full justify-start text-xs bg-blue-600 hover:bg-blue-700 text-white mt-1"
                      >
                        <Send className="w-3.5 h-3.5 mr-2" />
                        Issue Certificate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Remarks Modal */}
      {remarksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">
                {remarksModal.action === "verify" ? "✅ Verify & Forward" : remarksModal.action === "issue" ? "📄 Issue Directly" : "❌ Reject Certificate"}
              </h3>
              <button onClick={() => setRemarksModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500">
              {remarksModal.action === "verify"
                ? "Admin ko bhejne se pehle yaha estimated time likhein (e.g. 'Approved in 2 days')."
                : remarksModal.action === "issue"
                ? "Final certificate PDF upload karein aur issue karein."
                : "Reject karne ka karan likhein."}
            </p>
            
            {remarksModal.action === "issue" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Upload Certificate PDF</label>
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={e => setIssueFile(e.target.files[0])}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 rounded-xl p-1"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Message / Remarks</label>
              <textarea
                rows={3}
                placeholder={remarksModal.action === "verify" ? "Will be approved in 2 days..." : remarksModal.action === "issue" ? "Certificate is ready to download..." : "Rejection reason..."}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-primary/60 resize-none"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setRemarksModal(null)}>Cancel</Button>
              <Button
                className={`flex-1 text-white ${remarksModal.action === "verify" ? "bg-emerald-600 hover:bg-emerald-700" : remarksModal.action === "issue" ? "bg-blue-600 hover:bg-blue-700" : "bg-rose-600 hover:bg-rose-700"}`}
                onClick={confirmAction}
                disabled={actionLoading !== null}
              >
                {actionLoading !== null ? "Processing..." : remarksModal.action === "verify" ? "Forward" : remarksModal.action === "issue" ? "Issue Now" : "Confirm Reject"}
              </Button>
            </div>
          </div>
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
            
            {/* Citizen Details */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <img src={viewModal.citizen?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + viewModal.citizen?.full_name} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-[3px] border-white shadow-md" />
              <div className="text-center sm:text-left flex-1">
                <h3 className="font-black text-xl text-slate-900">{viewModal.citizen?.full_name || "Unknown Citizen"}</h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                   <p className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">📞 {viewModal.citizen?.mobile || "Not Provided"}</p>
                   {viewModal.citizen?.aadhaar_number && <p className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">💳 {viewModal.citizen?.aadhaar_number.replace(/.(?=.{4})/g, 'x')}</p>}
                </div>
              </div>
            </div>

            {/* Submitted Form Data */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary" /> Submitted Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                   <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Certificate Type</p>
                   <p className="text-sm font-semibold text-slate-800 break-words capitalize">
                     {formatType(viewModal)}
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
                    <div key={key} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm shadow-slate-100/50 hover:border-primary/20 transition-colors">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{formattedKey}</p>
                      <p className="text-sm font-semibold text-slate-800 break-words">{value || "N/A"}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Documents */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary" /> Uploaded Documents
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {viewModal.data?.documents && Object.keys(viewModal.data.documents).length > 0 ? (
                  Object.entries(viewModal.data.documents).map(([docName, docUrl]) => (
                    <a key={docName} href={docUrl} target="_blank" rel="noopener noreferrer" className="group block relative overflow-hidden rounded-2xl border border-slate-200 hover:border-primary transition-colors shadow-sm">
                      <div className="aspect-square bg-slate-50 flex items-center justify-center p-2 relative">
                         {docUrl.toLowerCase().endsWith('.pdf') ? (
                           <div className="bg-rose-50 w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                             <FileText className="w-8 h-8 text-rose-500" />
                           </div>
                         ) : (
                           <img src={docUrl} alt={docName} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform" />
                         )}
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="bg-white text-slate-900 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-200">
                               <ExternalLink className="w-5 h-5" />
                            </div>
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
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

    </div>
  );
}
