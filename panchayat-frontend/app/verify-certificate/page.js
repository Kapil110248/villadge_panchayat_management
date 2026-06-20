"use client";

import { useState } from "react";
import { Landmark, ShieldCheck, XCircle, Search, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { api } from "@/lib/api";

export default function VerifyCertificatePage() {
  const [certId, setCertId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certId) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Direct call to public API
      const data = await api.get(`/certificates/verify-pub/${certId.trim()}`);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Prashasan records me is ID ka koi certificate nahi mila. Kripya check karke dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4">
      <div className="max-w-xl w-full mx-auto space-y-8">
        {/* Header Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
              <Landmark className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">GP-Digital Verification</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-950">Verify Digital Certificate</h1>
          <p className="text-slate-500 font-semibold mt-1">QR Code scan karein ya unique ID enter karke check karein.</p>
        </div>

        {/* Search Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Unique Certificate ID</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. CERT-2026-XXXXXX"
                  className="w-full bg-slate-50 border-2 border-transparent pl-12 pr-4 py-3.5 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full py-6 text-base font-bold rounded-xl shadow-lg" disabled={loading}>
              {loading ? "Verifying Record..." : "Verify Authenticity"}
            </Button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 p-5 rounded-2xl flex items-start gap-3">
              <XCircle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Verification Failed</h4>
                <p className="text-xs mt-1 font-medium leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="bg-emerald-50 border-2 border-emerald-100 text-emerald-800 p-6 rounded-2xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 text-white p-2.5 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-base">Verified Authenticity</h4>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Official Record Match</p>
                </div>
              </div>

              <div className="border-t border-emerald-100/50 pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-emerald-700/70 font-semibold">Certificate ID</span>
                  <span className="font-black text-slate-900">{result.application_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700/70 font-semibold">Citizen Name</span>
                  <span className="font-black text-slate-900">{result.citizen_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700/70 font-semibold">Type</span>
                  <span className="font-black text-slate-900 capitalize">{result.type} Certificate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700/70 font-semibold">Issue Date</span>
                  <span className="font-black text-slate-900">
                    {result.issue_date ? new Date(result.issue_date).toLocaleDateString("en-IN") : "---"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700/70 font-semibold">Status</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
                    {result.status}
                  </span>
                </div>
                {result.remarks && (
                  <div className="bg-white/50 p-4 rounded-xl text-xs text-slate-600 italic">
                    {result.remarks}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 font-medium">
        © 2026 Gram Panchayat Sarahi. Powered by Digital India.
      </div>
    </div>
  );
}
