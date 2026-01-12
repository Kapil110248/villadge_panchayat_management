"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Users, Search, UserPlus, Filter, MoreVertical, Edit2, Trash2, Eye } from "lucide-react";

const citizens = [
  { id: 1, name: "Ramesh Sharma", ward: "Ward 04", gender: "Male", phone: "9876543210", status: "Active" },
  { id: 2, name: "Sita Devi", ward: "Ward 02", gender: "Female", phone: "9988776655", status: "Active" },
  { id: 3, name: "Amit Meena", ward: "Ward 04", gender: "Male", phone: "9000011111", status: "Inactive" },
  { id: 4, name: "Sunita Verma", ward: "Ward 01", gender: "Female", phone: "9555544444", status: "Active" },
  { id: 5, name: "Vikram Singh", ward: "Ward 04", gender: "Male", phone: "9111122222", status: "Active" },
];

export default function CitizenManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Citizen Management</h1>
          <p className="text-slate-500">Gaav ke sabhi logo ka record yahan manage karein</p>
        </div>
        <Button><UserPlus className="w-4 h-4 mr-2" /> Naya Citizen Jodein</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 py-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-10" placeholder="Search by name, phone or ward..." />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Ward</Button>
            <Button variant="outline" size="sm">Export CSV</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-border">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Ward</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {citizens.map((citizen) => (
                  <tr key={citizen.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                           {citizen.name.charAt(0)}
                         </div>
                         <div className="font-semibold text-slate-900">{citizen.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{citizen.ward}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{citizen.phone}</div>
                      <div className="text-[10px] text-slate-400">{citizen.gender}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        citizen.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {citizen.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <button className="p-1.5 text-slate-400 group-hover:hidden"><MoreVertical className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-border flex items-center justify-between text-sm">
            <p className="text-slate-500 text-xs">Showing 5 of 1,240 citizens</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
