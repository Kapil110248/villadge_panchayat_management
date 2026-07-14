"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CreditCard, Receipt, ShieldCheck, HelpCircle, AlertCircle, Clock, CheckCircle, AlertTriangle, X, QrCode } from "lucide-react";
import { api } from "@/lib/api";

export default function CitizenTaxes() {
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
  const [analytics, setAnalytics] = useState(null);
  const [taxConfig, setTaxConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingTaxId, setPayingTaxId] = useState(null);
  
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedTax, setSelectedTax] = useState(null);
  const [manualTxId, setManualTxId] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const [taxData, analyticsData, configData] = await Promise.all([
        api.get("/taxes", token),
        api.get("/taxes/analytics", token),
        api.get("/taxes/config", token)
      ]);
      setTaxes(taxData);
      setAnalytics(analyticsData);
      setTaxConfig(configData);
    } catch (error) {
      console.error("Failed to load taxes:", error);
    } finally {
      setLoading(false);
    }
  };

  const openPayModal = (tax) => {
    setSelectedTax(tax);
    setManualTxId("");
    setShowPayModal(true);
  };

  const submitPayment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    setPayingTaxId(selectedTax.id);
    try {
      const token = localStorage.getItem("accessToken");
      await api.post("/taxes/pay", {
        tax_record_id: selectedTax.id,
        transaction_id: manualTxId || ("UPI-" + Math.floor(1000000000 + Math.random() * 9000000000))
      }, token);
      
      showToast(`Payment Submitted!`);
      setShowPayModal(false);
      fetchTaxes();
    } catch (error) {
      console.error("Payment failed:", error);
      showToast("Payment processing error. Try again.", "error");
    } finally {
      setPayingTaxId(null);
    }
  };

  const handlePrintReceipt = async (tax) => {
    try {
      const token = localStorage.getItem("accessToken");
      // Fetch Panchayat Details
      const pInfo = await api.get("/panchayat/info", token);
      const villageName = pInfo?.village || "Sarahi";
      const sarpanchName = pInfo?.name || "Ramesh Kumar";
      const contactNo = pInfo?.phone || "+91 88XXX XXXXX";
      const signatureUrl = pInfo?.signature_url || "";
      const backendUrl = process.env.NEXT_PUBLIC_API_URL 
        ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
        : 'http://localhost:8001';
      const fullSignatureUrl = signatureUrl 
        ? (signatureUrl.startsWith('http') ? signatureUrl : `${backendUrl}${signatureUrl}`)
        : '';
      
      const formattedPanchayatName = (
        villageName.toLowerCase().startsWith("gram") || 
        villageName.toLowerCase().includes("panchayat") || 
        villageName.toLowerCase().includes("panchyat")
      ) ? villageName : `Gram Panchayat ${villageName}`;
      
      const { months, penalty, total } = calculateTaxPenalty(tax);
      const taxpayerName = tax.citizen?.full_name || "N/A";
      const fatherName = tax.citizen?.profile?.father_name ? `S/O: ${tax.citizen.profile.father_name}` : "N/A";

      const printWindow = window.open('', '_blank', 'width=850,height=750');
      printWindow.document.write(`
        <html>
          <head>
            <title>Tax Receipt - ${formattedPanchayatName}</title>
            <style>
              @media print {
                body { padding: 5px; background: #fff; }
                .receipt-box { box-shadow: none !important; border: 3px double #059669 !important; padding: 20px 25px !important; }
                .receipt-box::before { top: 6px !important; left: 6px !important; right: 6px !important; bottom: 6px !important; }
              }
              body { font-family: 'Outfit', 'Inter', -apple-system, sans-serif; padding: 15px; color: #1e293b; background: #f8fafc; line-height: 1.4; }
              .receipt-box { max-width: 700px; margin: 0 auto; border: 3px double #10b981; border-radius: 20px; padding: 30px 35px; background: #fff; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); position: relative; }
              
              /* Decorative Corner Border Accent */
              .receipt-box::before { content: ""; position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px; border: 1px solid #e2e8f0; border-radius: 14px; pointer-events: none; }
              
              .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px dashed #cbd5e1; padding-bottom: 15px; margin-bottom: 20px; position: relative; z-index: 10; }
              .header-info { text-align: left; }
              .header h1 { margin: 0; color: #059669; font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
              .header p { margin: 2px 0 0; color: #64748b; font-size: 12px; font-weight: 600; }
              
              /* Stylized Dummy Barcode */
              .barcode-container { text-align: right; }
              .barcode-line { display: inline-block; width: 1.5px; height: 28px; background: #1e293b; margin: 0 1px; }
              .barcode-num { font-family: monospace; font-size: 8px; color: #64748b; letter-spacing: 1.5px; margin-top: 2px; text-transform: uppercase; }

              .details-grid { display: grid; grid-template-cols: 1.2fr 1fr; gap: 12px 20px; margin-bottom: 20px; font-size: 13px; position: relative; z-index: 10; }
              .info-block { display: flex; flex-direction: column; }
              .label { color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 9px; tracking: 1px; letter-spacing: 0.5px; margin-bottom: 2px; }
              .val { font-weight: 800; color: #0f172a; font-size: 13px; }
              
              .ledger-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; position: relative; z-index: 10; }
              .ledger-table th, .ledger-table td { padding: 10px 12px; text-align: left; }
              .ledger-table th { background-color: #f1f5f9; color: #475569; font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 6px; }
              .ledger-table td { font-size: 12px; font-weight: 700; color: #334155; border-bottom: 1px solid #f1f5f9; }
              
              .total-row { background-color: #f0fdf4; }
              .total-row td { color: #15803d !important; font-weight: 900 !important; font-size: 14px !important; border-bottom: none !important; }
              
              .stamp-sign { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; margin-bottom: 10px; font-size: 12px; font-weight: 700; color: #475569; position: relative; z-index: 10; }
              .signature-line { text-align: right; border-top: 2px solid #94a3b8; width: 150px; padding-top: 6px; font-size: 11px; font-weight: 800; color: #1e293b; }
              .seal-badge { display: flex; align-items: center; gap: 6px; color: #059669; font-weight: 800; font-size: 10px; text-transform: uppercase; border: 2px solid #a7f3d0; padding: 4px 10px; rounded: 12px; background: #f0fdf4; border-radius: 9999px; }

              .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 15px; font-weight: 600; position: relative; z-index: 10; }
            </style>
          </head>
          <body>
            <div class="receipt-box">
              <div class="header">
                <div class="header-info">
                  <h1>${formattedPanchayatName}</h1>
                  <p>Official Tax Payment Receipt</p>
                  <p style="font-size: 11px; color: #94a3b8; margin-top: 3px; font-weight: 700;">Sarpanch: ${sarpanchName} • Contact: ${contactNo}</p>
                </div>
                
                <div class="barcode-container">
                  <div>
                    <span class="barcode-line" style="height:25px; width:1px;"></span>
                    <span class="barcode-line" style="height:25px; width:3px;"></span>
                    <span class="barcode-line" style="height:25px; width:1px;"></span>
                    <span class="barcode-line" style="height:25px; width:2px;"></span>
                    <span class="barcode-line" style="height:25px; width:4px;"></span>
                    <span class="barcode-line" style="height:25px; width:1px;"></span>
                    <span class="barcode-line" style="height:25px; width:2px;"></span>
                  </div>
                  <div class="barcode-num">REC-${tax.id}</div>
                </div>
              </div>
              
              <div class="details-grid">
                <div class="info-block">
                  <span class="label">Taxpayer Name</span>
                  <span class="val">${taxpayerName}</span>
                </div>
                <div class="info-block">
                  <span class="label">Relation / Guardian</span>
                  <span class="val">${fatherName}</span>
                </div>
                <div class="info-block">
                  <span class="label">Receipt Number</span>
                  <span class="val" style="color: #059669;">REC-${tax.id}-${Math.floor(1000 + Math.random() * 9000)}</span>
                </div>
                <div class="info-block">
                  <span class="label">Transaction Reference</span>
                  <span class="val" style="font-family: monospace; font-size: 14px;">${tax.transaction_id || "—"}</span>
                </div>
                <div class="info-block">
                  <span class="label">Payment Date</span>
                  <span class="val">${tax.payment_date ? new Date(tax.payment_date).toLocaleDateString("en-IN") : "—"}</span>
                </div>
                <div class="info-block">
                  <span class="label">Status</span>
                  <span class="val" style="color: #059669; text-transform: uppercase;">PAID & VERIFIED</span>
                </div>
              </div>
              
              <table class="ledger-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Base Amount</th>
                    <th>Penalty Surcharge</th>
                    <th style="text-align: right;">Total Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="text-transform: capitalize; font-weight: 800;">${tax.tax_type} Tax Payment</td>
                    <td>₹${tax.amount.toFixed(2)}</td>
                    <td>${penalty > 0 ? `₹${penalty.toFixed(2)} (${tax.penalty_rate}% × ${months} mo)` : "₹0.00"}</td>
                    <td style="text-align: right; font-weight: 900; color: #0f172a;">₹${total.toFixed(2)}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3">Grand Total Received</td>
                    <td style="text-align: right;">₹${total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              
              <div class="stamp-sign">
                <div class="seal-badge">
                  <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  Verified Digitally
                </div>
                <div class="signature-line">
                  ${fullSignatureUrl ? `<img src="${fullSignatureUrl}" style="height: 38px; max-width: 130px; display: block; margin: 0 auto 2px auto; object-fit: contain;" alt="Signature"/>` : ""}
                  Authorised Signatory
                </div>
              </div>
              
              <div class="footer">
                Thank you for your valuable contribution towards the development of ${formattedPanchayatName}.
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 350);
    } catch (e) {
      console.error(e);
      showToast("Receipt print karne me error: " + e.message, "error");
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
                unpaidTaxes.map((tax) => {
                  const { months, penalty, total } = calculateTaxPenalty(tax);
                  return (
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
                          {tax.penalty_rate > 0 && (
                            <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                              penalty > 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                            }`}>
                              {penalty > 0 
                                ? `Overdue (${tax.penalty_rate}% Interest × {months} ${months === 1 ? 'Month' : 'Months'})` 
                                : `Late Penalty: ${tax.penalty_rate}% / Month if unpaid`
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Amount Due</p>
                          {penalty > 0 ? (
                            <div>
                              <p className="text-xs text-slate-400 line-through">₹{tax.amount.toFixed(2)}</p>
                              <p className="text-xs text-rose-500 font-bold">+₹{penalty.toFixed(2)}</p>
                              <p className="text-xl font-black text-rose-600">₹{total.toFixed(2)}</p>
                            </div>
                          ) : (
                            <p className="text-xl font-black text-rose-600">₹{tax.amount.toFixed(2)}</p>
                          )}
                        </div>
                        <Button
                          onClick={() => openPayModal(tax)}
                          disabled={payingTaxId !== null}
                          className="bg-primary hover:bg-primary-dark text-white rounded-xl font-bold px-6 py-3.5"
                        >
                          {payingTaxId === tax.id ? "Processing..." : "Pay Now"}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Pending Verification */}
          {pendingTaxes.length > 0 && (
            <Card className="bg-amber-50/50 border-amber-100">
              <CardHeader title="Verification Pending" subtitle="Payments currently under review by Admin" />
              <CardContent className="space-y-4">
                {pendingTaxes.map((tax) => {
                  const { months, penalty, total } = calculateTaxPenalty(tax);
                  return (
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
                          {penalty > 0 && (
                            <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                              Includes Late Penalty ({tax.penalty_rate}% × {months} {months === 1 ? 'Month' : 'Months'})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-amber-600">₹{total.toFixed(2)}</p>
                        {penalty > 0 && <span className="text-[10px] block text-slate-400 font-semibold">(Base: ₹{tax.amount.toFixed(2)})</span>}
                        <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Pending</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          <Card>
            <CardHeader title="Payment History" subtitle="List of paid tax receipts" />
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {paidTaxes.map((tax) => {
                  const { months, penalty, total } = calculateTaxPenalty(tax);
                  return (
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
                          {penalty > 0 && (
                            <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              Includes Late Penalty ({tax.penalty_rate}% × {months} {months === 1 ? 'Month' : 'Months'})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-600 block">₹{total.toFixed(2)}</span>
                          {penalty > 0 && <span className="text-[10px] block text-slate-400">(Base: ₹{tax.amount.toFixed(2)})</span>}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handlePrintReceipt(tax)}>
                          Receipt
                        </Button>
                      </div>
                    </div>
                  );
                })}
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

      {/* Payment Modal */}
      {showPayModal && selectedTax && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-900">Scan & Pay</h3>
                <p className="text-xs text-slate-500 mt-1 capitalize">{selectedTax.tax_type} Tax Payment</p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={submitPayment} className="p-6 space-y-6 overflow-y-auto">
              
              <div className="text-center space-y-4">
                <div className="bg-emerald-50 text-emerald-700 py-3 rounded-2xl border border-emerald-100">
                  <span className="text-xs font-black tracking-widest uppercase">Amount Due</span>
                  <div className="text-3xl font-black">₹{calculateTaxPenalty(selectedTax).total.toFixed(2)}</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-center">
                  {taxConfig?.upi_qr_url ? (
                    <img src={taxConfig.upi_qr_url} alt="Scan to pay" className="w-48 h-48 rounded-xl object-contain bg-white p-2 shadow-sm border border-slate-200" />
                  ) : (
                    <div className="w-48 h-48 rounded-xl bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                      <QrCode className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-bold text-center px-4">UPI QR not configured by Admin</span>
                    </div>
                  )}
                </div>

                {(taxConfig?.bank_name || taxConfig?.account_name || taxConfig?.upi_id) ? (
                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 text-left">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Payment directed to:</p>
                    <p className="text-sm font-black text-slate-700">{taxConfig.bank_name}</p>
                    <p className="text-xs font-semibold text-slate-500">{taxConfig.account_name}</p>
                    {taxConfig.upi_id && <p className="text-[10px] font-mono text-slate-400 mt-0.5">{taxConfig.upi_id}</p>}
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <a 
                  href={`gpay://upi/pay?pa=${taxConfig?.upi_id}&pn=${encodeURIComponent(taxConfig?.account_name || 'Panchayat')}&am=${selectedTax ? calculateTaxPenalty(selectedTax).total.toFixed(2) : 0}&cu=INR&tn=${encodeURIComponent((selectedTax?.tax_type || '') + ' Tax')}`}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-all text-slate-700"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-6 mb-2 object-contain" />
                  <span className="text-xs font-bold">Google Pay</span>
                </a>
                <a 
                  href={`phonepe://pay?pa=${taxConfig?.upi_id}&pn=${encodeURIComponent(taxConfig?.account_name || 'Panchayat')}&am=${selectedTax ? calculateTaxPenalty(selectedTax).total.toFixed(2) : 0}&cu=INR&tn=${encodeURIComponent((selectedTax?.tax_type || '') + ' Tax')}`}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50 transition-all text-slate-700"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-6 mb-2 object-contain" />
                  <span className="text-xs font-bold">PhonePe</span>
                </a>
                <a 
                  href={`paytmmp://pay?pa=${taxConfig?.upi_id}&pn=${encodeURIComponent(taxConfig?.account_name || 'Panchayat')}&am=${selectedTax ? calculateTaxPenalty(selectedTax).total.toFixed(2) : 0}&cu=INR&tn=${encodeURIComponent((selectedTax?.tax_type || '') + ' Tax')}`}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white hover:border-cyan-500 hover:bg-cyan-50 transition-all text-slate-700"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Paytm_logo.svg" alt="Paytm" className="h-4 mb-2 object-contain" />
                  <span className="text-xs font-bold">Paytm</span>
                </a>
                <a 
                  href={`upi://pay?pa=${taxConfig?.upi_id}&pn=${encodeURIComponent(taxConfig?.account_name || 'Panchayat')}&am=${selectedTax ? calculateTaxPenalty(selectedTax).total.toFixed(2) : 0}&cu=INR&tn=${encodeURIComponent((selectedTax?.tax_type || '') + ' Tax')}`}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 transition-all text-slate-700"
                >
                  <div className="h-6 mb-2 flex items-center justify-center text-slate-600 font-black">UPI</div>
                  <span className="text-xs font-bold">Other UPI App</span>
                </a>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button type="button" onClick={() => submitPayment()} disabled={payingTaxId !== null} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-emerald-500/20 disabled:opacity-50">
                  {payingTaxId !== null ? "Submitting..." : "I have paid successfully"}
                </Button>
                <p className="text-[10px] text-center text-slate-400 mt-2">Click above only after you have completed the payment via your UPI app.</p>
              </div>

            </form>
          </div>
        </div>
      )}

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
