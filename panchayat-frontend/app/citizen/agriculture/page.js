"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Tractor, 
  Info, 
  Sprout, 
  ClipboardList, 
  Sparkles, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Droplets,
  Link2,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Search,
  RefreshCw,
  BookOpen
} from "lucide-react";
import { api } from "@/lib/api";

// Static Crop Encyclopedia Database (specific to Indian agriculture)
const CROP_DATABASE = [
  {
    id: "wheat",
    name: "Wheat (गेहूँ)",
    season: "Rabi (रबी)",
    soil: "Clayey loam or deep loamy soil (दुमट मिट्टी)",
    temp: "10°C - 25°C",
    seeds: "40 - 45 kg per acre",
    watering: "4 to 6 times at critical stages (CRI, Flowering, Jointing)",
    fertilizer: "NPK (120:60:40 kg/ha) + Zinc Sulphate",
    pests: "Yellow Rust (पीला रतुआ), Loose Smut (कांगियारी)",
    yield: "18 - 22 quintals per acre"
  },
  {
    id: "paddy",
    name: "Paddy/Rice (धान)",
    season: "Kharif (खरीफ)",
    soil: "Clayey or loamy clay (चिकनी या जलोढ़ मिट्टी)",
    temp: "22°C - 32°C",
    seeds: "8 - 10 kg per acre (Transplanting)",
    watering: "High. Keep water standing at 2-3 cm for initial 25 days",
    fertilizer: "NPK (100:50:50 kg/ha) + Zinc Sulphate during transplanting",
    pests: "Stem Borer (तना छेदक), Blast disease (झुलसा रोग)",
    yield: "20 - 25 quintals per acre"
  },
  {
    id: "mustard",
    name: "Mustard (सरसों)",
    season: "Rabi (रबी)",
    soil: "Alluvial sandy loam (बलुई दुमट मिट्टी)",
    temp: "15°C - 25°C",
    seeds: "1.5 - 2 kg per acre",
    watering: "Low. 2 irrigations are enough (Flowering & Pod formation)",
    fertilizer: "NPK (80:40:40 kg/ha) + Sulphur (important for oil content)",
    pests: "Aphids (चेपा/माहू), White Rust (सफेद रतुआ)",
    yield: "8 - 10 quintals per acre"
  },
  {
    id: "cotton",
    name: "Cotton (कपास)",
    season: "Kharif (खरीफ)",
    soil: "Black cotton soil (काली मिट्टी या गहरी दुमट)",
    temp: "21°C - 30°C",
    seeds: "2 - 3 kg per acre (hybrid/Bt Cotton)",
    watering: "Moderate. 4 to 5 irrigations depending on rainfall",
    fertilizer: "NPK (120:60:60 kg/ha) in split doses",
    pests: "Pink Bollworm (गुलाबी सूंडी), Whitefly (सफेद मक्खी)",
    yield: "10 - 12 quintals per acre"
  },
  {
    id: "sugarcane",
    name: "Sugarcane (गन्ना)",
    season: "Annual crop (वार्षिक)",
    soil: "Deep rich loamy soil (गहरी उपजाऊ दुमट)",
    temp: "20°C - 35°C",
    seeds: "20 - 24 quintal setts per acre",
    watering: "High. Irrigation every 10-15 days during dry periods",
    fertilizer: "NPK (150:80:60 kg/ha) + High Nitrogen split doses",
    pests: "Top Borer (चोटी बेधक), Red Rot disease (लाल सड़न रोग)",
    yield: "300 - 400 quintals per acre"
  },
  {
    id: "gram",
    name: "Gram/Chana (चना)",
    season: "Rabi (रबी)",
    soil: "Sandy loam or mixed soil (हल्की दोमट मिट्टी)",
    temp: "15°C - 22°C",
    seeds: "30 - 35 kg per acre",
    watering: "Very Low. 1 irrigation before flowering if dry",
    fertilizer: "NPK (20:50:20 kg/ha) as starter dose",
    pests: "Pod Borer (फली छेदक), Wilt disease (उकठा रोग)",
    yield: "6 - 8 quintals per acre"
  },
  {
    id: "maize",
    name: "Maize (मक्का)",
    season: "Kharif (खरीफ)",
    soil: "Red loam or alluvial soil (लाल दोमट या जलोढ़)",
    temp: "21°C - 27°C",
    seeds: "8 - 10 kg per acre",
    watering: "Moderate. Critical stages: Tasseling & Silking",
    fertilizer: "NPK (120:60:40 kg/ha) split in 3 stages",
    pests: "Fall Armyworm (लश्करी सूंडी), Leaf Blight",
    yield: "15 - 20 quintals per acre"
  }
];

