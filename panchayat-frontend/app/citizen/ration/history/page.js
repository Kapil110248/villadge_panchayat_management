"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function CitizenRationHistory() {
  const [historySchedules, setHistorySchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const data = await api.get("/ration", token);
        
        const allSch = data.schedules || [];
        const pastSchedules = allSch.filter(sched => {
          const schedDate = new Date(sched.distribution_date);
          schedDate.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return schedDate < today;
        });

        setHistorySchedules(pastSchedules);
      } catch (error) {
        console.error("Failed to load ration history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto md:p-4">
      <div className="flex items-center gap-4">
        <Link href="/citizen/ration" className="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Ration History</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">View your past ration distribution events</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {loading ? (
              <p className="text-center py-8 text-slate-400 text-sm">Loading history...</p>
            ) : historySchedules.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold">No past records found.</p>
              </div>
            ) : (
              historySchedules.map(sched => (
                <div 
                  key={sched.id} 
                  className="bg-white border border-slate-200 shadow-sm rounded-3xl p-5 md:p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Completed On</p>
                        <p className="text-base font-bold text-slate-700">
                          {new Date(sched.distribution_date).toLocaleDateString("en-IN", { 
                            weekday: "long", year: "numeric", month: "long", day: "numeric" 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-1.5 bg-slate-100 text-slate-600 text-xs font-black rounded-full uppercase tracking-wider self-start sm:self-auto text-center border border-slate-200">
                      Ended
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ration Shop</p>
                      <p className="text-sm font-semibold text-slate-700">{sched.shop_name || "Designated Shop"}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Card Eligibility</p>
                      <p className="text-sm font-semibold text-slate-700">{sched.card_type || "All Cards"}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 sm:col-span-2 md:col-span-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Distributed</p>
                      <p className="text-sm font-semibold text-slate-700 line-clamp-2">{sched.items_available}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
