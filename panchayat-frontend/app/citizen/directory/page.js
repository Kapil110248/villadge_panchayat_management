"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Users, User, MapPin, Contact, ShieldCheck, Mail, Phone, Calendar } from "lucide-react";
import { api } from "@/lib/api";

export default function CitizenDirectory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await api.get("/directory", token);
        setData(res);
      } catch (error) {
        console.error("Failed to load directory:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDirectory();
  }, []);

  const userRecord = data[0];
  const family = userRecord?.family_head || userRecord?.family;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 mb-2">My Family Directory</h1>
        <p className="text-slate-500 font-medium">Verify members mapped to your household registration ledger.</p>
      </div>

      {loading ? (
        <p className="text-center py-6 text-slate-400">Loading directory details...</p>
      ) : !userRecord ? (
        <p className="text-center py-6 text-slate-400">No profile records found.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Family Circle details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader title="Household Circle" subtitle="Registered family members mapped to your ward address" />
              <CardContent className="p-0">
                {family ? (
                  <div className="divide-y divide-slate-100">
                    {/* Head */}
                    <div className="p-6 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
                          {family.head?.full_name?.charAt(0) || "H"}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{family.head?.full_name}</h4>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Head of Family</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[10px] font-black uppercase">Active</span>
                    </div>

                    {/* Members */}
                    {family.members && family.members.map((member, idx) => (
                      <div key={idx} className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-bold">
                            {member.full_name?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{member.full_name}</h4>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Family Member</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{member.email || "No email sync"}</span>
                      </div>
                    ))}

                    {family.members && family.members.length === 0 && (
                      <p className="text-center py-6 text-slate-400 text-xs italic">Household has no mapped sub-members.</p>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-3">
                    <Users className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-500">Aapka profile kisi Family ID se linked nahi hai.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Address & Ward Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Ward Mapping" />
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-rose-500 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Village Sector</p>
                    <p className="text-sm font-bold text-slate-900">{family?.ward_number || "Ward 04"}, Sarahi</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Contact className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered Land Address</p>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">{family?.address || userRecord?.profile?.address || "Sarahi village Block B"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-emerald-600 text-white border-0">
              <CardContent className="p-8 space-y-4">
                <ShieldCheck className="w-10 h-10 text-emerald-100" />
                <h4 className="text-lg font-black">Official Household</h4>
                <p className="text-xs text-emerald-100 leading-relaxed font-semibold">
                  Sarkari yojanaon, Ration and subsidies distribution calculations are done based on this mapped Family Directory ledger record.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
