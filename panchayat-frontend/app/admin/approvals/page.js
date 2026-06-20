"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, CheckCircle, XCircle, User, Shield, X } from "lucide-react";
import { api } from "@/lib/api";

export default function ApprovalPage() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [processing, setProcessing] = useState(null);

  const fetchApprovals = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/modules/certificates", token);
      const pending = data.filter(c => c.status === "pending" || c.status === "verified");
      setApprovals(pending);
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

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/modules/certificates/approve/${id}?remarks=Digitally Signed by Admin`, {}, token);
      showToast("Certificate Approved & Signed Successfully!", "success");
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
      await api.put(`/modules/certificates/reject/${id}?remarks=${encodeURIComponent(reason)}`, {}, token);
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Final Approvals</h1>
        <p className="text-slate-500">Clerk verified applications waiting for your digital signature</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading approvals...</div>
      ) : (
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
                      <h3 className="text-lg font-bold text-slate-900 capitalize">{app.certificate_type} Certificate</h3>
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
                        <span className="text-sm font-semibold">{new Date(app.created_at).toLocaleDateString('en-IN')}</span>
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
                  <Button variant="ghost" className="flex-1 text-xs">View History</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {!loading && approvals.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Sab Kaam Ho Gaya!</h3>
          <p className="text-slate-500">Abhi koi application approval ke liye nahi hai.</p>
        </div>
      )}
    </div>
  );
}
