"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, CheckCircle, XCircle, User, ArrowRight } from "lucide-react";

const pendingApprovals = [
  { id: "CERT-1023", citizen: "Ramesh Kumar", type: "Income Certificate", clerk: "Rohan Das", date: "10 Jan 2026" },
  { id: "CERT-1024", citizen: "Sita Devi", type: "Residence Certificate", clerk: "Maya Sharma", date: "10 Jan 2026" },
];

export default function ApprovalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Final Approvals</h1>
        <p className="text-slate-500">Clerk verified applications waiting for your digital signature</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pendingApprovals.map((app) => (
          <Card key={app.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-xl">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{app.type}</h3>
                      <p className="text-sm text-slate-500">App ID: {app.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-12 border-t border-slate-50 pt-4">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Citizen</p>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-semibold">{app.citizen}</span>
                      </div>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Clerk Verified By</p>
                        <span className="text-sm font-semibold text-emerald-600">{app.clerk}</span>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Verified Date</p>
                        <span className="text-sm font-semibold">{app.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200">
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve & Sign
                  </Button>
                  <Button variant="outline" className="flex-1 text-rose-600 border-rose-100 hover:bg-rose-50">
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button variant="ghost" className="flex-1 text-xs">View History</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pendingApprovals.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Sab Kaam Ho Gaya!</h3>
          <p className="text-slate-500">Abhi koi application approval ke liye nahi hai.</p>
        </div>
      )}
    </div>
  );
}
