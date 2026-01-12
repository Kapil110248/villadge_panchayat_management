"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BookOpen, CheckCircle, ArrowRight, Home, IndianRupee, Tractor, GraduationCap } from "lucide-react";

const schemes = [
  {
    title: "PM Awas Yojana (Rural)",
    description: "Kachhe ghar ko pakka banane ke liye sarkar ki taraf se arthik sahayata.",
    benefit: "Up to ₹1.2 Lakh",
    category: "Housing",
    icon: Home,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "PM Kisan Samman Nidhi",
    description: "Khisano ke liye saalana ₹6,000 ki seedhi arthik madad.",
    benefit: "₹2,000 every 4 months",
    category: "Agriculture",
    icon: Tractor,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Vasantrao Naik Shiksha Yojna",
    description: "Rural area ke students ke liye higher education scholarship.",
    benefit: "Full Tuition Fee",
    category: "Education",
    icon: GraduationCap,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "MGNREGA - 100 Days Work",
    description: "Gaav ke har ek parivar ko saal me 100 din ka guaranteed rojgar.",
    benefit: "Daily Wages",
    category: "Employment",
    icon: IndianRupee,
    color: "bg-amber-100 text-amber-600",
  },
];

export default function SchemesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Government Schemes</h1>
          <p className="text-slate-500">Sarkari yojnaon ka labh uthayein</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-border">
          <button className="px-4 py-1.5 text-sm font-medium bg-primary text-white rounded-md shadow-sm">All</button>
          <button className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-primary transition-colors">Eligible</button>
          <button className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-primary transition-colors">My Applications</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {schemes.map((scheme, i) => (
          <Card key={i} className="group hover:border-primary/50 transition-all overflow-hidden">
            <CardContent className="p-0">
               <div className="flex h-full">
                  <div className={`w-28 flex flex-col items-center justify-center gap-2 ${scheme.color} border-r border-border/10`}>
                     <scheme.icon className="w-10 h-10" />
                     <span className="text-[10px] font-bold uppercase">{scheme.category}</span>
                  </div>
                  <div className="flex-1 p-6 space-y-4">
                     <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{scheme.title}</h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{scheme.description}</p>
                     </div>
                     <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">Benefit</p>
                           <p className="text-sm font-bold text-slate-900">{scheme.benefit}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10">
                           Details <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900 text-white border-none">
         <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
               <h3 className="text-2xl font-bold">Help Chahiye?</h3>
               <p className="text-slate-400">Agar aapko eligibility check karne me dikkat aa rahi hai toh Clerk se milein.</p>
            </div>
            <div className="flex gap-4">
               <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">Check Eligibility</Button>
               <Button className="bg-primary text-white hover:bg-primary/90">Contact Helpdesk</Button>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
