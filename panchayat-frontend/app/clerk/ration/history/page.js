"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Calendar, ArrowLeft, Clock } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function ClerkRationHistory() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/ration", token);
      const allSchedules = data.schedules || data;
      
      const pastSchedules = allSchedules.filter(s => {
        const d = new Date(s.distribution_date);
        d.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d < today;
      });
      
      setSchedules(pastSchedules);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/clerk/ration" className="p-3 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 rounded-xl transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-500/10 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-2">
            <Clock className="w-3 h-3" /> History
          </div>
          <h1 className="text-3xl font-black text-slate-900">Past Distribution Events</h1>
          <p className="text-slate-500 font-medium mt-1">Review previously completed ration schedules.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {loading ? (
            <p className="text-center py-8 text-slate-400">Loading history...</p>
          ) : schedules.length === 0 ? (
            <p className="text-center py-8 text-slate-400">No past schedules found.</p>
          ) : (
            schedules.map(s => (
              <div key={s.id} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-3 opacity-90">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-700 text-sm">
                        {s.distribution_date ? new Date(s.distribution_date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "TBD"}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold">{s.timing_description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-slate-200 text-slate-600 text-[10px] font-black rounded-full uppercase">Completed</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ration Shop (Kotedar)</p>
                    <p className="text-sm font-bold text-slate-700">{s.shop_name || "Any Designated Shop"}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Card Eligibility</p>
                    <p className="text-sm font-bold text-slate-700">{s.card_type || "All Cards"}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Available</p>
                    <p className="text-sm font-bold text-slate-700">{s.items_available}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
