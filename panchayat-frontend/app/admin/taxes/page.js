"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IndianRupee, TrendingUp, AlertTriangle, CheckCircle, PieChart, Download, Plus, Clock, Check, X } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminTaxes() {
  const [taxes, setTaxes] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showLevyModal, setShowLevyModal] = useState(false);
  const [levyForm, setLevyForm] = useState({ citizen_id: "", tax_type: "house", amount: "", due_date: "" });
  const [customTaxType, setCustomTaxType] = useState("");
  
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({ house_tax_amount: 500, water_tax_amount: 200, due_date: "" });

  const [toastMessage, setToastMessage] = useState("");

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
      setToastMessage("Payment Approved!");
      setTimeout(() => setToastMessage(""), 3000);
      fetchData();
    } catch (e) { alert(e.message); }
  };

  const handleLevy = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const finalTaxType = levyForm.tax_type === "other" ? customTaxType : levyForm.tax_type;
      
      await api.post("/taxes/levy", { ...levyForm, tax_type: finalTaxType, amount: parseFloat(levyForm.amount), due_date: new Date(levyForm.due_date).toISOString() }, token);
      setToastMessage("Tax Levied Successfully!");
      setTimeout(() => setToastMessage(""), 3000);
      setShowLevyModal(false);
      setLevyForm({ citizen_id: "", tax_type: "house", amount: "", due_date: "" });
      setCustomTaxType("");
      fetchData();
    } catch (e) { alert(e.message); }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.post("/taxes/generate", { ...generateForm, house_tax_amount: parseFloat(generateForm.house_tax_amount), water_tax_amount: parseFloat(generateForm.water_tax_amount), due_date: new Date(generateForm.due_date).toISOString() }, token);
      setToastMessage(res.message || "Taxes Generated Successfully!");
      setTimeout(() => setToastMessage(""), 3000);
      setShowGenerateModal(false);
      setCustomTaxType("");
      fetchData();
    } catch (e) { alert(e.message); }
  };

  const handleExport = () => {
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      const rows = taxes.map(t => `
        <tr>
          <td>${t.citizen?.full_name || "—"}</td>
          <td style="text-transform: capitalize;">${t.tax_type}</td>
          <td style="font-weight: bold;">₹${(t.amount || 0).toLocaleString("en-IN")}</td>
          <td>${t.due_date ? new Date(t.due_date).toLocaleDateString("en-IN") : "—"}</td>
          <td style="text-transform: uppercase; font-weight: bold; color: ${t.status === 'paid' ? '#10b981' : t.status === 'pending' ? '#f59e0b' : '#ef4444'};">${t.status}</td>
          <td style="font-family: monospace; color: #64748b;">${t.transaction_id || "—"}</td>
        </tr>
      `).join("");

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
            <IndianRupee className="w-3 h-3" /> Tax Revenue Center
          </div>
          <h1 className="text-4xl font-black text-slate-900">Tax Management</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor house tax, water tax collections and defaulter reports.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setShowLevyModal(true)} variant="outline" className="gap-2 rounded-2xl bg-white"><Plus className="w-4 h-4" /> Levy New Tax</Button>
          {!analytics?.has_generated_yearly && (
            <Button onClick={() => setShowGenerateModal(true)} className="gap-2 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white shadow-xl shadow-cyan-600/20"><TrendingUp className="w-4 h-4" /> Generate Yearly Taxes</Button>
          )}
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
        <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-100" title="All Tax Records" subtitle="Complete ledger of property and water taxes" />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Citizen</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {taxes.map(t => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{t.citizen?.full_name || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.tax_type === "house" ? "bg-amber-500/10 text-amber-700" : "bg-cyan-500/10 text-cyan-700"}`}>
                        {t.tax_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">₹{(t.amount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{t.due_date ? new Date(t.due_date).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="px-6 py-4">
                      {t.status === "paid" && <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-700 inline-flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Paid</span>}
                      {t.status === "unpaid" && <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/10 text-rose-700 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Unpaid</span>}
                      {t.status === "pending" && <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-700 inline-flex items-center gap-1"><Clock className="w-3 h-3"/> Verifying</span>}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{t.transaction_id || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      {t.status === "pending" && (
                        <Button onClick={() => handleApprove(t.id)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1 text-xs px-3">
                          <Check className="w-3 h-3" /> Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
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
                      {citizens.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
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

      {/* Generate Yearly Taxes Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowGenerateModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <CardContent className="p-8">
              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-cyan-600" /></div>
                  <div><h3 className="text-xl font-black text-slate-900">Generate Yearly Taxes</h3><p className="text-sm font-medium text-slate-500">Auto-assign tax bills to all citizens.</p></div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">House Tax Base Rate (₹)</label>
                    <input type="number" required value={generateForm.house_tax_amount} onChange={e => setGenerateForm({...generateForm, house_tax_amount: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Water Tax Base Rate (₹)</label>
                    <input type="number" required value={generateForm.water_tax_amount} onChange={e => setGenerateForm({...generateForm, water_tax_amount: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Due Date</label>
                    <input type="date" required value={generateForm.due_date} onChange={e => setGenerateForm({...generateForm, due_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none" />
                  </div>
                </div>
                <div className="pt-4">
                  <Button type="submit" className="w-full py-6 rounded-xl text-md font-bold bg-cyan-600 hover:bg-cyan-700 shadow-xl shadow-cyan-600/20">Generate For All Citizens</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modern Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            {toastMessage}
          </div>
        </div>
      )}

    </div>
  );
}
