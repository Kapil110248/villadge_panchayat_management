"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Image, Send, HelpCircle } from "lucide-react";

export default function NewComplaint() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="bg-rose-100 p-6 rounded-full text-rose-600">
          <MessageSquare className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Shikayat Jama ho Gayi!</h2>
        <p className="text-slate-500 max-w-md">
          Aapki samasya note kar li gayi hai. ID: <strong>COMP-#{Math.floor(Math.random() * 9000) + 1000}</strong>. 
          Hum jald se jald iska samadhan karenge.
        </p>
        <div className="pt-4 flex gap-4">
          <Button variant="outline" onClick={() => setSubmitted(false)}>Back to Dashboard</Button>
          <Button className="bg-rose-600 hover:bg-rose-700">Track Complaint</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Shikayat (Complaint) Karein</h1>
        <p className="text-slate-500">Gaav ki kisi bhi samasya ko hum tak pahuchayein</p>
      </div>

      <Card>
        <CardHeader title="Complaint Details" />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Samasya ka Prakaar (Category)"
                options={[
                  { label: "Water (Paani)", value: "water" },
                  { label: "Road (Sadak)", value: "road" },
                  { label: "Electricity (Bijli)", value: "electricity" },
                  { label: "Sanitation (Safai)", value: "sanitation" },
                  { label: "Other (Anye)", value: "other" },
                ]}
              />
              <Input label="Ward Number" placeholder="Ex: Ward 05" />
            </div>

            <Input label="Short Summary (Vishay)" placeholder="Ex: Gali ki light kharab hai" />

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Pura Vivran (Detailed Description)</label>
              <textarea
                className="w-full bg-white border border-border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[150px]"
                placeholder="Samasya ke baare me vistar se batayein..."
              ></textarea>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900">Photo Upload (Optional)</h4>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary/50 transition-all cursor-pointer">
                <Image className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">Samasya ki photo yahan kheinche ya upload karein</p>
                <p className="text-xs text-slate-400 mt-1">Isse hume samasya samajhne me asani hogi</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-primary py-6">
                Submit Complaint <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-blue-900">Kya aapko pata hai?</h4>
          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
            Halki samasyaon ka samadhan 48 ghante ke andar kiya jata hai. Gambhir samasyaon me 7-10 din lag sakte hain.
          </p>
        </div>
      </div>
    </div>
  );
}
