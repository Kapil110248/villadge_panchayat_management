"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, CheckCircle, XCircle, ExternalLink, Clock } from "lucide-react";

const requests = [
  { id: "REQ-001", name: "Suresh Meena", type: "Income Certificate", date: "10 Jan 2026", status: "New" },
  { id: "REQ-002", name: "Anita Devi", type: "Residence Certificate", date: "10 Jan 2026", status: "Reviewing" },
  { id: "REQ-003", name: "Rajesh Soni", type: "Birth Certificate", date: "09 Jan 2026", status: "New" },
];

export default function CertificateVerification() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Certificate Verification</h1>
          <p className="text-slate-500">Naye applications ki janch karein aur aage bhejein</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{request.name}</h4>
                        <p className="text-xs text-slate-500">Applied for {request.type}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      request.status === "New" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1">Request ID</span>
                      <span className="font-semibold text-slate-700">{request.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Date Submitted</span>
                      <span className="font-semibold text-slate-700">{request.date}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 w-full md:w-64 flex flex-col justify-center space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    <ExternalLink className="w-3.5 h-3.5 mr-2" /> View Documents
                  </Button>
                  <Button size="sm" className="w-full justify-start text-xs bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="w-3.5 h-3.5 mr-2" /> Verify & Push
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs text-rose-600 border-rose-100 hover:bg-rose-50">
                    <XCircle className="w-3.5 h-3.5 mr-2" /> Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
