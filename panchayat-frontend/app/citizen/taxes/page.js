"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CreditCard, Receipt, ShieldCheck, HelpCircle, AlertCircle, Clock } from "lucide-react";
import { api } from "@/lib/api";

export default function CitizenTaxes() {
  const [taxes, setTaxes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingTaxId, setPayingTaxId] = useState(null);

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const [taxData, analyticsData] = await Promise.all([
        api.get("/taxes", token),
        api.get("/taxes/analytics", token)
      ]);
      setTaxes(taxData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Failed to load taxes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayTax = async (taxId) => {
    setPayingTaxId(taxId);
    try {
      // Simulate Payment gateway delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const token = localStorage.getItem("accessToken");
      const txId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      await api.post("/taxes/pay", {
        tax_record_id: taxId,
        transaction_id: txId
      }, token);
      
      alert(`Payment Success! Transaction ID: ${txId}`);
      fetchTaxes();
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment processing error. Try again.");
    } finally {
      setPayingTaxId(null);
    }
  };

  const unpaidTaxes = taxes.filter(t => t.status === "unpaid");
  const pendingTaxes = taxes.filter(t => t.status === "pending");
  const paidTaxes = taxes.filter(t => t.status === "paid");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 mb-2">Tax Payment Center</h1>
        <p className="text-slate-500 font-medium">Verify pending house/water taxes and download payment receipts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Unpaid & Paid Lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Due Taxes */}
          <Card>
            <CardHeader title="Pending Dues" subtitle="Taxes requiring immediate payment to avoid penalty charges" />
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-center py-6 text-slate-400">Loading taxes...</p>
              ) : unpaidTaxes.length === 0 ? (
                <div className="text-center py-10 bg-emerald-50 rounded-2xl border border-dashed border-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm font-bold">Saare Tax Bhugtan Ho Chuke Hain! Zero Dues.</p>
                </div>
              ) : (
                unpaidTaxes.map((tax) => (
                  <div key={tax.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg text-slate-900 capitalize">{tax.tax_type} Tax</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          Due Date: {new Date(tax.due_date).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Amount Due</p>
                        <p className="text-xl font-black text-rose-600">₹{tax.amount.toFixed(2)}</p>
                      </div>
                      <Button
                        onClick={() => handlePayTax(tax.id)}
                        disabled={payingTaxId !== null}
                        className="bg-primary hover:bg-primary-dark text-white rounded-xl font-bold px-6 py-3.5"
                      >
                        {payingTaxId === tax.id ? "Processing..." : "Pay Now"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Pending Verification */}
          {pendingTaxes.length > 0 && (
            <Card className="bg-amber-50/50 border-amber-100">
              <CardHeader title="Verification Pending" subtitle="Payments currently under review by Admin" />
              <CardContent className="space-y-4">
                {pendingTaxes.map((tax) => (
                  <div key={tax.id} className="p-6 bg-white border border-amber-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg text-slate-900 capitalize">{tax.tax_type} Tax</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          TxId: {tax.transaction_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-amber-600">₹{tax.amount.toFixed(2)}</p>
                      <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Pending</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          <Card>
            <CardHeader title="Payment History" subtitle="List of paid tax receipts" />
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {paidTaxes.map((tax) => (
                  <div key={tax.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 capitalize">{tax.tax_type} Tax Payment</h4>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          TxId: {tax.transaction_id} • Paid on {new Date(tax.payment_date).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-sm font-black text-emerald-600">₹{tax.amount.toFixed(2)}</span>
                      <Button variant="outline" size="sm" onClick={() => alert(`Receipt details for TxID: ${tax.transaction_id} downloaded.`)}>
                        Receipt
                      </Button>
                    </div>
                  </div>
                ))}
                {!loading && paidTaxes.length === 0 && (
                  <p className="text-center py-6 text-slate-400 text-xs italic">Koi payment history nahi mili.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Info Widgets */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-none shadow-2xl shadow-emerald-200/50">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-xl font-black text-white">Village Tax Revenue</h3>
              <p className="text-xs text-emerald-100 font-semibold leading-relaxed">
                Total tax collected by the panchayat this year. Your contributions help build a better village.
              </p>
              <div>
                <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Total Collected</p>
                <h3 className="text-4xl font-black text-white">₹{(analytics?.total_collected || 0).toLocaleString("en-IN")}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-0">
            <CardContent className="p-8 space-y-6">
              <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black">House & Water Tax</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold mt-1">
                  Tax collections are utilized for street lighting maintenance, garbage pickups, and water pipeline extensions across ward sectors.
                </p>
              </div>
              <div className="flex items-start gap-2 text-[10px] text-amber-400 font-bold uppercase tracking-wide bg-white/5 p-4 rounded-xl border border-white/5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Late payments attract 5% additional surcharge monthly.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
