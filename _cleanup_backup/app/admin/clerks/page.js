"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserPlus, Search, Phone, Shield, MoreVertical, Mail } from "lucide-react";

const clerks = [
  { id: 1, name: "Rohan Das", village: "Sarahi", tasksHandled: 450, status: "Active" },
  { id: 2, name: "Maya Sharma", village: "Ghoshipura", tasksHandled: 320, status: "Active" },
  { id: 3, name: "Suresh Patil", village: "Bhatgaon", tasksHandled: 120, status: "On Leave" },
];

export default function ClerkManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clerk Management</h1>
          <p className="text-slate-500">Manage Panchayat staff and their performance</p>
        </div>
        <Button><UserPlus className="w-4 h-4 mr-2" /> Naya Clerk Add Karein</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clerks.map((clerk) => (
          <Card key={clerk.id} className="relative overflow-hidden">
             <div className={`absolute top-0 left-0 w-full h-1 ${clerk.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
             <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                   <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-lg text-slate-400">
                      {clerk.name.split(' ').map(n => n[0]).join('')}
                   </div>
                   <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                </div>
                <div>
                   <h3 className="text-lg font-bold text-slate-900">{clerk.name}</h3>
                   <p className="text-sm text-slate-500 font-medium">Secretary: {clerk.village}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                   <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Tasks</p>
                      <p className="text-sm font-bold text-slate-900">{clerk.tasksHandled}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                      <span className={`text-[10px] font-bold ${clerk.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'}`}>{clerk.status}</span>
                   </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-2">
                   <Button variant="outline" size="sm" className="text-xs">Performance</Button>
                   <Button variant="outline" size="sm" className="text-xs">Message</Button>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      <Card>
         <CardHeader title="Staff Performance Analytics" />
         <CardContent>
            <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-200 text-slate-400 text-sm italic">
               Clerk performance trends will appear here...
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
