"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User, Mail, Phone, MapPin, Award, Calendar, ShieldAlert, Edit, Star } from "lucide-react";

export default function AdminProfile() {
  const adminData = {
    name: "Ramesh Kumar",
    role: "Panchayat Administrator (Sarpanch)",
    village: "Sarahi",
    tenure: "2023 - 2028",
    email: "ramesh.sarpanch@gram.in",
    phone: "+91 88XXX XXXXX",
    jurisdiction: "Sarahi Block A & B",
    rating: "4.8/5.0",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Prashasan <span className="text-primary">Profile</span></h1>
          <p className="text-slate-500 font-medium mt-1">Official profile of the Village Administrator.</p>
        </div>
        <Button className="gap-2 bg-primary text-white"><Edit className="w-4 h-4" /> Edit Profile</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-primary/20 bg-primary/5">
          <CardContent className="p-10 flex flex-col items-center text-center">
            <div className="relative mb-6">
               <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center border-4 border-primary/20 shadow-2xl overflow-hidden">
                  <User className="w-16 h-16 text-primary" />
               </div>
               <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white p-2 rounded-2xl shadow-lg">
                  <Star className="w-5 h-5 fill-current" />
               </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900">{adminData.name}</h3>
            <p className="text-primary font-black text-xs uppercase tracking-widest mt-1">{adminData.role}</p>
            
            <div className="w-full h-px bg-primary/10 my-8" />
            
            <div className="grid grid-cols-2 gap-4 w-full">
               <div className="bg-white p-4 rounded-2xl border border-primary/10 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Tenure</p>
                  <p className="text-xs font-black text-slate-900">{adminData.tenure}</p>
               </div>
               <div className="bg-white p-4 rounded-2xl border border-primary/10 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Rating</p>
                  <p className="text-xs font-black text-emerald-600">{adminData.rating}</p>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Administration Scope" subtitle="Official area of jurisdiction and direct responsibilities" />
          <CardContent className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mobile Contact</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <Phone className="w-4 h-4 text-slate-400" />
                     <span className="font-bold text-slate-900">{adminData.phone}</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Official Email</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <Mail className="w-4 h-4 text-slate-400" />
                     <span className="font-bold text-slate-900">{adminData.email}</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Village</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <MapPin className="w-4 h-4 text-slate-400" />
                     <span className="font-bold text-slate-900">{adminData.village}</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Jurisdiction</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <ShieldAlert className="w-4 h-4 text-slate-400" />
                     <span className="font-bold text-slate-900">{adminData.jurisdiction}</span>
                  </div>
               </div>
            </div>
            
            <div className="p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                     <Award className="w-6 h-6 text-primary-light" />
                     <h4 className="text-lg font-black tracking-tight">Administrative Honors</h4>
                  </div>
                  <ul className="space-y-2">
                     <li className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary-light rounded-full" />
                        Best Managed Village Award (MP Rural Dev, 2024)
                     </li>
                     <li className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary-light rounded-full" />
                        100% Digitization Target Achieved (Quarter 4, 2025)
                     </li>
                  </ul>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
