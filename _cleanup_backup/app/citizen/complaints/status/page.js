"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Clock, CheckCircle, AlertCircle, Search, Filter } from "lucide-react";
import Link from "next/link";

const complaints = [
  { id: "COMP-101", title: "Street Light Not Working", category: "Electricity", date: "10 Jan 2026", status: "Open", urgent: true },
  { id: "COMP-102", title: "Water Leakage Near Main Road", category: "Water", date: "09 Jan 2026", status: "In Progress", urgent: false },
  { id: "COMP-103", title: "Waste Management Issue", category: "Sanitation", date: "08 Jan 2026", status: "Resolved", urgent: false },
];

export default function MyComplaints() {
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
        {complaints.map((complaint) => (
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
                   <Button variant="outline" className="rounded-xl">View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
