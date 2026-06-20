"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { IndianRupee, CheckCircle, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";

export default function ClerkTaxes() {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTaxes(); }, []);

  const fetchTaxes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/taxes", token);
      setTaxes(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const paid = taxes.filter(t => t.status === "paid");
  const unpaid = taxes.filter(t => t.status === "unpaid");

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
          <IndianRupee className="w-3 h-3" /> Tax Center — Clerk View
        </div>
        <h1 className="text-4xl font-black text-slate-900">Tax Records</h1>
        <p className="text-slate-500 font-medium mt-1">View citizen tax payment records and pending dues.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Paid</p><h3 className="text-2xl font-black text-slate-900">{paid.length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-rose-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Unpaid</p><h3 className="text-2xl font-black text-slate-900">{unpaid.length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center"><IndianRupee className="w-6 h-6 text-indigo-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Records</p><h3 className="text-2xl font-black text-slate-900">{taxes.length}</h3></div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Tax Ledger" subtitle="All citizen tax records" />
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
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading...</td></tr>
                ) : taxes.map(t => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{t.citizen?.full_name || "—"}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.tax_type === "house" ? "bg-amber-500/10 text-amber-700" : "bg-cyan-500/10 text-cyan-700"}`}>{t.tax_type}</span></td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">₹{(t.amount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{t.due_date ? new Date(t.due_date).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.status === "paid" ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-700"}`}>{t.status}</span></td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{t.transaction_id || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
