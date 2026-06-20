"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { MapPin, Building2, GraduationCap, Droplets, Heart, Navigation, Search } from "lucide-react";
import { api } from "@/lib/api";

export default function CitizenMap() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchLocations(); }, []);

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/map/locations", token);
      setLocations(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const typeConfig = {
    building: { icon: Building2, color: "bg-indigo-500", label: "Sarkaari Bhawan", bg: "bg-indigo-500/10", text: "text-indigo-700" },
    school: { icon: GraduationCap, color: "bg-amber-500", label: "Shiksha Kendra", bg: "bg-amber-500/10", text: "text-amber-700" },
    water: { icon: Droplets, color: "bg-cyan-500", label: "Jal Strot", bg: "bg-cyan-500/10", text: "text-cyan-700" },
    health: { icon: Heart, color: "bg-rose-500", label: "Swasthya Kendra", bg: "bg-rose-500/10", text: "text-rose-700" },
  };

  const filtered = filter === "all" ? locations : locations.filter(l => l.type === filter);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 mb-2">Digital Village Map</h1>
        <p className="text-slate-500 font-medium">Gaon ke sabhi important sthaan — Bhawan, School, Jal Tank, Health Center.</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filter === "all" ? "bg-slate-900 text-white shadow-lg" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
          All Locations
        </button>
        {Object.entries(typeConfig).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${filter === key ? `${cfg.color} text-white shadow-lg` : `${cfg.bg} ${cfg.text} hover:opacity-80`}`}>
            <cfg.icon className="w-3.5 h-3.5" /> {cfg.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Visualization */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 h-[500px] rounded-b-3xl">
              {/* Grid overlay for map effect */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
                backgroundSize: "40px 40px"
              }} />
              
              {/* Village boundary shape */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[75%] border-2 border-dashed border-emerald-300/50 rounded-[4rem] rotate-3" />
              
              {/* Map pins */}
              {filtered.map((loc, idx) => {
                const cfg = typeConfig[loc.type] || typeConfig.building;
                const Icon = cfg.icon;
                // Map lat/lng to pixel positions within the container
                const baseX = 50 + (idx * 18) % 70;
                const baseY = 20 + (idx * 25) % 60;
                const isSelected = selected?.name === loc.name;
                
                return (
                  <button
                    key={loc.name}
                    onClick={() => setSelected(loc)}
                    className={`absolute group cursor-pointer transition-all duration-300 ${isSelected ? "z-20 scale-125" : "z-10 hover:scale-110"}`}
                    style={{ left: `${baseX}%`, top: `${baseY}%`, transform: `translate(-50%, -50%) ${isSelected ? "scale(1.25)" : ""}` }}
                  >
                    {/* Pin */}
                    <div className={`relative`}>
                      <div className={`w-12 h-12 ${cfg.color} rounded-2xl flex items-center justify-center text-white shadow-xl ${isSelected ? "ring-4 ring-white shadow-2xl" : ""} transition-all`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {/* Pulse effect */}
                      <div className={`absolute inset-0 ${cfg.color} rounded-2xl animate-ping opacity-20 pointer-events-none`} />
                      {/* Label */}
                      <div className={`absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black text-slate-700 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm border border-slate-100 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                        {loc.name}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Village Name Label */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-lg border border-slate-100">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Digital Map</p>
                <p className="text-sm font-bold text-slate-900">Gram Panchayat Sarahi</p>
              </div>

              {/* Compass */}
              <div className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-slate-100">
                <Navigation className="w-5 h-5 text-slate-600 -rotate-45" />
              </div>
            </div>
          </Card>
        </div>

        {/* Location Details Sidebar */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
            {filter === "all" ? "All Locations" : typeConfig[filter]?.label} ({filtered.length})
          </h3>
          
          {loading ? <p className="text-center py-8 text-slate-400">Loading map...</p> :
            filtered.map(loc => {
              const cfg = typeConfig[loc.type] || typeConfig.building;
              const Icon = cfg.icon;
              const isSelected = selected?.name === loc.name;

              return (
                <Card
                  key={loc.name}
                  className={`cursor-pointer transition-all duration-300 ${isSelected ? "ring-2 ring-slate-900 shadow-xl scale-[1.02]" : "hover:shadow-lg"}`}
                  onClick={() => setSelected(loc)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${cfg.text}`} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm">{loc.name}</h4>
                        <span className={`inline-block px-2 py-0.5 ${cfg.bg} ${cfg.text} text-[10px] font-black rounded-full uppercase`}>{cfg.label}</span>
                        <p className="text-xs text-slate-500 font-medium mt-1">{loc.details}</p>
                        <p className="text-[10px] text-slate-400 font-mono font-bold mt-1">
                          📍 {loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}
