"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Clock, CheckCircle, AlertCircle, Search, Filter, Shield, X, Phone } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [messageModal, setMessageModal] = useState({ show: false, citizenName: "", message: "", complaintId: null });
  const [resolutionModal, setResolutionModal] = useState({ show: false, complaintId: null, message: "", photo: null, uploading: false });

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

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (messageModal.message.trim()) {
      try {
        const token = localStorage.getItem("accessToken");
        await api.post(`/admin/complaints/${messageModal.complaintId}/message`, { message: messageModal.message }, token);
        showToast(`Message sent to ${messageModal.citizenName}!`, "success");
        setMessageModal({ show: false, citizenName: "", message: "", complaintId: null });
      } catch (err) {
        showToast("Error sending message: " + err.message, "error");
      }
    }
  };

  const handleResolutionSubmit = async (e) => {
    e.preventDefault();
    setResolutionModal(prev => ({ ...prev, uploading: true }));
    try {
      const token = localStorage.getItem("accessToken");
      let photo_url = null;
      if (resolutionModal.photo) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", resolutionModal.photo);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
        const uploadRes = await fetch(`${apiUrl}/upload`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formDataUpload
        });
        if (!uploadRes.ok) throw new Error("File upload failed");
        const uploadData = await uploadRes.json();
        photo_url = uploadData.secure_url;
      }

      await api.put(`/admin/complaints/${resolutionModal.complaintId}/status`, { 
        status: "resolution_proposed",
        message: resolutionModal.message,
        image_url: photo_url
      }, token);

      showToast("Resolution proposed to citizen!");
      setResolutionModal({ show: false, complaintId: null, message: "", photo: null, uploading: false });
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      showToast("Error proposing resolution: " + err.message, "error");
      setResolutionModal(prev => ({ ...prev, uploading: false }));
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
          <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 shrink-0 flex justify-between items-start border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">Complaint Details</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Ref: {selectedComplaint.ref_id}</p>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Citizen</label>
                  <p className="text-sm font-bold text-slate-900">{selectedComplaint.citizen}</p>
                </div>
                {selectedComplaint.citizen_mobile && selectedComplaint.citizen_mobile !== "N/A" && (
                  <div className="ml-auto flex flex-col items-end">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</label>
                    <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
                      <Phone className="w-3 h-3" />
                      {selectedComplaint.citizen_mobile}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject / Issue</label>
                <div className="p-4 bg-slate-50 rounded-xl mt-1 text-sm font-bold text-slate-900">
                  {selectedComplaint.subject || "No subject provided."}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                <div className="p-4 bg-slate-50 rounded-xl mt-1 text-sm font-medium text-slate-700">
                  {selectedComplaint.description || "No description provided."}
                </div>
              </div>
              {selectedComplaint.image_url && selectedComplaint.image_url !== "null" && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attached Photo</label>
                  <img src={selectedComplaint.image_url.startsWith('http') ? selectedComplaint.image_url : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8001'}${selectedComplaint.image_url}`} alt="Complaint Attachment" className="w-full mt-1 max-h-60 object-cover rounded-xl border border-slate-200" />
                </div>
              )}
              
              {(selectedComplaint.status === "Resolved" || selectedComplaint.status === "Resolution Proposed") && selectedComplaint.admin_reply && (
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <h4 className="text-sm font-black text-slate-900 mb-2">Admin Resolution Details</h4>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-4">
                    <p className="text-sm font-semibold text-emerald-900">{selectedComplaint.admin_reply}</p>
                  </div>
                  {selectedComplaint.resolution_image_url && selectedComplaint.resolution_image_url !== "null" && (
                    <div className="mb-4">
                      <img src={selectedComplaint.resolution_image_url.startsWith('http') ? selectedComplaint.resolution_image_url : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8001'}${selectedComplaint.resolution_image_url}`} alt="Resolution Proof" className="w-full max-h-60 object-cover rounded-xl border border-slate-200" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3">
               {selectedComplaint.status === "Open" && (
                 <Button onClick={() => handleStatusUpdate(selectedComplaint.id, "In Progress")} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200">
                   Mark In Progress
                 </Button>
               )}
               {selectedComplaint.status !== "Resolved" && selectedComplaint.status !== "Resolution Proposed" && (
                 <Button onClick={() => {
                    setResolutionModal({ show: true, complaintId: selectedComplaint.id, message: "", photo: null, uploading: false });
                    setSelectedComplaint(null);
                 }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200">
                   Propose Resolution
                 </Button>
               )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Message Modal */}
      {messageModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 relative shadow-2xl border-0">
            <button onClick={() => setMessageModal({ show: false, citizenName: "", message: "", complaintId: null })} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
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

      {/* Resolution Modal */}
      {resolutionModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 relative shadow-2xl border-0">
            <button onClick={() => setResolutionModal({ show: false, complaintId: null, message: "", photo: null, uploading: false })} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900">Propose Resolution</h2>
              <p className="text-sm font-medium text-slate-500">Provide proof to the citizen.</p>
            </div>
            <form onSubmit={handleResolutionSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Resolution Message</label>
                <textarea 
                  required 
                  rows={3}
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-xl text-sm font-semibold transition-all outline-none resize-none" 
                  value={resolutionModal.message} 
                  onChange={e => setResolutionModal({...resolutionModal, message: e.target.value})} 
                  placeholder="Describe how the issue was resolved..." 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Proof Photo (Required)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setResolutionModal({...resolutionModal, photo: e.target.files[0]})}
                  className="w-full p-2 bg-slate-50 rounded-xl text-sm"
                  required
                />
              </div>
              <Button type="submit" disabled={resolutionModal.uploading} className="w-full py-6 rounded-xl text-sm bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20">
                {resolutionModal.uploading ? "Sending Proof..." : "Send to Citizen"}
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
                    <div className="flex items-center gap-3 text-sm text-slate-400 font-bold">
                      <p>Ref: {complaint.ref_id}</p>
                      {complaint.citizen_mobile && complaint.citizen_mobile !== "N/A" && (
                        <>
                          <span>•</span>
                          <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {complaint.citizen_mobile}</p>
                        </>
                      )}
                      <span>•</span>
                      <p>Posted on {complaint.date}</p>
                    </div>
                    {complaint.subject && (
                      <p className="text-sm font-semibold text-slate-800 mt-2">{complaint.subject}</p>
                    )}
                    {complaint.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{complaint.description}</p>
                    )}
                    {complaint.image_url && complaint.image_url !== "null" && (
                      <div className="mt-3">
                        <img 
                          src={complaint.image_url.startsWith('http') ? complaint.image_url : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8001'}${complaint.image_url}`} 
                          alt="Complaint Attachment" 
                          className="h-16 w-auto object-cover rounded-lg border border-slate-200" 
                        />
                      </div>
                    )}
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
                        {!complaint.admin_reply && (
                           <Button className="bg-slate-900" size="sm" onClick={() => setMessageModal({ show: true, citizenName: complaint.citizen, message: "", complaintId: complaint.id })}>Direct Message</Button>
                        )}
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
