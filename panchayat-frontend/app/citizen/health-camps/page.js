"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Calendar, MapPin, Heart, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function CitizenHealthCamps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/health-camps", token);
      setCamps(data);
    } catch (error) {
      console.error("Failed to load camps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (campId) => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.post(`/health-camps/register?camp_id=${campId}`, {}, token);
      alert("Successfully registered for the health camp!");
      fetchCamps();
    } catch (error) {
      console.error(error);
      alert("Already registered or failed to register.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 mb-2">Health & Vaccination Camps</h1>
        <p className="text-slate-500 font-medium">Register for upcoming vaccination drives, awareness classes, and general health camps.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Camp listings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Upcoming Medical Programs" subtitle="Verify and register for upcoming medical sessions" />
            <CardContent className="space-y-6">
              {loading ? (
                <p className="text-center py-6 text-slate-400">Loading camps...</p>
              ) : (
                camps.map((camp) => (
                  <div key={camp.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-black rounded-full uppercase tracking-wider">
                        {camp.camp_type}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        {new Date(camp.date).toLocaleDateString("en-IN")}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{camp.camp_name}</h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2">{camp.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      Location: {camp.location}
                    </div>

                    <div className="pt-4 border-t border-slate-100/50 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-bold">
                        Registrations: {camp.registrations?.length || 0} Citizens
                      </span>
                      <Button
                        onClick={() => handleRegister(camp.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                      >
                        Register for Camp
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Help Desk widget */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50">
            <CardContent className="p-8 space-y-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-lg border border-emerald-100">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Health Desk</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Gram Panchayat organises vaccination drives for Polio/BCG/Hepatitis. Please carry Aadhar details during checkup visits.
                </p>
              </div>
              <div className="flex items-start gap-2 text-[10px] text-emerald-700 font-bold uppercase tracking-wide bg-white p-4 rounded-xl border border-emerald-100/50">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Medications distributed in medical camps are completely free.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
