"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IndianRupee, TrendingUp, AlertTriangle, CheckCircle, PieChart, Download, Plus, Clock, Check, X, History } from "lucide-react";
import { api } from "@/lib/api";

export default function ClerkTaxes() {
  const calculateTaxPenalty = (tax) => {
    const dueDate = new Date(tax.due_date);
    const endDate = tax.payment_date ? new Date(tax.payment_date) : new Date();
    
    if (endDate <= dueDate || (tax.status === "unpaid" && new Date() <= dueDate)) {
      return { months: 0, penalty: 0, total: tax.amount };
    }
    
    const diffTime = endDate - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.max(1, Math.ceil(diffDays / 30));
    
    const penalty = (tax.amount * (tax.penalty_rate || 0) * months) / 100;
    return { months, penalty, total: tax.amount + penalty };
  };

  const [taxes, setTaxes] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showLevyModal, setShowLevyModal] = useState(false);
  const [levyForm, setLevyForm] = useState({ citizen_id: "", tax_type: "house", amount: "", due_date: "", penalty_rate: "" });
  const [customTaxType, setCustomTaxType] = useState("");
  
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [selectedCitizenForHistory, setSelectedCitizenForHistory] = useState(null);

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const [taxData, analyticsData, directoryData] = await Promise.all([
        api.get("/taxes", token),
        api.get("/taxes/analytics", token),
        api.get("/directory", token)
      ]);
      setTaxes(taxData);
      setAnalytics(analyticsData);
      setCitizens(directoryData || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`/taxes/${id}/approve`, {}, token);
      showToast("Payment Approved!");
      fetchData();
    } catch (e) { showToast(e.message, "error"); }
  };

  const handleLevy = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const finalTaxType = levyForm.tax_type === "other" ? customTaxType : levyForm.tax_type;
      
      await api.post("/taxes/levy", { ...levyForm, tax_type: finalTaxType, amount: parseFloat(levyForm.amount), due_date: new Date(levyForm.due_date).toISOString(), penalty_rate: levyForm.penalty_rate ? parseFloat(levyForm.penalty_rate) : 0.0 }, token);
      showToast("Tax Levied Successfully!");
      setShowLevyModal(false);
      setLevyForm({ citizen_id: "", tax_type: "house", amount: "", due_date: "", penalty_rate: "" });
      setCustomTaxType("");
      fetchData();
    } catch (e) { showToast(e.message, "error"); }
  };


  const handleExport = () => {
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      const rows = taxes.map(t => {
        const { months, penalty, total } = calculateTaxPenalty(t);
        const citizenFullName = t.citizen?.full_name || "—";
        const fatherSuffix = t.citizen?.profile?.father_name ? ` (S/O: ${t.citizen.profile.father_name})` : "";
        const penaltyText = penalty > 0 ? ` + ₹${penalty.toLocaleString("en-IN")} (${t.penalty_rate}% Interest × ${months} Mo)` : "";
        return `
          <tr>
            <td>${citizenFullName}${fatherSuffix}</td>
            <td style="text-transform: capitalize;">${t.tax_type}</td>
            <td style="font-weight: bold;">₹${total.toLocaleString("en-IN")}${penaltyText}</td>
            <td>${t.due_date ? new Date(t.due_date).toLocaleDateString("en-IN") : "—"}</td>
            <td style="text-transform: uppercase; font-weight: bold; color: ${t.status === 'paid' ? '#10b981' : t.status === 'pending' ? '#f59e0b' : '#ef4444'};">${t.status}</td>
            <td style="font-family: monospace; color: #64748b;">${t.transaction_id || "—"}</td>
          </tr>
        `;
      }).join("");

      printWindow.document.write(`
        <html>
          <head>
            <title>Village Tax Report - ${new Date().getFullYear()}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0f172a; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
              .header h1 { margin: 0; color: #064e3b; font-size: 28px; font-weight: 900; }
              .header p { margin: 5px 0 0; color: #64748b; font-size: 14px; font-weight: 600; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
              th, td { border-bottom: 1px solid #e2e8f0; padding: 14px 12px; text-align: left; }
              th { background-color: #f8fafc; color: #475569; font-weight: 800; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; border-bottom: 2px solid #cbd5e1; }
              tr:nth-child(even) { background-color: #f8fafc; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Village Panchayat Tax Ledger</h1>
              <p>Official Report Generated on: ${new Date().toLocaleString("en-IN")}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Citizen Name</th>
                  <th>Tax Type</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } catch (e) {
      console.error("Export Error: ", e);
      alert("PDF generate karne me ek error aayi. Kripya try again karein.");
    }
  };

  const paid = taxes.filter(t => t.status === "paid");
  const unpaid = taxes.filter(t => t.status === "unpaid");

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
            <IndianRupee className="w-3 h-3" /> Tax Center — Clerk View
          </div>
          <h1 className="text-4xl font-black text-slate-900">Tax Records</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor house tax, water tax collections and pending dues.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setShowLevyModal(true)} variant="outline" className="gap-2 rounded-2xl bg-white"><Plus className="w-4 h-4" /> Levy New Tax</Button>
          <Button onClick={handleExport} variant="outline" className="gap-2 rounded-2xl"><Download className="w-4 h-4" /> Export</Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center"><IndianRupee className="w-6 h-6 text-emerald-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Collected</p><h3 className="text-xl font-black text-emerald-700">₹{(analytics?.total_collected || 0).toLocaleString("en-IN")}</h3></div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-rose-50 to-white border-rose-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-rose-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending</p><h3 className="text-xl font-black text-rose-700">₹{(analytics?.total_unpaid || 0).toLocaleString("en-IN")}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center"><PieChart className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">House Tax %</p><h3 className="text-2xl font-black text-slate-900">{analytics?.house_collection_pct || 0}%</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center"><PieChart className="w-6 h-6 text-cyan-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Water Tax %</p><h3 className="text-2xl font-black text-slate-900">{analytics?.water_collection_pct || 0}%</h3></div>
          </div>
        </Card>
      </div>

      {/* Collection Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-none shadow-2xl shadow-emerald-200/50">
          <CardContent className="p-8 space-y-6">
            <h3 className="text-xl font-black text-white">House Tax Collection</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-emerald-100/70">Progress</span>
                <span className="text-white">{analytics?.house_collection_pct || 0}%</span>
              </div>
              <div className="w-full bg-black/10 h-4 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div className="bg-white h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000" style={{ width: `${analytics?.house_collection_pct || 0}%` }} />
              </div>
            </div>
            <p className="text-xs text-emerald-100 font-semibold">Paid: {paid.filter(t => t.tax_type === "house").length} | Unpaid: {unpaid.filter(t => t.tax_type === "house").length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-600 to-cyan-800 text-white border-none shadow-2xl shadow-cyan-200/50">
          <CardContent className="p-8 space-y-6">
            <h3 className="text-xl font-black text-white">Water Tax Collection</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-cyan-100/70">Progress</span>
                <span className="text-white">{analytics?.water_collection_pct || 0}%</span>
              </div>
              <div className="w-full bg-black/10 h-4 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div className="bg-white h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000" style={{ width: `${analytics?.water_collection_pct || 0}%` }} />
              </div>
            </div>
            <p className="text-xs text-cyan-100 font-semibold">Paid: {paid.filter(t => t.tax_type === "water").length} | Unpaid: {unpaid.filter(t => t.tax_type === "water").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Records Table */}
      <Card id="tax-report-table">
        <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-100" title="Citizen Tax Summary" subtitle="Overview of taxes grouped by citizen" />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Citizen Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Outstanding</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Paid</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const groupedTaxes = taxes.reduce((acc, tax) => {
                    if (!tax.citizen) return acc;
                    if (!acc[tax.citizen.id]) {
                      acc[tax.citizen.id] = {
                        citizen: tax.citizen,
                        totalPaid: 0,
                        totalUnpaid: 0,
                        unpaidCount: 0,
                        paidCount: 0
                      };
                    }
                    const { total } = calculateTaxPenalty(tax);
                    if (tax.status === "paid") {
                      acc[tax.citizen.id].totalPaid += total;
                      acc[tax.citizen.id].paidCount++;
                    } else {
                      acc[tax.citizen.id].totalUnpaid += total;
                      acc[tax.citizen.id].unpaidCount++;
                    }
                    return acc;
                  }, {});
                  
                  return Object.values(groupedTaxes).map(g => (
                    <tr key={g.citizen.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">
                        <div>
                          {g.citizen.full_name}
                          {g.citizen.profile?.father_name && (
                            <span className="block text-xs font-semibold text-slate-400 mt-0.5">
                              S/O: {g.citizen.profile.father_name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {g.totalUnpaid > 0 ? (
                          <div>
                            <span className="text-sm font-black text-rose-600 block">₹{g.totalUnpaid.toLocaleString("en-IN")}</span>
                            <span className="text-[10px] font-bold text-rose-500/70">{g.unpaidCount} {g.unpaidCount === 1 ? 'Bill' : 'Bills'} Pending</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {g.totalPaid > 0 ? (
                          <div>
                            <span className="text-sm font-black text-emerald-600 block">₹{g.totalPaid.toLocaleString("en-IN")}</span>
                            <span className="text-[10px] font-bold text-emerald-500/70">{g.paidCount} {g.paidCount === 1 ? 'Bill' : 'Bills'} Cleared</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          onClick={() => setSelectedCitizenForHistory(g.citizen)} 
                          size="sm" 
                          variant="outline"
                          className="border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg gap-2 text-xs px-4"
                        >
                          <History className="w-3.5 h-3.5" /> View Breakdown
                        </Button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Levy Tax Modal */}
      {showLevyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowLevyModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <CardContent className="p-8">
              <form onSubmit={handleLevy} className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center"><Plus className="w-6 h-6 text-emerald-600" /></div>
                  <div><h3 className="text-xl font-black text-slate-900">Levy New Tax</h3><p className="text-sm font-medium text-slate-500">Assign a new tax bill to a citizen.</p></div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Citizen</label>
                    <select required value={levyForm.citizen_id} onChange={e => setLevyForm({...levyForm, citizen_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none">
                      <option value="">-- Choose Citizen --</option>
                      {citizens.filter(c => c.family_head !== null || (!c.family_member_id && !c.family)).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.full_name} {c.profile?.father_name ? `(S/O: ${c.profile.father_name})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Type</label>
                    <select required value={levyForm.tax_type} onChange={e => setLevyForm({...levyForm, tax_type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none">
                      <option value="house">House Tax</option>
                      <option value="water">Water Tax</option>
                      <option value="other">Other (Custom Tax)</option>
                    </select>
                  </div>
                  {levyForm.tax_type === "other" && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Tax Name</label>
                      <input type="text" required value={customTaxType} onChange={e => setCustomTaxType(e.target.value)} placeholder="e.g. Shop Tax, Penalty" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (₹)</label>
                    <input type="number" required value={levyForm.amount} onChange={e => setLevyForm({...levyForm, amount: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penalty Rate / Interest Rate</label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 bg-slate-50">
                      <input type="number" step="0.1" value={levyForm.penalty_rate} onChange={e => setLevyForm({...levyForm, penalty_rate: e.target.value})} placeholder="e.g. 5" className="flex-1 bg-transparent p-3 text-sm font-semibold outline-none border-none" />
                      <div className="px-4 flex items-center bg-slate-100 border-l border-slate-200 text-slate-500 text-sm font-black">%</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</label>
                    <input type="date" required value={levyForm.due_date} onChange={e => setLevyForm({...levyForm, due_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none" />
                  </div>
                </div>
                <div className="pt-4">
                  <Button type="submit" className="w-full py-6 rounded-xl text-md font-bold bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20">Levy Tax</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}


      {/* Citizen Tax History Modal */}
      {selectedCitizenForHistory && (() => {
        const citizenTaxes = taxes.filter(t => t.citizen_id === selectedCitizenForHistory.id);
        const paidTaxes = citizenTaxes.filter(t => t.status === "paid");
        const unpaidTaxes = citizenTaxes.filter(t => t.status === "unpaid" || t.status === "pending");
        
        const totalPaidSum = paidTaxes.reduce((sum, t) => sum + calculateTaxPenalty(t).total, 0);
        const totalUnpaidSum = unpaidTaxes.reduce((sum, t) => sum + calculateTaxPenalty(t).total, 0);
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-4xl relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
              <button onClick={() => setSelectedCitizenForHistory(null)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
                <X className="w-4 h-4" />
              </button>
              
              <CardContent className="p-8 overflow-y-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <History className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{selectedCitizenForHistory.full_name}'s Tax Ledger</h3>
                    <p className="text-xs font-semibold text-slate-400">
                      {selectedCitizenForHistory.profile?.father_name ? `S/O: ${selectedCitizenForHistory.profile.father_name} • ` : ""}
                      Email: {selectedCitizenForHistory.email}
                    </p>
                  </div>
                </div>

                {/* mini analytics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Paid</p>
                      <h4 className="text-xl font-black text-emerald-700">₹{totalPaidSum.toLocaleString("en-IN")}</h4>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-700 px-3 py-1 rounded-full text-xs font-black">{paidTaxes.length} Bills</span>
                  </div>
                  
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Total Outstanding</p>
                      <h4 className="text-xl font-black text-rose-700">₹{totalUnpaidSum.toLocaleString("en-IN")}</h4>
                    </div>
                    <span className="bg-rose-500/10 text-rose-700 px-3 py-1 rounded-full text-xs font-black">{unpaidTaxes.length} Bills</span>
                  </div>
                </div>

                {/* Ledger Table */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-left">
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Type</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Due</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {citizenTaxes.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic text-sm">No tax bills found for this citizen.</td>
                          </tr>
                        ) : (
                          citizenTaxes.map(ct => {
                            const { months, penalty, total } = calculateTaxPenalty(ct);
                            return (
                              <tr key={ct.id} className="border-b border-slate-50 hover:bg-slate-50/50 text-sm">
                                <td className="px-4 py-3 font-bold text-slate-900 capitalize">{ct.tax_type}</td>
                                <td className="px-4 py-3 font-bold text-slate-900">
                                  {penalty > 0 ? (
                                    <div>
                                      <span className="text-[10px] text-slate-400 line-through mr-1">₹{ct.amount}</span>
                                      <span className="text-[10px] text-rose-500 font-bold block">+₹{penalty.toFixed(2)} ({ct.penalty_rate}% × {months} mo)</span>
                                      <span className="text-sm font-black text-rose-600 block">₹{total.toFixed(2)}</span>
                                    </div>
                                  ) : (
                                    <span>₹{ct.amount}</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-500">{ct.due_date ? new Date(ct.due_date).toLocaleDateString("en-IN") : "—"}</td>
                                <td className="px-4 py-3">
                                  {ct.status === "paid" && <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-700 inline-flex items-center gap-0.5"><CheckCircle className="w-2.5 h-2.5"/> Paid</span>}
                                  {ct.status === "unpaid" && <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/10 text-rose-700 inline-flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5"/> Unpaid</span>}
                                  {ct.status === "pending" && <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/10 text-amber-700 inline-flex items-center gap-0.5"><Clock className="w-2.5 h-2.5"/> Verifying</span>}
                                </td>
                                <td className="px-4 py-3 text-xs font-mono text-slate-500">
                                  {ct.status === "paid" && ct.payment_date && (
                                    <div>
                                      <span className="block text-[10px] font-semibold text-slate-400">Paid on {new Date(ct.payment_date).toLocaleDateString("en-IN")}</span>
                                      <span className="block text-[10px] text-slate-500">TxID: {ct.transaction_id || "—"}</span>
                                    </div>
                                  )}
                                  {ct.status === "pending" && (
                                    <div className="flex items-center justify-between gap-2">
                                      <div>
                                        <span className="block text-[10px] text-slate-500">TxID: {ct.transaction_id || "—"}</span>
                                        <span className="block text-[9px] text-amber-500 font-bold uppercase">Awaiting Approval</span>
                                      </div>
                                      <Button onClick={() => handleApprove(ct.id)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1 text-[10px] h-7 px-2">
                                        <Check className="w-3 h-3" /> Approve
                                      </Button>
                                    </div>
                                  )}
                                  {ct.status === "unpaid" && <span className="text-slate-400">—</span>}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Modern Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-medium text-white ${
            toastType === "error" ? "bg-rose-600 shadow-rose-600/20" : "bg-slate-900 shadow-slate-900/20"
          }`}>
            {toastType === "error" ? (
              <AlertTriangle className="w-5 h-5 text-rose-200" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            )}
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
