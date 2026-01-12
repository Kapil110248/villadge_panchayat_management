"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { FileText, Clock, CheckCircle2, XCircle, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

const applications = [
  { id: "CERT-2026-001", type: "Income Certificate", date: "05 Jan 2026", status: "Approved", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  { id: "CERT-2026-015", type: "Residence Certificate", date: "08 Jan 2026", status: "Pending", color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  { id: "CERT-2026-022", type: "Birth Certificate", date: "10 Jan 2026", status: "In Verification", color: "text-blue-600", bg: "bg-blue-50", icon: Search },
];

export default function MyCertificates() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mere Certificates</h1>
          <p className="text-slate-500">Aapke sabhi application ka status yahan dekhein</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          <Button variant="outline" size="sm"><Search className="w-4 h-4 mr-2" /> Search</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className={`p-3 rounded-xl ${app.bg} ${app.color}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{app.type}</h4>
                    <p className="text-xs text-slate-500">Application ID: {app.id}</p>
                  </div>
                </div>

                <div className="flex-1 md:text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Last Updated</p>
                  <p className="text-sm font-medium text-slate-900">{app.date}</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                  <div className="flex items-center gap-2">
                    <app.icon className={`w-5 h-5 ${app.color}`} />
                    <span className={`text-sm font-bold ${app.color}`}>{app.status}</span>
                  </div>
                  {app.status === "Approved" ? (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline">View Details</Button>
                  )}
                </div>
              </div>

              {/* Progress Stepper (Simple) */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between max-w-2xl mx-auto">
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                    <span className="text-[10px] text-slate-500">Submitted</span>
                 </div>
                 <div className="flex-1 h-0.5 bg-emerald-500 mx-1"></div>
                 <div className="flex flex-col items-center gap-2">
                    <div className={`w-4 h-4 ${app.status !== 'Pending' ? 'bg-emerald-500' : 'bg-slate-200'} rounded-full`}></div>
                    <span className="text-[10px] text-slate-500">Clerk Verify</span>
                 </div>
                 <div className="flex-1 h-0.5 bg-slate-200 mx-1"></div>
                 <div className="flex flex-col items-center gap-2">
                    <div className={`w-4 h-4 ${app.status === 'Approved' ? 'bg-emerald-500' : 'bg-slate-200'} rounded-full`}></div>
                    <span className="text-[10px] text-slate-500">Admin Approve</span>
                 </div>
                 <div className="flex-1 h-0.5 bg-slate-200 mx-1"></div>
                 <div className="flex flex-col items-center gap-2">
                    <div className={`w-4 h-4 ${app.status === 'Approved' ? 'bg-emerald-500' : 'bg-slate-200'} rounded-full`}></div>
                    <span className="text-[10px] text-slate-500">Ready</span>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {applications.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 p-12 text-center rounded-2xl">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Abhi tak koi application nahi hai</h3>
          <p className="text-slate-500 mb-6">Naye certificate ke liye aaj hi apply karein</p>
          <Button>Apply Now</Button>
        </div>
      )}
    </div>
  );
}
