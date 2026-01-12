"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PieChart, BarChart2, Download, Table, Calendar, Filter } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    { title: "Monthly Revenue Report", category: "Finance", format: "PDF/CSV" },
    { title: "Scheme Distribution Summary", category: "Schemes", format: "Excel" },
    { title: "Grievance Resolution Rate", category: "Public", format: "PDF" },
    { title: "Village Population Growth", category: "Health", format: "Excel" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Reports</h1>
          <p className="text-slate-500">Analyze village progress and generate documentation</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline"><Calendar className="w-4 h-4 mr-2" /> Quarter 1, 2026</Button>
           <Button><Download className="w-4 h-4 mr-2" /> Export All</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2">
            <CardHeader title="Analytical Overview" subtitle="Key metrics for the current period" />
            <CardContent>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Completion Rate</p>
                     <p className="text-2xl font-bold text-slate-900">92.4%</p>
                     <div className="w-full bg-slate-200 h-1 rounded-full mt-4 overflow-hidden">
                        <div className="bg-primary h-full w-[92%]"></div>
                     </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Fund Utilization</p>
                     <p className="text-2xl font-bold text-slate-900">₹14.2L</p>
                     <div className="w-full bg-slate-200 h-1 rounded-full mt-4 overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[75%]"></div>
                     </div>
                  </div>
               </div>
               
               <div className="mt-8 h-48 bg-white border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 italic">
                  Advanced charts will go here...
               </div>
            </CardContent>
         </Card>

         <Card>
            <CardHeader title="Available Reports" />
            <CardContent className="p-0">
               <div className="divide-y divide-border">
                  {reports.map((report, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                       <div className="flex items-center gap-3">
                          <div className="bg-primary/5 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                             <Table className="w-4 h-4" />
                          </div>
                          <div>
                             <p className="text-sm font-semibold text-slate-900">{report.title}</p>
                             <p className="text-[10px] text-slate-400 uppercase font-bold">{report.category}</p>
                          </div>
                       </div>
                       <Download className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
               </div>
               <div className="p-4 border-t border-border">
                  <Button variant="ghost" className="w-full text-xs">Create Custom Report</Button>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
