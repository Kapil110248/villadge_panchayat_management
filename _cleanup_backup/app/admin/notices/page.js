"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Bell, Calendar, Trash, Edit2, Globe } from "lucide-react";

const currentNotices = [
  { id: 1, title: "Gram Sabha Meeting", date: "15 Jan 2026", status: "Published", reach: "1,200 people" },
  { id: 2, title: "Vaccination Drive", date: "12 Jan 2026", status: "Draft", reach: "-" },
];

export default function NoticeManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notice Management</h1>
          <p className="text-slate-500">Create and broadcast village-wide announcements</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> Nayi Notice Banayein</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {currentNotices.map((notice) => (
          <Card key={notice.id}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-3 rounded-xl">
                  <Bell className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{notice.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {notice.date}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${
                      notice.status === 'Published' ? 'text-emerald-600' : 'text-slate-400'
                    }`}>{notice.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                 <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Reach</p>
                    <div className="flex items-center gap-1.5 justify-end">
                       <Globe className="w-3 h-3 text-primary" />
                       <span className="text-sm font-bold text-slate-900">{notice.reach}</span>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-50 text-slate-400 hover:text-primary transition-all rounded-lg border border-transparent hover:border-slate-100">
                       <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all rounded-lg border border-transparent hover:border-rose-100">
                       <Trash className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/5 border-primary/20">
         <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-primary">Need to send an SMS Alert?</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
               Important notices can be sent directly to villagers' mobile phones via SMS integration.
            </p>
            <Button variant="outline" className="border-primary/20 text-primary">Setup SMS Gateway</Button>
         </CardContent>
      </Card>
    </div>
  );
}
