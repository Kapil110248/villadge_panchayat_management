"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Tractor, Info, Sprout, ClipboardList } from "lucide-react";
import { api } from "@/lib/api";

export default function CitizenAgriculture() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgri = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await api.get("/agriculture", token);
        setData(res);
      } catch (error) {
        console.error("Failed to load agriculture data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgri();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 mb-2">Agriculture Help Center</h1>
        <p className="text-slate-500 font-medium">Verify crop advisory schedules, government farming subsidies, and fertilizer listings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Schemes and advisories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subsidies / Schemes */}
          <Card>
            <CardHeader title="Agriculture Subsidies & Schemes" subtitle="Active financial aid and machinery schemes" />
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-center py-6 text-slate-400">Loading schemes...</p>
              ) : (
                data.schemes.map((scheme) => (
                  <div key={scheme.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                        <Tractor className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg text-slate-900">{scheme.title}</h4>
                        <p className="text-sm text-slate-500 mt-1 font-semibold">{scheme.description}</p>
                      </div>
                    </div>
                    <span className="font-black text-emerald-600 text-sm whitespace-nowrap">{scheme.benefit}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Advisories */}
          <Card>
            <CardHeader title="Seasonal advisory logs" subtitle="Crop instructions and fertilizer guidance" />
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-center py-6 text-slate-400">Loading advisories...</p>
              ) : (
                data.advisories.map((adv) => (
                  <div key={adv.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full uppercase tracking-wider">
                        {adv.crop_name} Sowing
                      </span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{adv.month} Session</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                      {adv.advisory_message}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column sidebar */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-0">
            <CardContent className="p-8 space-y-6">
              <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center">
                <Sprout className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-lg font-black">Soil testing updates</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium mt-1">
                  Panchayat provides soil health cards indicating nitrogen, phosphorus, and organic carbon configurations. Check at the helpdesk.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