// Mock Live Mandi Price Generator (simulating real-time local mandi prices in India)
const MANDI_DATA = {
  "Sarahi Local Mandi": [
    { crop: "Wheat (गेहूँ)", minPrice: 2250, maxPrice: 2420, change: 15, trend: "up" },
    { crop: "Paddy (धान)", minPrice: 1950, maxPrice: 2180, change: -10, trend: "down" },
    { crop: "Mustard (सरसों)", minPrice: 5300, maxPrice: 5650, change: 45, trend: "up" },
    { crop: "Gram (चना)", minPrice: 4800, maxPrice: 5100, change: 0, trend: "stable" },
    { crop: "Maize (मक्का)", minPrice: 1850, maxPrice: 2020, change: 5, trend: "up" },
    { crop: "Soyabean (सोयाबीन)", minPrice: 4200, maxPrice: 4480, change: -30, trend: "down" }
  ],
  "Indore Mandi": [
    { crop: "Wheat (गेहूँ)", minPrice: 2310, maxPrice: 2480, change: 25, trend: "up" },
    { crop: "Paddy (धान)", minPrice: 2000, maxPrice: 2220, change: 10, trend: "up" },
    { crop: "Mustard (सरसों)", minPrice: 5450, maxPrice: 5720, change: -15, trend: "down" },
    { crop: "Gram (चना)", minPrice: 4950, maxPrice: 5200, change: 35, trend: "up" },
    { crop: "Soyabean (सोयाबीन)", minPrice: 4320, maxPrice: 4550, change: 20, trend: "up" }
  ],
  "Jaipur Mandi": [
    { crop: "Wheat (गेहूँ)", minPrice: 2290, maxPrice: 2460, change: -5, trend: "down" },
    { crop: "Mustard (सरसों)", minPrice: 5500, maxPrice: 5800, change: 60, trend: "up" },
    { crop: "Gram (चना)", minPrice: 4900, maxPrice: 5180, change: -10, trend: "down" },
    { crop: "Maize (मक्का)", minPrice: 1900, maxPrice: 2080, change: 15, trend: "up" }
  ]
};

