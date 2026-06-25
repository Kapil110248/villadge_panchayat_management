"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { BookOpen, Calendar, Clock, ShoppingBag, ShieldCheck, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export default function CitizenRation() {
  const [schedules, setSchedules] = useState([]);
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRation = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const data = await api.get("/ration", token);
        setSchedules(data.schedules || []);
        setQuota(data.quota || null);
      } catch (error) {
        console.error("Failed to load ration schedule:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRation();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 mb-2">Ration Distribution</h1>
        <p className="text-slate-500 font-medium">Monthly grain distribution schedules, item categories, and quota checking.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Schedules list */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Distribution Schedule" subtitle="Ration distribution dates for current period" />
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-center py-6 text-slate-400">Loading schedules...</p>
              ) : schedules.length === 0 ? (
                <p className="text-center py-6 text-slate-400">No schedules announced yet.</p>
              ) : (
                schedules.map((sched) => (
                  <div key={sched.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                        <Calendar className="w-4 h-4 text-primary" />
                        Date: {new Date(sched.distribution_date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                        <Clock className="w-4 h-4 text-primary" />
                        Timing: {sched.timing_description}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                      <div className="p-4 bg-white rounded-2xl border border-slate-100/50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ration Shop (Kotedar)</p>
                        <p className="text-sm font-bold text-slate-700">{sched.shop_name || "Any Designated Shop"}</p>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-slate-100/50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Card Eligibility</p>
                        <p className="text-sm font-bold text-slate-700">{sched.card_type || "All Cards"}</p>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-slate-100/50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ward / Area</p>
                        <p className="text-sm font-bold text-slate-700">{sched.ward_area || "Whole Village"}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-100/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Items Available</p>
                      <p className="text-sm font-semibold text-slate-700">{sched.items_available}</p>
                    </div>

                    {sched.special_instructions && (
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
                        <p className="text-[10px] font-black text-amber-600/80 uppercase tracking-widest mb-2">Special Instructions</p>
                        <p className="text-sm font-semibold text-amber-900">{sched.special_instructions}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Info Cards */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="My Ration Quota (Monthly)" />
            <CardContent className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="flex justify-between items-center">
                <span>Wheat (Genu)</span>
                <span className="font-black text-slate-900">
                  {quota ? `${quota.wheat} kg` : "10 kg"} 
                  {quota && <span className="text-[10px] text-slate-400 font-medium ml-1">(for {quota.family_size} member{quota.family_size > 1 ? 's' : ''})</span>}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Rice (Chawal)</span>
                <span className="font-black text-slate-900">
                  {quota ? `${quota.rice} kg` : "5 kg"}
                  {quota && <span className="text-[10px] text-slate-400 font-medium ml-1">(for {quota.family_size} member{quota.family_size > 1 ? 's' : ''})</span>}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sugar (Cheeni)</span>
                <span className="font-black text-slate-900">{quota ? `${quota.sugar} kg` : "1 kg"}</span>
              </div>
              {quota && (
                <div className="border-t border-slate-50 pt-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Ration Card Grade: {quota.card_type} (NFSA)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-6">
                    Card No: {quota.card_number}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-none">
            <CardContent className="p-8 space-y-4">
              <ShoppingBag className="w-10 h-10 text-emerald-400" />
              <h4 className="text-lg font-black">Digital Verification</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Kripya apani biometrics and ration card verification status point-of-sale machine par checked rakhein to ensure seamless distribution.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
