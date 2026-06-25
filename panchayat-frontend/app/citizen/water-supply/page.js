"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Clock, MapPin, AlertTriangle, Droplet, Info, Thermometer } from "lucide-react";
import { api } from "@/lib/api";

export default function CitizenWaterSupply() {
  const [schedules, setSchedules] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const schedData = await api.get("/water-supply", token);
        const tankData = await api.get("/water-supply/tanks", token);
        setSchedules(schedData);
        setTanks(tankData);
      } catch (error) {
        console.error("Failed to load water data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeAlerts = schedules.filter(s => s.status === "interrupted");

  const parseNotes = (rawNotes) => {
    let operator = "Unknown";
    let source = "Unknown";
    let text = rawNotes || "";

    const opMatch = text.match(/\[OPERATOR:\s*(.*?)\]/i);
    const srcMatch = text.match(/\[SOURCE:\s*(.*?)\]/i);

    if (opMatch) { operator = opMatch[1]; text = text.replace(opMatch[0], ''); }
    if (srcMatch) { source = srcMatch[1]; text = text.replace(srcMatch[0], ''); }

    return { operator: operator.trim(), source: source.trim(), text: text.trim() };
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 mb-2">Water Supply</h1>
        <p className="text-slate-500 font-medium">Daily supply schedule, water tank volumes, and maintenance warnings.</p>
      </div>

      {/* Emergency Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 p-6 rounded-[2rem] flex items-start gap-4 shadow-sm animate-pulse">
          <AlertTriangle className="w-8 h-8 shrink-0 mt-0.5 text-rose-600" />
          <div className="space-y-1">
            <h4 className="font-black text-base">Water Supply Interruption Notice</h4>
            {activeAlerts.map((alert, idx) => (
              <p key={idx} className="text-xs font-semibold leading-relaxed text-rose-600/90">
                {alert.area}: {parseNotes(alert.notes).text || "Emergency pipeline repairs are in progress. Timing is affected."}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Area-Wise Timings" subtitle="Daily water release timings by ward" />
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-center py-6 text-slate-400">Loading schedules...</p>
              ) : (
                schedules.map((sched) => {
                  const { operator, source, text: notesText } = parseNotes(sched.notes);
                  return (
                    <div key={sched.id} className="p-6 bg-slate-50 hover:bg-slate-100/50 transition-colors border border-slate-100 rounded-3xl flex items-center justify-between gap-6 flex-wrap md:flex-nowrap">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl shrink-0 ${sched.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                          <Droplet className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                          <h4 className="font-black text-lg text-slate-900">{sched.area}</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Supply Location</p>
                          {(operator !== "Unknown" || source !== "Unknown" || notesText) && (
                            <div className="mt-2 space-y-1 text-slate-500 font-semibold text-xs">
                              {operator !== "Unknown" && <p>👨‍🔧 Operator: <span className="font-bold text-slate-700">{operator}</span></p>}
                              {source !== "Unknown" && <p>💧 Source: <span className="font-bold text-slate-700">{source}</span></p>}
                              {notesText && <p>📝 Note: <span className="font-bold text-slate-700">{notesText}</span></p>}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-black text-slate-800 text-sm shrink-0">
                        <Clock className="w-4 h-4 text-primary" />
                        {sched.timing}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Tank Info & Info Box */}
        <div className="space-y-6">
          {/* Water Tanks */}
          <Card>
            <CardHeader title="Reservoir Status" subtitle="Village overhead water tanks capacity" />
            <CardContent className="space-y-6">
              {loading ? (
                <p className="text-center py-6 text-slate-400">Loading reservoirs...</p>
              ) : (
                tanks.map((tank) => (
                  <div key={tank.id} className="space-y-2 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                      <span className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" /> {tank.location}
                      </span>
                      <span className="text-blue-600 font-bold">{(tank.capacity || 0).toLocaleString()} Liters</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                      <span>Condition: {tank.condition}</span>
                      {tank.condition === "Good" ? (
                        <span className="text-emerald-500">Filled & Operational</span>
                      ) : tank.condition === "Maintenance Needed" ? (
                        <span className="text-amber-500">Under Maintenance</span>
                      ) : (
                        <span className="text-rose-500">Out of Service</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Conservation Widget */}
          <Card className="bg-blue-900 text-white border-0 overflow-hidden relative">
            <CardContent className="p-8 space-y-4 relative z-10">
              <div className="bg-white/10 backdrop-blur-md w-12 h-12 rounded-xl flex items-center justify-center">
                <Info className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black">Pani Bachao, Jeevan Bachao!</h4>
              <p className="text-xs text-blue-200 leading-relaxed font-semibold">
                Gram Panchayat rules forbid wastewater drainage from supply taps. Report water leaks directly to Ward clerks to avoid fine actions.
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
          </Card>
        </div>
      </div>
    </div>
  );
}