export default function CitizenAgriculture() {
  const [data, setData] = useState({ schemes: [], advisories: [] });
  const [loading, setLoading] = useState(true);
  
  // Navigation tabs
  const [activePortalTab, setActivePortalTab] = useState("schemes"); // schemes, encyclopedia, mandi

  // Accordion details
  const [expandedScheme, setExpandedScheme] = useState(null);
  const [expandedAdvisory, setExpandedAdvisory] = useState(null);

  // Encyclopedia states
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [cropSearchQuery, setCropSearchQuery] = useState("");
  const [cropLoading, setCropLoading] = useState(false);
  // Mandi States (government Agmarknet dashboard style)
  const [mandiRatesAll, setMandiRatesAll] = useState([]);
  const [refreshingMandi, setRefreshingMandi] = useState(false);
  const [mandiSearch, setMandiSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");

  const fetchCropInfo = async (cropName) => {
    setCropLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.get(`/agriculture/crop-info?query=${encodeURIComponent(cropName)}`, token);
      if (res) {
        setSelectedCrop(res);
      }
    } catch (error) {
      console.error("Failed to load crop info:", error);
    } finally {
      setCropLoading(false);
    }
  };

  const fetchMandiRates = async () => {
    setRefreshingMandi(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.get("/agriculture/mandi-rates", token);
      if (res && res.mandiRates) {
        setMandiRatesAll(res.mandiRates);
      }
    } catch (error) {
      console.error("Failed to fetch mandi rates:", error);
    } finally {
      setRefreshingMandi(false);
    }
  };

  useEffect(() => {
    const fetchAgri = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await api.get("/agriculture", token);
        setData(res || { schemes: [], advisories: [] });
      } catch (error) {
        console.error("Failed to load agriculture data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgri();
    fetchMandiRates();
    fetchCropInfo("wheat");
  }, []);

  const refreshMandiPrices = () => {
    fetchMandiRates();
  };
  // Helper to parse Scheme JSON description
  const parseSchemeDesc = (descStr) => {
    try {
      if (descStr.startsWith("{")) {
        return JSON.parse(descStr);
      }
    } catch (e) {}
    return { description: descStr, eligibility: "All Farmers", required_docs: "Aadhaar Card, Land Records", deadline: "N/A" };
  };

  // Helper to parse Advisory JSON message
  const parseAdvisoryMsg = (msgStr) => {
    try {
      if (msgStr.startsWith("{")) {
        return JSON.parse(msgStr);
      }
    } catch (e) {}
    return { advisory_message: msgStr, soil_type: "All Types", pest_warning: "None reported", watering_info: "Standard irrigation" };
  };

  // Extract unique states, districts, and markets from mandiRatesAll for select dropdowns
  const uniqueStates = Array.from(new Set(mandiRatesAll.map(r => r.state)));
  const uniqueDistricts = Array.from(new Set(mandiRatesAll.filter(r => !selectedState || r.state === selectedState).map(r => r.district)));
  const uniqueMarkets = Array.from(new Set(mandiRatesAll.filter(r => (!selectedState || r.state === selectedState) && (!selectedDistrict || r.district === selectedDistrict)).map(r => r.market)));

  // Filter prices dynamically
  const filteredMandiRates = mandiRatesAll.filter(row => {
    const matchesSearch = row.crop.toLowerCase().includes(mandiSearch.toLowerCase()) || 
                          row.variety.toLowerCase().includes(mandiSearch.toLowerCase());
    const matchesState = !selectedState || row.state === selectedState;
    const matchesDistrict = !selectedDistrict || row.district === selectedDistrict;
    const matchesMarket = !selectedMarket || row.market === selectedMarket;
    return matchesSearch && matchesState && matchesDistrict && matchesMarket;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section with modern badge & gradient text */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-8 rounded-3xl border border-emerald-500/10">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sprout className="w-32 h-32 text-emerald-600 animate-pulse" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> Krishi Kalyan Portal
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Agriculture Help Center
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl text-sm leading-relaxed">
            Panchayat Krishi Seva Portal. Get live mandi wholesale prices, detailed crop guide lookup, active subsidies, and crop advice.
          </p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
        <div className="flex flex-wrap gap-2 bg-slate-200/60 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActivePortalTab("schemes")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
              activePortalTab === "schemes"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Schemes & Advisory
          </button>
          <button
            onClick={() => setActivePortalTab("encyclopedia")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
              activePortalTab === "encyclopedia"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Crop Encyclopedia
          </button>
          <button
            onClick={() => setActivePortalTab("mandi")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
              activePortalTab === "mandi"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Live Mandi Prices
          </button>
        </div>
        <span className="text-xs text-slate-400 font-bold bg-white px-4 py-2.5 rounded-2xl border border-slate-100">
          State: Madhya Pradesh / Rajasthan Region
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Renders depending on the Active Tab */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TAB 1: SCHEMES & ADVISORIES */}
          {activePortalTab === "schemes" && (
            <div className="space-y-8">
              {/* Subsidies / Schemes */}
              <Card className="rounded-[2rem] border-slate-100">
                <CardHeader title="Agriculture Subsidies & Schemes" subtitle="Check eligibility criteria, required documents, and apply online" />
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl space-y-3">
                      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-slate-400 font-medium text-sm">Loading schemes...</p>
                    </div>
                  ) : !data.schemes || data.schemes.length === 0 ? (
                    <p className="text-center py-6 text-slate-400 font-semibold bg-slate-50 rounded-2xl">No active schemes or subsidies found.</p>
                  ) : (
                    data.schemes.map((scheme) => {
                      const parsed = parseSchemeDesc(scheme.description);
                      const isExpanded = expandedScheme === scheme.id;
                      
                      return (
                        <div key={scheme.id} className="border border-slate-100 rounded-3xl hover:border-emerald-500/15 transition-all overflow-hidden bg-white shadow-sm">
                          <div 
                            onClick={() => setExpandedScheme(isExpanded ? null : scheme.id)}
                            className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <Tractor className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 text-base">{scheme.title}</h4>
                                <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">{scheme.benefit}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                                {isExpanded ? "Collapse Details" : "View Eligibility & Docs"}
                              </span>
                              {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-5 border-t border-slate-50 bg-slate-50/30 space-y-4 animate-in slide-in-from-top-2 duration-200">
                              <div className="space-y-1">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-slate-400" /> Scheme Description</h5>
                                <p className="text-xs text-slate-600 leading-relaxed font-semibold">{parsed.description}</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-1">
                                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Eligibility Criteria</h5>
                                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">{parsed.eligibility}</p>
                                </div>
                                <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-1">
                                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-blue-500" /> Required Documents</h5>
                                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">{parsed.required_docs}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 mt-2">
                                {parsed.deadline && (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                    <span>Deadline: {parsed.deadline}</span>
                                  </div>
                                )}
                                {scheme.link && (
                                  <a 
                                    href={scheme.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-600/10"
                                  >
                                    <Link2 className="w-3.5 h-3.5" /> Apply Online <ArrowRight className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {/* Advisories */}
              <Card className="rounded-[2rem] border-slate-100">
                <CardHeader title="Seasonal advisory logs" subtitle="Crop instructions, fertilizers, watering & pest warnings" />
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl space-y-3">
                      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-slate-400 font-medium text-sm">Loading advisories...</p>
                    </div>
                  ) : !data.advisories || data.advisories.length === 0 ? (
                    <p className="text-center py-6 text-slate-400 font-semibold bg-slate-50 rounded-2xl">No seasonal crop advisories posted.</p>
                  ) : (
                    data.advisories.map((adv) => {
                      const parsed = parseAdvisoryMsg(adv.advisory_message);
                      const isExpanded = expandedAdvisory === adv.id;

                      return (
                        <div key={adv.id} className="border border-slate-100 rounded-3xl hover:border-teal-500/15 transition-all overflow-hidden bg-white shadow-sm">
                          <div 
                            onClick={() => setExpandedAdvisory(isExpanded ? null : adv.id)}
                            className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full uppercase tracking-wider">
                                {adv.crop_name}
                              </span>
                              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{adv.month} Session</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                                {isExpanded ? "Collapse Details" : "View Irrigation & Fertilizer Details"}
                              </span>
                              {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-5 border-t border-slate-50 bg-slate-50/30 space-y-4 animate-in slide-in-from-top-2 duration-200">
                              <div className="space-y-1">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Sprout className="w-3.5 h-3.5 text-emerald-500" /> Sowing Advisory</h5>
                                <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-white p-3 rounded-xl border border-slate-100">{parsed.advisory_message}</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {parsed.soil_type && (
                                  <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-1">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-blue-500" /> Suitable Soil Type</h5>
                                    <p className="text-xs text-slate-700 font-bold">{parsed.soil_type}</p>
                                  </div>
                                )}
                                {parsed.watering_info && (
                                  <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-1">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-cyan-500 animate-pulse" /> Irrigation Routine</h5>
                                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">{parsed.watering_info}</p>
                                  </div>
                                )}
                              </div>

                              {adv.fertilizer_info && (
                                <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-1">
                                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Sprout className="w-3.5 h-3.5 text-teal-600" /> Fertilizer Dose & Timing</h5>
                                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">{adv.fertilizer_info}</p>
                                </div>
                              )}

                              {parsed.pest_warning && (
                                <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-1">
                                  <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Pest & Disease Warnings</h5>
                                  <p className="text-xs text-rose-800 font-semibold leading-relaxed">{parsed.pest_warning}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          {/* TAB 2: CROP ENCYCLOPEDIA */}
          {activePortalTab === "encyclopedia" && (
            <Card className="rounded-[2rem] border-slate-100 p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5.5 h-5.5 text-emerald-600" />
                  Krishi Gyan Kosh (कृषि ज्ञान कोष)
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Type any crop name or choose a popular one to load dynamic guides and Wikipedia articles instantly.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input 
                  type="text" 
                  placeholder="Type any crop (e.g. Tomato, Potato, Wheat, Garlic, Onion)..." 
                  value={cropSearchQuery}
                  onChange={e => setCropSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && cropSearchQuery.trim()) {
                      fetchCropInfo(cropSearchQuery);
                    }
                  }}
                  className="w-full pl-11 pr-24 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                />
                <button
                  onClick={() => {
                    if (cropSearchQuery.trim()) fetchCropInfo(cropSearchQuery);
                  }}
                  className="absolute right-2 top-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Search
                </button>
              </div>

              {/* Crop Grid Selectors */}
              <div className="flex flex-wrap gap-2">
                {CROP_DATABASE.map(crop => (
                  <button
                    key={crop.id}
                    onClick={() => fetchCropInfo(crop.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                      selectedCrop && selectedCrop.name?.toLowerCase().includes(crop.id)
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {crop.name}
                  </button>
                ))}
              </div>

              {/* Loading State */}
              {cropLoading ? (
                <div className="p-12 text-center bg-slate-50 border border-slate-100 rounded-3xl space-y-3">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-400 font-medium text-xs">Querying agricultural database & Wikipedia...</p>
                </div>
              ) : selectedCrop ? (
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/50 pb-4">
                    <div className="flex items-center gap-3">
                      {selectedCrop.thumbnail ? (
                        <img 
                          src={selectedCrop.thumbnail} 
                          alt={selectedCrop.name}
                          className="w-16 h-16 object-cover rounded-2xl border border-slate-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
                          <Sprout className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xl font-black text-slate-800">{selectedCrop.name}</h4>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Live Verified Info
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">About Crop (फसल के बारे में)</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">{selectedCrop.description}</p>
                    {selectedCrop.descriptionHindi && (
                      <p className="text-xs text-slate-600 leading-relaxed font-bold border-t border-slate-100 pt-2 mt-2 italic">
                        {selectedCrop.descriptionHindi}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Soil Suitability (मिट्टी)</span>
                      <p className="text-xs text-slate-800 font-bold">{selectedCrop.soil}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Growing Temperature (तापमान)</span>
                      <p className="text-xs text-slate-800 font-bold">{selectedCrop.temp}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Recommended Seeds (बीज दर)</span>
                      <p className="text-xs text-slate-800 font-bold">{selectedCrop.seeds}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Irrigation / Watering (सिंचाई)</span>
                      <p className="text-xs text-slate-800 font-bold">{selectedCrop.watering}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Fertilizer (खाद / उर्वरक)</span>
                    <p className="text-xs text-slate-700 font-semibold leading-relaxed">{selectedCrop.fertilizer}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-1">
                      <span className="text-[10px] text-rose-600 font-black uppercase tracking-widest flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Common Pests & Diseases</span>
                      <p className="text-xs text-rose-900 font-bold">{selectedCrop.pests}</p>
                    </div>
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1">
                      <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Expected Yield (पैदावार)</span>
                      <p className="text-xs text-emerald-900 font-bold">{selectedCrop.yield}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </Card>
          )}
          {/* TAB 3: LIVE MANDI PRICES */}
          {activePortalTab === "mandi" && (
            <Card className="rounded-[2rem] border-slate-100 p-6 space-y-6">
              {/* Government Style Header Emblem */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-slate-800 p-6 rounded-2xl text-white border-l-8 border-amber-500 shadow-md">
                <div>
                  <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                    Ministry of Agriculture & Farmers Welfare
                  </div>
                  <h3 className="text-lg font-black tracking-tight mt-1 flex items-center gap-2">
                    AGMARKNET National Market Price Portal (एगमार्कनेट)
                  </h3>
                  <p className="text-[10px] text-slate-300 font-medium">
                    Daily wholesale market arrivals and modal price lookup service.
                  </p>
                </div>
                
                {/* Refresh Trigger */}
                <Button 
                  onClick={refreshMandiPrices} 
                  disabled={refreshingMandi}
                  className="gap-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border-0 text-xs font-black shadow-lg"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshingMandi ? 'animate-spin' : ''}`} />
                  {refreshingMandi ? "Fetching..." : "Sync Live Feed"}
                </Button>
              </div>

              {/* Mandi Selectors and Search Filters (Government Search Panel) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">State (राज्य)</label>
                  <select 
                    value={selectedState} 
                    onChange={e => {
                      setSelectedState(e.target.value);
                      setSelectedDistrict("");
                      setSelectedMarket("");
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:border-blue-900 outline-none transition-all"
                  >
                    <option value="">-- All States (सभी राज्य) --</option>
                    {uniqueStates.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">District (जिला)</label>
                  <select 
                    value={selectedDistrict} 
                    disabled={!selectedState}
                    onChange={e => {
                      setSelectedDistrict(e.target.value);
                      setSelectedMarket("");
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:border-blue-900 outline-none transition-all disabled:opacity-50"
                  >
                    <option value="">-- All Districts --</option>
                    {uniqueDistricts.map(dt => (
                      <option key={dt} value={dt}>{dt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Mandi / Market (बाजार)</label>
                  <select 
                    value={selectedMarket} 
                    disabled={!selectedDistrict}
                    onChange={e => setSelectedMarket(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:border-blue-900 outline-none transition-all disabled:opacity-50"
                  >
                    <option value="">-- All Mandis --</option>
                    {uniqueMarkets.map(mk => (
                      <option key={mk} value={mk}>{mk}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Search Crop (फसल खोजें)</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      placeholder="e.g. Wheat, Onion..." 
                      value={mandiSearch}
                      onChange={e => setMandiSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-blue-900 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Price Feed Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold uppercase border-b border-slate-200 text-[10px]">
                        <th className="p-3">State</th>
                        <th className="p-3">District</th>
                        <th className="p-3">Market (मंडी)</th>
                        <th className="p-3">Commodity (फसल)</th>
                        <th className="p-3">Variety</th>
                        <th className="p-3 text-center">Grade</th>
                        <th className="p-3">Min Rate</th>
                        <th className="p-3">Max Rate</th>
                        <th className="p-3 bg-amber-500/10 text-amber-900">Modal Rate (औसत)</th>
                        <th className="p-3 text-center">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMandiRates.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="text-center py-12 text-slate-400 font-medium">
                            No market arrivals found matching your query.
                          </td>
                        </tr>
                      ) : (
                        filteredMandiRates.map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors">
                            <td className="p-3 font-semibold text-slate-600">{row.state}</td>
                            <td className="p-3 text-slate-600">{row.district}</td>
                            <td className="p-3 font-bold text-slate-700">{row.market}</td>
                            <td className="p-3 font-black text-blue-900">{row.crop}</td>
                            <td className="p-3 font-bold text-slate-600">{row.variety}</td>
                            <td className="p-3 text-center"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500">{row.grade}</span></td>
                            <td className="p-3 text-slate-600 font-semibold">₹ {row.minPrice} / Qtl</td>
                            <td className="p-3 text-slate-600 font-semibold">₹ {row.maxPrice} / Qtl</td>
                            <td className="p-3 bg-amber-500/5 font-black text-amber-900">₹ {row.modalPrice} / Qtl</td>
                            <td className="p-3 text-center">
                              {row.trend === "up" ? (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  ▲ +{row.change}
                                </span>
                              ) : row.trend === "down" ? (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                  ▼ {row.change}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                  Stable
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50/50 rounded-xl border border-amber-100/50 text-[10px] text-amber-800 font-medium">
                <Info className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Prices fetched directly from AGMARKNET regional portals. Updates occur daily around 11:30 AM based on wholesale market arrivals.
                </span>
              </div>
            </Card>
          )}

        </div>

        {/* Right column sidebar */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-0 rounded-[2rem] relative overflow-hidden shadow-xl shadow-slate-900/10">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <CardContent className="p-8 space-y-6">
              <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                <Sprout className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black">Soil testing updates</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Panchayat provides soil health cards indicating nitrogen, phosphorus, and organic carbon configurations. Check at the helpdesk.
                </p>
              </div>
              <div className="border-t border-slate-800 pt-6 space-y-3">
                <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Services Checklist</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Free soil testing kit check</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Fertilizer subsidy certificates</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Solar pump application check</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call Help card */}
          <Card className="border border-slate-100 rounded-3xl bg-white shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Agriculture Helpline</h4>
                <p className="text-[10px] text-slate-400 font-medium">24/7 Krishi Mitra Helpline</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              For immediate support regarding seed quality, weather alerts, crop failure compensation, or tube-well connection issues, call the Krishi Kalyan Helpline.
            </p>
            <div className="pt-2 border-t border-slate-50">
              <a href="tel:18001801551" className="text-xs font-black text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1.5">
                📞 Call Kisan Helpline (1800-180-1551) &rarr;
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
