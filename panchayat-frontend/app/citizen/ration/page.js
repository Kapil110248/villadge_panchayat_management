"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { 
  Calendar, 
  Clock, 
  ShoppingBag, 
  MapPin, 
  Store, 
  CreditCard, 
  Sparkles, 
  Fingerprint, 
  ShieldCheck, 
  HelpCircle,
  Info
} from "lucide-react";
import { api } from "@/lib/api";

export default function CitizenRation() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRation = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const data = await api.get("/ration", token);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeSchedules = (data.schedules || []).filter(sched => {
          const schedDate = new Date(sched.distribution_date);
          schedDate.setHours(0, 0, 0, 0);
          return schedDate >= today;
        });

        setSchedules(activeSchedules);
      } catch (error) {
        console.error("Failed to load ration schedule:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRation();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section with modern badge & gradient text */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-8 rounded-3xl border border-emerald-500/10">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShoppingBag className="w-32 h-32 text-emerald-600" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> PDS Portal
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Ration Distribution
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl text-sm leading-relaxed">
            Check active foodgrain distribution schedules, eligible card categories, designated ration shops (kotedar), and important verification instructions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Schedules list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Active Distribution Schedules
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
              {schedules.length} Active
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 font-medium text-sm">Fetching schedules...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="p-12 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">No Active Schedules</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                  There are no scheduled ration distributions at this moment. Please check back later or contact your local Panchayat representative.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {schedules.map((sched) => (
                <div 
                  key={sched.id} 
                  className="bg-white border border-slate-100/80 hover:border-emerald-500/20 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-6 relative overflow-hidden group"
                >
                  {/* Decorative Left Border Highlight */}
                  <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-gradient-to-b from-emerald-500 to-teal-500 rounded-l-full"></div>

                  <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Distribution Date</p>
                        <p className="text-sm font-bold text-slate-800">
                          {new Date(sched.distribution_date).toLocaleDateString("en-IN", { 
                            weekday: "long", 
                            year: "numeric", 
                            month: "long", 
                            day: "numeric" 
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-bold">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Timings</p>
                        <p className="text-sm font-bold text-slate-800">{sched.timing_description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <Store className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Ration Shop</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{sched.shop_name || "Designated Shop"}</p>
                      {sched.contact_number && (
                        <a href={`tel:${sched.contact_number}`} className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 mt-1 transition-all">
                          📞 {sched.contact_number}
                        </a>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <CreditCard className="w-4 h-4 text-teal-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Card Eligibility</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{sched.card_type || "All Cards"}</p>
                    </div>

                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Ward / Area</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{sched.ward_area || "Whole Village"}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/20 border border-emerald-500/10 rounded-2xl">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5" /> Items Available
                    </p>
                    <p className="text-sm font-semibold text-slate-700">{sched.items_available}</p>
                  </div>

                  {sched.special_instructions && (
                    <div className="p-4 bg-amber-50/30 border border-amber-500/10 rounded-2xl">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" /> Special Instructions
                      </p>
                      <p className="text-sm font-semibold text-amber-900 leading-relaxed">{sched.special_instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Digital Verification & Guide */}
        <div className="space-y-6">
          {/* Digital Verification Info */}
          <Card className="overflow-hidden border border-slate-900 bg-slate-900 text-white rounded-3xl relative shadow-xl shadow-slate-900/10">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <CardContent className="p-8 space-y-6">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">Biometric Verification</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Please ensure your biometrics are updated and verified on the Point-of-Sale (e-POS) machine at the ration shop during allocation.
                </p>
              </div>
              <div className="border-t border-slate-800 pt-6 space-y-3">
                <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Quick Checklist</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Aadhaar Link to Ration Card</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Active Mobile number registered</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Original Ration booklet verified</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Desk Info Card */}
          <Card className="border border-slate-100 rounded-3xl bg-white shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Need Help?</h4>
                <p className="text-[10px] text-slate-400 font-medium">Ration Shop helpline & grievance</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              If you experience issues with grain allocation, fingerprint mismatch, or shop timings, please contact the Panchayat Office or the Food Inspector helpline.
            </p>
            <div className="pt-2 border-t border-slate-50">
              {schedules[0]?.contact_number ? (
                <a href={`tel:${schedules[0].contact_number}`} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-2">
                  📞 Call Ration Distributor ({schedules[0].shop_name}) &rarr;
                </a>
              ) : (
                <a href="/citizen/directory" className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
                  View Contact Directory &rarr;
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
