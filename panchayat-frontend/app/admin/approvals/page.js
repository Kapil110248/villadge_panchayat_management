"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, CheckCircle, XCircle, User, Shield, X } from "lucide-react";
import { api } from "@/lib/api";

export default function ApprovalPage() {
  const [approvals, setApprovals] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [processing, setProcessing] = useState(null);
  const [approveModal, setApproveModal] = useState(null);
  const [issueFile, setIssueFile] = useState(null);

  const fetchApprovals = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/certificates", token);
      const arr = Array.isArray(data) ? data : [];
      setApprovals(arr.filter(c => c.status === "pending" && c.processed_by_id));
      setHistory(arr.filter(c => c.status !== "pending" && c.processed_by_id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleApprove = (id) => {
    setApproveModal(id);
    setIssueFile(null);
  };

  const confirmApprove = async () => {
    if (!approveModal) return;
    const id = approveModal;
    setProcessing(id);
    try {
      const token = localStorage.getItem("accessToken");
      let certificate_url = null;
      if (issueFile) {
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
        certificate_url = uploadData.secure_url;
      }

      await api.put(`/certificates/approve/${id}`, { remarks: "Digitally Signed by Admin", certificate_url }, token);
      showToast("Certificate Approved & Signed Successfully!", "success");
      setApproveModal(null);
      setIssueFile(null);
      fetchApprovals();
    } catch (error) {
      showToast("Error: " + error.message, "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    
    setProcessing(id);
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/certificates/reject/${id}?remarks=${encodeURIComponent(reason)}`, {}, token);
      showToast("Certificate Rejected", "error");
      fetchApprovals();
    } catch (error) {
      showToast("Error: " + error.message, "error");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[60] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
           {toast.type === "success" ? <Shield className="w-5 h-5" /> : <X className="w-5 h-5" />}
           <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Final Approvals</h1>
          <p className="text-slate-500">Clerk verified applications waiting for your digital signature</p>
        </div>
        
        <div className="flex p-1 bg-slate-100 rounded-xl self-start">
          <button 
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "pending" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Pending ({approvals.length})
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "history" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            History ({history.length})
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-slate-500 font-medium">Loading approvals...</div>
      )}

      {!loading && activeTab === "pending" && (
        <div className="grid grid-cols-1 gap-6">
          {approvals.map((app) => (
            <Card key={app.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-3 rounded-xl">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 capitalize">
                          {app.certificate_type.toLowerCase() === 'other' && app.data?.other_certificate_name 
                            ? app.data.other_certificate_name 
                            : app.certificate_type} Certificate
                        </h3>
                        <p className="text-sm text-slate-500">App ID: {app.application_number}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-12 border-t border-slate-50 pt-4">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Citizen</p>
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm font-semibold">{app.citizen?.full_name || "Unknown"}</span>
                        </div>
                      </div>
                      <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status</p>
                          <span className="text-sm font-semibold text-amber-600 capitalize">{app.status}</span>
                      </div>
                      <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Applied Date</p>
                          <span className="text-sm font-semibold">{new Date(app.created_at || app.submitted_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                    <Button 
                      onClick={() => handleApprove(app.id)}
                      disabled={processing === app.id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> {processing === app.id ? "Processing..." : "Approve & Sign"}
                    </Button>
                    <Button 
                      onClick={() => handleReject(app.id)}
                      disabled={processing === app.id}
                      variant="outline" 
                      className="flex-1 text-rose-600 border-rose-100 hover:bg-rose-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && activeTab === "history" && (
        <div className="grid grid-cols-1 gap-6">
          {history.map((app) => (
            <Card key={app.id} className="hover:shadow-sm transition-shadow opacity-75 hover:opacity-100 border-l-4" style={{borderLeftColor: app.status === 'approved' ? '#10b981' : '#f43f5e'}}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${app.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {app.status === 'approved' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 capitalize">
                          {app.certificate_type.toLowerCase() === 'other' && app.data?.other_certificate_name 
                            ? app.data.other_certificate_name 
                            : app.certificate_type} Certificate
                        </h3>
                        <p className="text-sm text-slate-500">App ID: {app.application_number}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-12 border-t border-slate-50 pt-4">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Citizen</p>
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm font-semibold">{app.citizen?.full_name || "Unknown"}</span>
                        </div>
                      </div>
                      <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status</p>
                          <span className={`text-sm font-semibold capitalize ${app.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}`}>{app.status}</span>
                      </div>
                      <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Processed Date</p>
                          <span className="text-sm font-semibold">{new Date(app.processed_at || app.created_at || app.submitted_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                  {app.status === 'approved' && app.certificate_url && (
                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                      <a href={app.certificate_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full">
                          <FileText className="w-4 h-4 mr-2" /> View Certificate
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && activeTab === "pending" && approvals.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Sab Kaam Ho Gaya!</h3>
          <p className="text-slate-500">Abhi koi application approval ke liye nahi hai.</p>
        </div>
      )}

      {!loading && activeTab === "history" && history.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No History Yet</h3>
          <p className="text-slate-500">Aapne abhi tak koi application approve ya reject nahi ki hai.</p>
        </div>
      )}

      {/* Approve Modal */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Approve Certificate</h3>
              <button onClick={() => setApproveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500">
              Citizen ko bhejne ke liye final Certificate PDF upload karein.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Upload Final PDF</label>
              <input 
                type="file" 
                accept=".pdf"
                onChange={e => setIssueFile(e.target.files[0])}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-slate-200 rounded-xl p-1"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setApproveModal(null)}>Cancel</Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={confirmApprove}
                disabled={processing === approveModal}
              >
                {processing === approveModal ? "Processing..." : "Approve & Send"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
