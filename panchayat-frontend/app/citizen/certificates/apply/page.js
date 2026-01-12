"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileText, Upload, AlertCircle } from "lucide-react";

export default function ApplyCertificate() {
  const [type, setType] = useState("income");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, send to API
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="bg-emerald-100 p-6 rounded-full">
          <FileText className="w-16 h-16 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Application Submitted!</h2>
        <p className="text-slate-500 max-w-md">
          Aapka certificate application jama ho gaya hai. Aap progress "My Certificates" page par dekh sakte hain.
        </p>
        <div className="pt-4 flex gap-4">
          <Button variant="outline" onClick={() => setSubmitted(false)}>Apply for Another</Button>
          <Button>View Status</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Certificate ke liye Apply Karein</h1>
        <p className="text-slate-500">Apni jankari bharein aur documents upload karein</p>
      </div>

      <Card>
        <CardHeader title="Certificate Application Form" />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Certificate ka Prakaar (Type)"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { label: "Income Certificate (Aay Praman Patra)", value: "income" },
                  { label: "Birth Certificate (Janam Praman Patra)", value: "birth" },
                  { label: "Death Certificate (Mrityu Praman Patra)", value: "death" },
                  { label: "Residence Certificate (Nivas Praman Patra)", value: "residence" },
                ]}
              />
              <Input label="Aadhar Number" placeholder="0000 0000 0000" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Pura Naam (Full Name)" placeholder="Ex: Ramesh Kumar" />
              <Input label="Pita ka Naam (Father's Name)" placeholder="Ex: Suresh Kumar" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Mobile Number" type="tel" placeholder="+91" />
              <Input label="Date of Birth" type="date" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Pura Pata (Full Address)</label>
              <textarea
                className="w-full bg-white border border-border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px]"
                placeholder="Village, Post Office, District, Block..."
              ></textarea>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 border-b pb-2">Documents Upload</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary/50 transition-all">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">Aadhar Card Upload</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG or PDF up to 2MB</p>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary/50 transition-all">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">Ration Card / ID Upload</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG or PDF up to 2MB</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Panchayat ke niyam ke hisab se, galat jankari dene par aapka application reject ho jayega aur karyawahi ho sakti hai.
              </p>
            </div>

            <Button type="submit" className="w-full py-6 text-lg">Submit Application</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
