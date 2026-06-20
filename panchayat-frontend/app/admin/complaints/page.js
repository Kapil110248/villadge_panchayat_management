"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Clock, CheckCircle, AlertCircle, Search, Filter, Shield, X } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [messageModal, setMessageModal] = useState({ show: false, citizenName: "", message: "" });

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/admin/complaints", token);
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/admin/complaints/${id}/status`, { status: newStatus }, token);
      showToast(`Status updated to ${newStatus}`);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      showToast("Error updating status: " + err.message, "error");
    }
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (messageModal.message.trim()) {
      showToast(`Message sent to ${messageModal.citizenName}!`, "success");
      setMessageModal({ show: false, citizenName: "", message: "" });
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[60] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
           {toast.type === "success" ? <Shield className="w-5 h-5" /> : <X className="w-5 h-5" />}
           <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      {/* Review Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg p-6 relative shadow-2xl border-0">
            <button onClick={() => setSelectedComplaint(null)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900">Complaint Details</h2>
              <p className="text-sm font-medium text-slate-500">Ref: {selectedComplaint.ref_id}</p>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Citizen</label>
                <p className="text-sm font-bold text-slate-900">{selectedComplaint.citizen}</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                <div className="p-4 bg-slate-50 rounded-xl mt-1 text-sm font-medium text-slate-700">
                  {selectedComplaint.description || "No description provided."}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
               <Button onClick={() => handleStatusUpdate(selectedComplaint.id, "In Progress")} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200">
                 Mark In Progress
               </Button>
               <Button onClick={() => handleStatusUpdate(selectedComplaint.id, "Resolved")} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200">
                 Mark Resolved
               </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Message Modal */}
      {messageModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 relative shadow-2xl border-0">
            <button onClick={() => setMessageModal({ show: false, citizenName: "", message: "" })} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900">Direct Message</h2>
              <p className="text-sm font-medium text-slate-500">To: {messageModal.citizenName}</p>
            </div>
            <form onSubmit={handleMessageSubmit} className="space-y-4">
              <textarea 
                required 
                rows={4}
                className="w-full mt-1 p-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none resize-none" 
                value={messageModal.message} 
                onChange={e => setMessageModal({...messageModal, message: e.target.value})} 
                placeholder="Type your official message here..." 
              />
              <Button type="submit" className="w-full py-6 rounded-xl text-sm shadow-xl shadow-primary/20">
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
             <Shield className="w-3 h-3" /> Monitoring Grievances
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Complaint <span className="text-primary">Center</span></h1>
          <p className="text-slate-500 font-medium mt-1 italic">Monitor the resolution speed and citizen satisfaction.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-medium">No complaints found.</div>
      ) : (
      <div className="grid grid-cols-1 gap-4">
        {complaints.map((complaint) => (
          <Card key={complaint.id} className={complaint.urgent ? "border-l-4 border-l-rose-500" : ""}>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6 flex-1">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${complaint.status === 'Open' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                       <h4 className="text-xl font-black text-slate-900">{complaint.citizen}</h4>
                       <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-black uppercase tracking-widest">{complaint.category}</span>
                       {complaint.urgent && <span className="text-[10px] bg-rose-500 text-white px-2 py-1 rounded-xl font-black uppercase tracking-tighter">URGENT</span>}
                    </div>
                    <p className="text-sm text-slate-400 font-bold">Ref: {complaint.ref_id} • Posted on {complaint.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                   <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Village Status</p>
                      <p className={`text-lg font-black ${
                        complaint.status === 'Open' ? 'text-rose-600' : 
                        complaint.status === 'Resolved' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>{complaint.status}</p>
                   </div>
                   <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedComplaint(complaint)}>Review Details</Button>
                      <Button className="bg-slate-900" size="sm" onClick={() => setMessageModal({ show: true, citizenName: complaint.citizen, message: "" })}>Direct Message</Button>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
