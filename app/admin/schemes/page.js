"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, MoreHorizontal, Edit, Trash, Users } from "lucide-react";

const activeSchemes = [
  { id: 1, name: "PM Awas Yojana", applications: 450, approved: 120, status: "Active" },
  { id: 2, name: "MGNREGA Employment", applications: 1200, approved: 1100, status: "Active" },
  { id: 3, name: "CM Health Mission", applications: 85, approved: 40, status: "Paused" },
  { id: 4, name: "Village Solar Project", applications: 30, approved: 10, status: "Active" },
];

export default function SchemeManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scheme Management</h1>
          <p className="text-slate-500">Add or manage government schemes for villagers</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> Nayi Yojna Jodein</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-6">
               <p className="text-sm font-medium text-primary mb-1">Total Beneficiaries</p>
               <h3 className="text-3xl font-bold text-primary">2,450</h3>
               <div className="flex items-center gap-1 text-xs text-primary/60 mt-4">
                  <Users className="w-3.5 h-3.5" /> 12% increase from last month
               </div>
            </CardContent>
         </Card>
         <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-6">
               <p className="text-sm font-medium text-emerald-700 mb-1">Fund Distributed</p>
               <h3 className="text-3xl font-bold text-emerald-700">₹8.5L</h3>
               <div className="flex items-center gap-1 text-xs text-emerald-600 mt-4">
                  <Plus className="w-3.5 h-3.5" /> ₹1.2L this week
               </div>
            </CardContent>
         </Card>
         <Card className="bg-rose-50 border-rose-100">
            <CardContent className="p-6">
               <p className="text-sm font-medium text-rose-700 mb-1">Pending Queries</p>
               <h3 className="text-3xl font-bold text-rose-700">12</h3>
               <div className="flex items-center gap-1 text-xs text-rose-600 mt-4">
                  From 4 different schemes
               </div>
            </CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 py-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-10" placeholder="Search schemes..." />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Scheme Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total Applications</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Approved</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeSchemes.map((scheme) => (
                  <tr key={scheme.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{scheme.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{scheme.applications}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${(scheme.approved/scheme.applications)*100}%` }}></div>
                         </div>
                         <span className="text-[10px] font-bold text-slate-500">{scheme.approved}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        scheme.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}>
                        {scheme.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-1.5 hover:bg-slate-100 rounded-md transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-slate-400" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
