"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, ShieldCheck, Edit3 } from "lucide-react";

export default function ClerkProfile() {
  const profileData = {
    name: "Maya Sharma",
    role: "Senior Panchayat Clerk",
    village: "Sarahi",
    shift: "Morning (09:00 AM - 03:00 PM)",
    email: "maya.clerk@gram.in",
    phone: "+91 98XXX XXXXX",
    joined: "12 March 2024",
    employeeId: "CLK-SAR-2024-05",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Karmachari <span className="text-primary">Profile</span></h1>
          <p className="text-slate-500 font-medium mt-1">Manage your professional identity and shift details.</p>
        </div>
        <Button className="gap-2 bg-slate-900"><Edit3 className="w-4 h-4" /> Edit Profile</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardContent className="p-10 flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border-4 border-white shadow-xl mb-6 overflow-hidden">
               <User className="w-16 h-16 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">{profileData.name}</h3>
            <p className="text-primary font-bold text-sm uppercase tracking-widest mt-1">{profileData.role}</p>
            
            <div className="w-full h-px bg-slate-100 my-8" />
            
            <div className="space-y-4 w-full">
               <div className="flex items-center gap-4 text-left p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Employee ID</p>
                     <p className="text-sm font-bold text-slate-900">{profileData.employeeId}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 text-left p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                     <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Shift Timing</p>
                     <p className="text-sm font-bold text-slate-900">{profileData.shift}</p>
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Personal & Contact Details" subtitle="Official records maintained in the Panchayat directory" />
          <CardContent className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mobile Number</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <Phone className="w-4 h-4 text-slate-400" />
                     <span className="font-bold text-slate-900">{profileData.phone}</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <Mail className="w-4 h-4 text-slate-400" />
                     <span className="font-bold text-slate-900">{profileData.email}</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Assigned Village</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <MapPin className="w-4 h-4 text-slate-400" />
                     <span className="font-bold text-slate-900">{profileData.village}</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Date of Joining</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <Calendar className="w-4 h-4 text-slate-400" />
                     <span className="font-bold text-slate-900">{profileData.joined}</span>
                  </div>
               </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100">
               <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Official Bio</h4>
               <p className="text-slate-500 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                  Responsible for citizen data entry, initial verification of certificate applications, and handling monthly grievance reports for the Sarahi Gram Panchayat. Reporting directly to the Panchayat Secretary.
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
