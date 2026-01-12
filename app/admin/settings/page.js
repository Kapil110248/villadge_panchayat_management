"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Settings, Shield, Bell, Globe, User, Save } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Portal <span className="text-primary">Settings</span></h1>
        <p className="text-slate-500 font-medium mt-1">Configure global village parameters and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <Card>
               <CardHeader title="General Configuration" subtitle="Village name and primary contact details" />
               <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Input label="Gram Panchayat Name" defaultValue="Sarahi" />
                     <Input label="District" defaultValue="Rewa" />
                  </div>
                  <Input label="Official Email ID" defaultValue="panchayat.sarahi@mp.gov.in" />
                  <div className="pt-4">
                     <Button className="gap-2 bg-primary"><Save className="w-4 h-4" /> Save Changes</Button>
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardHeader title="Security Controls" subtitle="Who can access the portal?" />
               <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-4">
                        <Shield className="w-6 h-6 text-primary" />
                        <div>
                           <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                           <p className="text-xs text-slate-500">Enable OTP login for all Clerks</p>
                        </div>
                     </div>
                     <div className="w-12 h-6 bg-primary rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                     </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-4">
                        <User className="w-6 h-6 text-blue-600" />
                        <div>
                           <p className="font-bold text-slate-900">Self-Registration</p>
                           <p className="text-xs text-slate-500">Allow citizens to register themselves</p>
                        </div>
                     </div>
                     <div className="w-12 h-6 bg-slate-300 rounded-full relative">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="space-y-8">
            <Card className="bg-slate-900 text-white border-none">
               <CardHeader className="border-white/10">
                  <h3 className="text-xl font-bold">System Info</h3>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                     <span className="text-slate-400">Version</span>
                     <span className="font-bold">2.4.0 (Latest)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-slate-400">Last Backup</span>
                     <span className="font-bold">Today, 02:00 AM</span>
                  </div>
                  <div className="pt-6">
                     <Button variant="ghost" className="w-full border-white/10 text-white hover:bg-white/10">Check for Updates</Button>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
