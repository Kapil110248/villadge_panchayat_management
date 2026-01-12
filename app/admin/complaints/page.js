"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Clock, CheckCircle, AlertCircle, Search, Filter, Shield } from "lucide-react";

const complaints = [
  { id: "COMP-101", citizen: "Ramesh Sharma", category: "Water", date: "10 Jan 2026", status: "Open", urgent: true },
  { id: "COMP-102", citizen: "Sunita Verma", category: "Sanitation", date: "09 Jan 2026", status: "In Progress", urgent: false },
  { id: "COMP-103", citizen: "Vikram Singh", category: "Road", date: "08 Jan 2026", status: "Resolved", urgent: false },
];

export default function AdminComplaints() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
             <Shield className="w-3 h-3" /> Monitoring Grievances
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Complaint <span className="text-primary">Center</span></h1>
          <p className="text-slate-500 font-medium mt-1 italic">Monitor the resolution speed and citizen satisfaction.</p>
        </div>
      </div>

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
                    <p className="text-sm text-slate-400 font-bold">Ref: {complaint.id} • Posted on {complaint.date}</p>
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
                      <Button variant="outline" size="sm">Review Details</Button>
                      <Button className="bg-slate-900">Direct Message</Button>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
