"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Heart, 
  AlertCircle, 
  Sparkles, 
  Clock,
  UserCheck,
  Users,
  FileText,
  Activity,
  History
} from "lucide-react";
import { api } from "@/lib/api";

export default function CitizenHealthCamps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    setUserId(localStorage.getItem("userId"));
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/health-camps", token);
      setCamps(data || []);
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingCamps = camps.filter(camp => {
    const campDate = new Date(camp.date);
    campDate.setHours(0, 0, 0, 0);
    return campDate >= today;
  });

  const pastCamps = camps.filter(camp => {
    const campDate = new Date(camp.date);
    campDate.setHours(0, 0, 0, 0);
    return campDate < today;
  });

  const activeCamps = activeTab === "upcoming" ? upcomingCamps : pastCamps;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section with modern badge & gradient background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-8 rounded-3xl border border-emerald-500/10">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Heart className="w-32 h-32 text-emerald-600 animate-pulse" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50/80 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
            <Sparkles className="w-3 h-3" /> Swasthya Seva Portal
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Health & Vaccination Camps
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl text-sm leading-relaxed">
            Register online for upcoming vaccination drives, free medical checkups, diagnostic camps, and health awareness sessions organised by the Gram Panchayat.
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
        <div className="flex gap-2 bg-slate-200/60 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
              activeTab === "upcoming"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Upcoming Camps ({upcomingCamps.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
              activeTab === "past"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <History className="w-3.5 h-3.5" /> Camp History ({pastCamps.length})
          </button>
        </div>
        <span className="text-xs text-slate-400 font-bold bg-white px-4 py-2.5 rounded-2xl border border-slate-100">
          Showing: {activeTab === "upcoming" ? "Active / Upcoming" : "Past / Ended"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Camp listings */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 font-medium text-sm">Fetching health camps...</p>
            </div>
          ) : activeCamps.length === 0 ? (
            <div className="p-12 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                {activeTab === "upcoming" ? <Heart className="w-8 h-8 text-slate-400" /> : <History className="w-8 h-8 text-slate-400" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  {activeTab === "upcoming" ? "No Upcoming Camps" : "No Past Camps"}
                </h3>
                <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                  {activeTab === "upcoming" 
                    ? "Currently, there are no upcoming health or vaccination camps scheduled."
                    : "There are no past health camp records available."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {activeCamps.map((camp) => {
                const isRegistered = camp.registrations?.some(
                  (reg) => String(reg.citizen_id) === String(userId)
                );

                return (
                  <div 
                    key={camp.id} 
                    className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-5 relative overflow-hidden group ${
                      activeTab === "past" ? "border-slate-100 opacity-80" : "border-slate-100/80 hover:border-emerald-500/20"
                    }`}
                  >
                    {/* Top highlights */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                        activeTab === "past" 
                          ? "bg-slate-100 text-slate-500" 
                          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}>
                        {camp.camp_type}
                      </span>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          {new Date(camp.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </span>
                        {camp.timing && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-teal-600" />
                            {camp.timing}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h4 className={`text-lg font-black leading-tight transition-colors ${
                        activeTab === "past" 
                          ? "text-slate-700" 
                          : "text-slate-900 group-hover:text-emerald-600"
                      }`}>
                        {camp.camp_name}
                      </h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        {camp.description}
                      </p>
                    </div>

                    {/* Meta info tags */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 font-semibold bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>Location: {camp.location}</span>
                      </div>
                      {camp.organizing_team && (
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-semibold bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          <Users className="w-4 h-4 text-blue-500 shrink-0" />
                          <span>By: {camp.organizing_team}</span>
                        </div>
                      )}
                    </div>

                    {/* Required docs if any */}
                    {camp.required_docs && (
                      <div className="p-3 bg-amber-50/30 border border-amber-500/10 rounded-xl text-xs text-amber-900 font-medium flex items-start gap-2">
                        <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Required Docs:</strong> {camp.required_docs}</span>
                      </div>
                    )}

                    {/* Footer / Actions */}
                    <div className="pt-4 border-t border-slate-100/50 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                        <UserCheck className="w-4 h-4 text-slate-400" />
                        {activeTab === "past" ? "Attended / Registered" : "Registrations"}: {camp.registrations?.length || 0} Citizens
                      </span>

                      {activeTab === "past" ? (
                        isRegistered ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black rounded-xl uppercase">
                            <ShieldCheck className="w-4 h-4" /> Registered
                          </div>
                        ) : (
                          <span className="text-xs bg-slate-100 text-slate-400 border border-slate-200 font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider">
                            Camp Ended
                          </span>
                        )
                      ) : isRegistered ? (
                        <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black rounded-xl uppercase">
                          <ShieldCheck className="w-4 h-4" /> Registered
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleRegister(camp.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs px-5 py-2.5 shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20"
                        >
                          Register for Camp
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Help Desk widget */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none rounded-3xl shadow-xl shadow-emerald-500/10 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <CardContent className="p-8 space-y-6">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-inner">
                <Heart className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tight">Health Desk Guidelines</h3>
                <p className="text-xs text-emerald-100 leading-relaxed font-medium">
                  Gram Panchayat organises periodic health camps, immunisation programs, and medical workshops. Always bring your Aadhaar Card and Health Booklet for seamless service.
                </p>
              </div>
              <div className="flex items-start gap-2 text-xs text-emerald-950 font-bold bg-white/95 p-4 rounded-2xl shadow-sm border border-emerald-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>Medications, consultations, and test diagnostics provided at Panchayat camps are completely free.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
