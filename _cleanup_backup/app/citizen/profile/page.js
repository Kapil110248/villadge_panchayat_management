"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User, Phone, Mail, MapPin, Shield, Camera, Edit3, Award, Users, FileText, ChevronRight } from "lucide-react";

export default function ProfilePage() {
  const citizenData = {
    name: "Ramesh Kumar",
    ward: "Ward 04, Sarahi",
    aadhar: "XXXX XXXX 1234",
    phone: "+91 98765 43210",
    email: "ramesh.k@gmail.com",
    dob: "15 March 1988",
    address: "House No 45, Near Hanuman Mandir, Ward 04, Village Sarahi, District Rewa, MP - 486001",
    members: [
      { name: "Sunita Kumar", relation: "Wife", age: "32" },
      { name: "Rahul Kumar", relation: "Son", age: "12" },
      { name: "Priya Kumar", relation: "Daughter", age: "8" },
    ]
  };

  return (
    <div className="space-y-10">
      {/* Premium Header Profile */}
      <div className="relative p-10 bg-white rounded-[3rem] premium-card overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative group">
            <div className="w-40 h-40 bg-slate-100 rounded-[3rem] p-1.5 shadow-2xl border-2 border-white group-hover:scale-105 transition-transform duration-500">
               <div className="w-full h-full bg-white rounded-[2.5rem] flex items-center justify-center overflow-hidden">
                  <User className="w-20 h-20 text-slate-200" />
               </div>
            </div>
            <button className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-2xl shadow-xl hover:bg-primary-dark transition-all scale-90 group-hover:scale-100">
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
               <Shield className="w-3 h-3" /> Verified Citizen
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{citizenData.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4">
              <span className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> {citizenData.ward}
              </span>
              <span className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" /> Grade-A Ration Card
              </span>
            </div>
          </div>

          <div className="flex gap-3">
             <Button variant="outline" className="rounded-2xl border-slate-200">View QR Code</Button>
             <Button className="bg-slate-900 rounded-2xl gap-2"><Edit3 className="w-4 h-4" /> Edit Profile</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader title="Information Overview" subtitle="Official identity and contact synchronization" />
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Aadhar Association</p>
                  <p className="text-lg font-black text-slate-900">{citizenData.aadhar}</p>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                     <div className="bg-emerald-500 h-full w-full" />
                  </div>
               </div>
               
               <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Mobile Connectivity</p>
                  <p className="text-lg font-black text-slate-900">{citizenData.phone}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight italic">✓ Active for SMS Alerts</p>
               </div>

               <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Email Sync</p>
                  <p className="text-lg font-black text-slate-900">{citizenData.email}</p>
               </div>

               <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Date of Birth</p>
                  <p className="text-lg font-black text-slate-900">{citizenData.dob}</p>
               </div>

               <div className="md:col-span-2 space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Residential Landmark</p>
                  <p className="text-base font-bold text-slate-700 leading-relaxed uppercase tracking-tight truncate">
                    {citizenData.address}
                  </p>
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Household Circle" subtitle="Members linked to your official address" />
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50">
                  {citizenData.members.map((member, i) => (
                    <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white border-2 border-slate-50 rounded-2xl flex items-center justify-center text-sm font-black text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:rotate-6 transition-all shadow-sm">
                           {member.name.charAt(0)}
                        </div>
                        <div>
                           <p className="text-lg font-black text-slate-900">{member.name}</p>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{member.relation} • {member.age} Years</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
               </div>
               <div className="p-6">
                  <Button variant="ghost" className="w-full rounded-2xl border-2 border-dashed border-slate-100 hover:border-primary/20 hover:bg-primary/5 text-slate-400 hover:text-primary">
                    <Users className="w-4 h-4 mr-2" /> Add Family Member
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="bg-slate-900 text-white border-none relative overflow-hidden">
              <CardHeader title="Digital Vault" className="border-white/5" />
              <CardContent className="space-y-4 relative z-10">
                 {[
                   { name: "Aadhar Certificate", status: "Verified", icon: Shield, color: "text-emerald-400" },
                   { name: "Ration Identity", status: "Verified", icon: Award, color: "text-amber-400" },
                   { name: "Property Tax Receipt", status: "Missing", icon: FileText, color: "text-rose-400" },
                 ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl rounded-[1.5rem] border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${doc.color}`}>
                             <doc.icon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold">{doc.name}</span>
                       </div>
                       <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded-lg ${
                         doc.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                       }`}>
                         {doc.status}
                       </span>
                    </div>
                 ))}
                 <div className="pt-6">
                    <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10 rounded-2xl">Upload New Document</Button>
                 </div>
              </CardContent>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
           </Card>

           <Card className="p-8 text-center bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-100">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-emerald-200">
                 <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2">Security Hub</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                Your data is encrypted and protected by the Panchayat Digital Security Act.
              </p>
              <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 w-full rounded-xl">View Privacy Log</Button>
           </Card>
        </div>
      </div>
    </div>
  );
}
