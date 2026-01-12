"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { 
  Shield, 
  Users, 
  FileText, 
  MessageSquare, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  Globe,
  HandHelping,
  PhoneCall
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <nav className="h-24 px-8 md:px-20 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-primary w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900">Gram Sahayak</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          <button className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Services</button>
          <button className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Schemes</button>
          <button className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Notice Board</button>
          <button className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Contact</button>
        </div>

        <Link href="/login">
          <Button className="rounded-2xl px-8 shadow-xl shadow-primary/10">Portal Login</Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 md:px-20 pt-20 pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
              <Globe className="w-4 h-4" /> Digital India • Digital Village
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
              Gram Panchayat <br /> <span className="text-primary italic">Aapki Mutthi Mein.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
              Sarahi Gaav ka apna digital portal. Ab certificate, shikayat, aur sarkari yojnaon ki jaankari payein ghar baithe.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
               <Link href="/login">
                  <Button size="lg" className="rounded-2xl px-10 gap-2">
                    Start Citizen Services <ArrowRight className="w-5 h-5" />
                  </Button>
               </Link>
               <Button variant="outline" size="lg" className="rounded-2xl px-10 border-slate-200">
                  Explore Schemes
               </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-10">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                       <Users className="w-6 h-6 text-slate-300" />
                    </div>
                  ))}
               </div>
               <p className="text-sm font-bold text-slate-400">Join 10,000+ villagers already using the portal.</p>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white group">
               <img 
                 src="/village-hero.png" 
                 alt="Digital Panchayat" 
                 className="w-full h-auto aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
               <div className="absolute bottom-10 left-10 text-white">
                  <p className="text-sm font-black uppercase tracking-widest opacity-80 mb-1">Our Village</p>
                  <p className="text-2xl font-black italic">Sarahi Panchayat Bhawan</p>
               </div>
            </div>
            {/* Decorative blurs */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Quick Services Grid */}
      <section className="bg-slate-50 px-8 md:px-20 py-32 border-y border-slate-100">
         <div className="max-w-7xl mx-auto space-y-20">
            <div className="text-center space-y-4">
               <h2 className="text-4xl font-black text-slate-900 tracking-tight">Panchayat Digital Services</h2>
               <p className="text-slate-500 font-medium max-w-2xl mx-auto">Click on any service to login and start your application process.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 { title: "Certificate Issuance", desc: "Birth, Death, Income & Residence documents.", icon: FileText, color: "text-blue-600", bg: "bg-blue-500/10" },
                 { title: "Grievance Redressal", desc: "Report issues with water, road or electricity.", icon: MessageSquare, color: "text-rose-600", bg: "bg-rose-500/10" },
                 { title: "Sarkari Schemes", desc: "Check eligibility and apply for PM-Kisan & others.", icon: Globe, color: "text-emerald-600", bg: "bg-emerald-500/10" },
                 { title: "Citizen Support", desc: "Direct line to Panchayat Secretary & Sarpanch.", icon: HandHelping, color: "text-amber-600", bg: "bg-amber-500/10" },
               ].map((service, i) => (
                 <Link href="/login" key={i} className="group bg-white p-10 rounded-[3rem] premium-card hover:border-primary/30 transition-all text-left">
                    <div className={`w-14 h-14 ${service.bg} ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                       <service.icon className="w-7 h-7" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-3">{service.title}</h4>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">{service.desc}</p>
                    <div className="mt-8 flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                       Get Started <ChevronRight className="w-4 h-4" />
                    </div>
                 </Link>
               ))}
            </div>
         </div>
      </section>

      {/* Stats Section */}
      <section className="px-8 md:px-20 py-32 bg-slate-900 text-white relative overflow-hidden">
         <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 text-center relative z-10">
            {[
              { label: "Total Population", value: "8,500+" },
              { label: "Village Area", value: "450 Acre" },
              { label: "Digitized Records", value: "100%" },
              { label: "Active Users", value: "4,200+" },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                 <h3 className="text-4xl md:text-5xl font-black text-primary-light italic leading-none">{stat.value}</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
         </div>
         <div className="absolute bottom-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary rounded-full blur-[200px]" />
         </div>
      </section>

      {/* Footer */}
      <footer className="px-8 md:px-20 py-20 border-t border-slate-100">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
               <div className="bg-slate-900 w-8 h-8 rounded-lg flex items-center justify-center">
                 <Sparkles className="text-white w-4 h-4" />
               </div>
               <span className="font-black text-xl tracking-tighter text-slate-900">Gram Sahayak</span>
            </div>
            
            <p className="text-sm font-medium text-slate-400 mx-auto text-center md:text-left">
               © 2026 Sarahi Gram Panchayat Digital Cell. Madhya Pradesh Government.
            </p>

            <div className="flex items-center gap-6">
               <button className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-primary hover:text-white transition-all">
                  <PhoneCall className="w-5 h-5" />
               </button>
               <button className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-primary hover:text-white transition-all">
                  <Globe className="w-5 h-5" />
               </button>
            </div>
         </div>
      </footer>
    </div>
  );
}
