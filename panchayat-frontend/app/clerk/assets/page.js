"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Building2, MapPin, CheckCircle, AlertCircle, Hammer } from "lucide-react";
import { api } from "@/lib/api";

export default function ClerkAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/assets", token);
      setAssets(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const conditionColor = (c) => {
    if (c === "Good") return "bg-emerald-500/10 text-emerald-700";
    if (c === "Fair") return "bg-amber-500/10 text-amber-700";
    return "bg-rose-500/10 text-rose-700";
  };

  const conditionIcon = (c) => {
    if (c === "Good") return <CheckCircle className="w-4 h-4" />;
    if (c === "Fair") return <AlertCircle className="w-4 h-4" />;
    return <Hammer className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
          <Building2 className="w-3 h-3" /> Assets Ledger — Clerk View
        </div>
        <h1 className="text-4xl font-black text-slate-900">Village Assets</h1>
        <p className="text-slate-500 font-medium mt-1">View and audit panchayat property inventory.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center"><Building2 className="w-6 h-6 text-purple-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Assets</p><h3 className="text-2xl font-black text-slate-900">{assets.length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Good Condition</p><h3 className="text-2xl font-black text-slate-900">{assets.filter(a => a.condition === "Good").length}</h3></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center"><AlertCircle className="w-6 h-6 text-amber-600" /></div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Needs Attention</p><h3 className="text-2xl font-black text-slate-900">{assets.filter(a => a.condition !== "Good").length}</h3></div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Asset Inventory" subtitle="Panchayat buildings, tanks, and infrastructure" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <p className="col-span-full text-center py-8 text-slate-400">Loading...</p> :
              assets.map(a => (
                <div key={a.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 hover:shadow-lg hover:border-slate-200 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${conditionColor(a.condition)}`}>
                      {conditionIcon(a.condition)} {a.condition}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900">{a.name}</h4>
                  <p className="text-xs font-semibold text-slate-500">{a.asset_type}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                    <MapPin className="w-3 h-3" /> {a.location}
                  </div>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
