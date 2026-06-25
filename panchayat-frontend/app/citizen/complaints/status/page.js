"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/citizen/complaints", token);
      
      const mappedComplaints = data.map(c => ({
        real_id: c.id,
        id: c.complaint_number,
        title: c.subject,
        category: c.complaint_type,
        date: new Date(c.submitted_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }),
        status: c.status === "in_progress" ? "In Progress" : c.status === "resolution_proposed" ? "Resolution Proposed" : c.status.charAt(0).toUpperCase() + c.status.slice(1),
        urgent: c.priority === "high",
        description: c.description,
        image_url: c.image_url,
        admin_reply: c.admin_reply,
        resolution_image_url: c.resolution_image_url,
        citizen_confirmed: c.citizen_confirmed
      }));
      setComplaints(mappedComplaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResolution = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/citizen/complaints/${id}/resolve`, {}, token);
      setSelectedComplaint(null);
      fetchComplaints();
      alert("Resolution Confirmed!");
    } catch (error) {
      console.error(error);
      alert("Error confirming resolution");
    }
  };
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Meri <span className="text-primary">Shikayatein</span></h1>
          <p className="text-slate-500 font-medium mt-1">Track the status of your reported village issues.</p>
        </div>
        <Link href="/citizen/complaints/new">
          <Button className="gap-2 bg-slate-900 rounded-2xl"><MessageSquare className="w-4 h-4" /> New Complaint</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : complaints.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-medium">No complaints found.</div>
        ) : complaints.map((complaint) => (
          <Card key={complaint.id} className={complaint.urgent ? "border-l-4 border-l-rose-500" : ""}>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6 flex-1">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    complaint.status === 'Open' ? 'bg-rose-50 text-rose-600' : 
                    complaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                       <h4 className="text-xl font-black text-slate-900">{complaint.title}</h4>
                       <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-black uppercase tracking-widest">{complaint.category}</span>
                       {complaint.urgent && <span className="text-[10px] bg-rose-500 text-white px-2 py-1 rounded-xl font-black uppercase tracking-tighter">URGENT</span>}
                    </div>
                    <p className="text-sm text-slate-400 font-bold">Ref ID: {complaint.id} • Posted on {complaint.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                   <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Current Status</p>
                      <p className={`text-lg font-black ${
                        complaint.status === 'Open' ? 'text-rose-600' : 
                        complaint.status === 'Resolved' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>{complaint.status}</p>
                   </div>
                   <Button variant="outline" className="rounded-xl" onClick={() => setSelectedComplaint(complaint)}>View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal for View Details */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 shrink-0 flex justify-between items-start border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedComplaint.title}</h3>
                <p className="text-sm text-slate-500 mt-1">Ref ID: {selectedComplaint.id}</p>
              </div>
              <Button variant="ghost" className="rounded-full w-10 h-10 p-0" onClick={() => setSelectedComplaint(null)}>X</Button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Description</h4>
                  <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedComplaint.description || "No description provided."}</p>
                </div>
                
                {selectedComplaint.image_url && selectedComplaint.image_url !== "null" && (
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Attached Photo</h4>
                    <img src={selectedComplaint.image_url.startsWith('http') ? selectedComplaint.image_url : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8001'}${selectedComplaint.image_url}`} alt="Complaint Attachment" className="w-full max-h-60 object-cover rounded-xl border border-slate-200" />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 mt-6">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Category</h4>
                    <p className="font-semibold text-slate-900 capitalize">{selectedComplaint.category}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Status</h4>
                    <p className={`font-semibold ${
                        selectedComplaint.status === 'Open' ? 'text-rose-600' : 
                        selectedComplaint.status === 'Resolution Proposed' ? 'text-amber-500' :
                        selectedComplaint.status === 'Resolved' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>{selectedComplaint.status}</p>
                  </div>
                </div>

                {selectedComplaint.admin_reply && selectedComplaint.status !== "Resolution Proposed" && (
                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Latest Admin Message</h4>
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <p className="text-sm font-semibold text-slate-800">{selectedComplaint.admin_reply}</p>
                    </div>
                  </div>
                )}

                {selectedComplaint.status === "Resolution Proposed" && (
                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-black text-slate-900 mb-2">Admin Resolution Proof</h4>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-4">
                      <p className="text-sm font-semibold text-emerald-900">{selectedComplaint.admin_reply}</p>
                    </div>
                    {selectedComplaint.resolution_image_url && selectedComplaint.resolution_image_url !== "null" && (
                      <div className="mb-4">
                        <img src={selectedComplaint.resolution_image_url.startsWith('http') ? selectedComplaint.resolution_image_url : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8001'}${selectedComplaint.resolution_image_url}`} alt="Resolution Proof" className="w-full max-h-60 object-cover rounded-xl border border-slate-200" />
                      </div>
                    )}
                    <Button onClick={() => handleConfirmResolution(selectedComplaint.real_id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200 py-6 font-bold">
                      Confirm Resolution
                    </Button>
                  </div>
                )}
              </div>
          </Card>
        </div>
      )}

    </div>
  );
}
