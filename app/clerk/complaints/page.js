"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Clock, CheckCircle, AlertCircle, Search, Filter } from "lucide-react";

const complaints = [
  { id: "COMP-101", citizen: "Ramesh Sharma", category: "Water", date: "10 Jan 2026", status: "Open", urgent: true },
  { id: "COMP-102", citizen: "Sunita Verma", category: "Sanitation", date: "09 Jan 2026", status: "In Progress", urgent: false },
  { id: "COMP-103", citizen: "Vikram Singh", category: "Road", date: "08 Jan 2026", status: "Resolved", urgent: false },
];

export default function ClerkComplaints() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complaint Tracking</h1>
          <p className="text-slate-500">Resolve citizen grievances and update status</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> All Wards</Button>
           <Button variant="outline" size="sm"><Clock className="w-4 h-4 mr-2" /> Recent</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {complaints.map((complaint) => (
          <Card key={complaint.id} className={complaint.urgent ? "border-l-4 border-l-rose-500" : ""}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-xl ${complaint.status === 'Open' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                       <h4 className="font-bold text-slate-900">{complaint.citizen}</h4>
                       <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold uppercase">{complaint.category}</span>
                       {complaint.urgent && <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold uppercase">URGENT</span>}
                    </div>
                    <p className="text-xs text-slate-500">ID: {complaint.id} • Submitted on {complaint.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Current Status</p>
                      <p className={`text-sm font-bold ${
                        complaint.status === 'Open' ? 'text-rose-600' : 
                        complaint.status === 'Resolved' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>{complaint.status}</p>
                   </div>
                   <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs">Update</Button>
                      <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700">Resolve</Button>
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
