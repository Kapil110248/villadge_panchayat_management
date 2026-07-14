"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PieChart, BarChart2, Download, Table, Calendar, Filter, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const data = await api.get("/admin/reports/stats", token);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExportAll = () => {
    if (!stats) return;
    
    // Using native print creates a perfect exact PDF and avoids SSR library issues
    window.print();
  };

  const handleDownloadPDF = async (reportType, title) => {
    try {
      setGenerating(true);
      const token = localStorage.getItem("accessToken");
      const data = await api.get(`/admin/reports/data?type=${reportType}`, token);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
      
      // Official Panchayat Letterhead
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0); // Black for official look
      doc.setFont("helvetica", "bold");
      doc.text("OFFICE OF THE GRAM PANCHAYAT, SARAHI", pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Block: Sarahi, District: Indore, Madhya Pradesh", pageWidth / 2, 28, { align: 'center' });
      
      // Horizontal Line
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(14, 34, pageWidth - 14, 34);
      
      // Ref No and Date
      doc.setFontSize(10);
      const refNo = `Ref No: GP/REP/${new Date().getFullYear()}/${Math.floor(Math.random() * 900) + 100}`;
      doc.text(refNo, 14, 42);
      doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 14, 42, { align: 'right' });
      
      // Report Title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`SUBJECT: ${title.toUpperCase()}`, pageWidth / 2, 54, { align: 'center' });
      doc.setFont("helvetica", "normal");
      
      let head = [];
      let body = [];
      
      if (reportType === 'revenue') {
        head = [["Date", "Citizen Name", "Tax Type", "Amount", "Status"]];
        body = data.records?.map(r => [
          new Date(r.created_at).toLocaleDateString('en-GB'),
          r.user?.full_name || "Unknown",
          r.tax_type,
          `Rs. ${r.amount}`,
          r.status.toUpperCase()
        ]) || [];
      } else if (reportType === 'schemes') {
        head = [["Date", "Citizen Name", "Scheme Name", "Category", "Status"]];
        body = data.applications?.map(a => [
          new Date(a.submitted_at).toLocaleDateString('en-GB'),
          a.user?.full_name || "Unknown",
          a.scheme?.scheme_name || "Unknown",
          a.scheme?.category || "General",
          a.status.toUpperCase()
        ]) || [];
      } else if (reportType === 'grievance') {
        head = [["Date", "Citizen Name", "Complaint Type", "Priority", "Status"]];
        body = data.complaints?.map(c => [
          new Date(c.submitted_at).toLocaleDateString('en-GB'),
          c.user_complaint_citizen_idTouser?.full_name || "Unknown",
          c.complaint_type,
          c.priority.toUpperCase(),
          c.status.toUpperCase()
        ]) || [];
      } else if (reportType === 'population') {
        head = [["Registration Date", "Citizen Name & Family", "Mobile Number", "Total Members", "Status"]];
        body = data.citizens?.map(c => {
          let nameText = c.full_name;
          if (c.family_members_list && c.family_members_list.length > 0) {
            nameText += `\n  - ` + c.family_members_list.join(`\n  - `);
          }
          return [
            new Date(c.created_at).toLocaleDateString('en-GB'),
            nameText,
            c.mobile || "N/A",
            c.family_members_count || "1",
            c.is_active ? "ACTIVE" : "INACTIVE"
          ];
        }) || [];
      }
      
      autoTable(doc, {
        startY: 62,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5, textColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 62 }
      });
      
      // Signatures at the bottom
      let finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 70;
      let pageHeight = doc.internal.pageSize.height || (doc.internal.pageSize.getHeight ? doc.internal.pageSize.getHeight() : 297);
      
      // Ensure there is enough space for signatures, otherwise add a new page
      if (finalY > pageHeight - 40) {
        doc.addPage();
        finalY = 20;
      }
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      
      // Secretary Signature Box
      doc.text("__________________________", 14, finalY + 30);
      doc.text("Signature & Seal", 14, finalY + 36);
      doc.text("Gram Vikas Adhikari / Secretary", 14, finalY + 41);
      
      // Sarpanch Signature Box
      doc.text("__________________________", pageWidth - 14, finalY + 30, { align: 'right' });
      doc.text("Signature & Seal", pageWidth - 14, finalY + 36, { align: 'right' });
      doc.text("Sarpanch, Gram Panchayat", pageWidth - 14, finalY + 41, { align: 'right' });
      
      doc.save(`${title.replace(/ /g, "_")}_Official.pdf`);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate PDF");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setGenerating(false);
    }
  };

  const reports = [
    { title: "Monthly Revenue Report", category: "Finance", format: "PDF", type: "revenue" },
    { title: "Scheme Distribution Summary", category: "Schemes", format: "PDF", type: "schemes" },
    { title: "Grievance Resolution Rate", category: "Public", format: "PDF", type: "grievance" },
    { title: "Village Population Growth", category: "Health", format: "PDF", type: "population" },
  ];

  return (
    <div id="reports-content" className="space-y-6 relative">
      {/* Modern Error Toast */}
      {errorMsg && (
        <div className="fixed top-6 right-6 z-50 bg-red-50 text-red-600 px-6 py-4 rounded-xl shadow-lg border border-red-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Shield className="w-5 h-5 text-red-500" />
          <span className="font-semibold text-sm">{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Reports</h1>
          <p className="text-slate-500">Analyze village progress and generate documentation</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={handleExportAll} disabled={generating}>
              {generating ? "Generating..." : <><Download className="w-4 h-4 mr-2" /> Export All</>}
           </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading stats...</div>
      ) : stats ? (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2">
            <CardHeader title="Analytical Overview" subtitle="Key metrics from database" />
            <CardContent>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Grievance Completion Rate</p>
                     <p className="text-2xl font-bold text-slate-900">{stats.completion_rate}%</p>
                     <div className="w-full bg-slate-200 h-1 rounded-full mt-4 overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${stats.completion_rate}%` }}></div>
                     </div>
                     <p className="text-[10px] text-slate-400 mt-2">{stats.resolved_complaints} / {stats.total_complaints} complaints resolved</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Certificate Approval Rate</p>
                     <p className="text-2xl font-bold text-slate-900">{stats.cert_approval_rate}%</p>
                     <div className="w-full bg-slate-200 h-1 rounded-full mt-4 overflow-hidden">
                        <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${stats.cert_approval_rate}%` }}></div>
                     </div>
                     <p className="text-[10px] text-slate-400 mt-2">{stats.approved_certificates} / {stats.total_certificates} certificates approved</p>
                  </div>
               </div>
               
               <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl text-center">
                     <p className="text-2xl font-black text-blue-700">{stats.total_citizens}</p>
                     <p className="text-[10px] font-bold text-blue-400 uppercase mt-1">Citizens</p>
                  </div>
                  <div className="p-4 bg-rose-50 rounded-xl text-center">
                     <p className="text-2xl font-black text-rose-700">{stats.open_complaints}</p>
                     <p className="text-[10px] font-bold text-rose-400 uppercase mt-1">Open Complaints</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl text-center">
                     <p className="text-2xl font-black text-emerald-700">{stats.active_schemes}</p>
                     <p className="text-[10px] font-bold text-emerald-400 uppercase mt-1">Active Schemes</p>
                  </div>
                   <div className="p-4 bg-amber-50 rounded-xl text-center">
                     <p className="text-2xl font-black text-amber-700">{stats.total_notices}</p>
                     <p className="text-[10px] font-bold text-amber-400 uppercase mt-1">Notices</p>
                  </div>
               </div>

               {stats.chartData && stats.chartData.length > 0 && (
                  <div className="mt-8">
                     <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase">Grievance Trends (Last 6 Months)</h3>
                     <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={stats.chartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                              <Bar dataKey="received" name="Complaints Received" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="resolved" name="Complaints Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               )}
            </CardContent>
         </Card>

         <Card>
            <CardHeader title="Available Reports" />
            <CardContent className="p-0">
               <div className="divide-y divide-border">
                  {reports.map((report, i) => (
                    <div key={i} onClick={() => handleDownloadPDF(report.type, report.title)} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
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
                  <Button variant="ghost" className="w-full text-xs" onClick={handleExportAll}>Download Complete Report</Button>
               </div>
            </CardContent>
         </Card>
      </div>
      ) : (
        <div className="text-center py-12 text-slate-500">Failed to load stats.</div>
      )}
    </div>
  );
}
