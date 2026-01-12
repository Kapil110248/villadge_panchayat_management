"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Bell, Calendar, MapPin, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

const notices = [
  {
    id: 1,
    title: "Gram Sabha Meeting - January 2026",
    date: "15 Jan 2026",
    time: "10:30 AM",
    location: "Panchayat Bhawan Ground",
    description: "Annual planning for road construction and water pipeline maintenance. All villagers are requested to attend.",
    category: "Meeting",
    urgent: true
  },
  {
    id: 2,
    title: "Vaccination Drive: Polio & COVID",
    date: "12 Jan 2026",
    time: "09:00 AM - 05:00 PM",
    location: "Community Health Center",
    description: "Special drive for children under 5 and senior citizens. Please bring your Aadhar card and previous records.",
    category: "Health",
    urgent: false
  },
  {
    id: 3,
    title: "New Government Scheme: PM Awas Yojna",
    date: "Available Now",
    location: "Panchayat Office",
    description: "Criteria for 2026 applications have been released. Please check eligibility and submit forms by 30th Jan.",
    category: "Scheme",
    urgent: false
  },
];

export default function NoticeBoard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notice Board</h1>
          <p className="text-slate-500">Panchayat ke sabhi updates yahan dekhein</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Download All</Button>
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <Card key={notice.id} className={notice.urgent ? "border-l-4 border-l-rose-500 shadow-lg" : ""}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-none">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    notice.urgent ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600"
                  }`}>
                    <Bell className="w-7 h-7" />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          notice.category === "Meeting" ? "bg-blue-100 text-blue-700" :
                          notice.category === "Health" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {notice.category}
                        </span>
                        {notice.urgent && <span className="text-[10px] bg-rose-500 text-white font-bold uppercase px-2 py-0.5 rounded-full animate-pulse">Urgent</span>}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{notice.title}</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="hidden md:flex">Download Details</Button>
                  </div>
                  
                  <p className="text-slate-600 leading-relaxed max-w-2xl">{notice.description}</p>
                  
                  <div className="flex flex-wrap gap-6 pt-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>{notice.date} {notice.time && `• ${notice.time}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <span>{notice.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
