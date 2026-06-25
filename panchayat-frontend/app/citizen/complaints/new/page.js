"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Image as ImageIcon, Send, HelpCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NewComplaint() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complaintId, setComplaintId] = useState("");
  const [photo, setPhoto] = useState(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    category: "other",
    ward: "",
    summary: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      let photo_url = null;
      
      if (photo) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", photo);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
        const uploadRes = await fetch(`${apiUrl}/upload`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formDataUpload
        });
        if (!uploadRes.ok) throw new Error("File upload failed");
        const uploadData = await uploadRes.json();
        photo_url = uploadData.secure_url;
      }

      const payload = { ...formData, photo_url };
      const res = await api.post("/citizen/complaints", payload, token);
      setComplaintId(res.complaint_number);
      setSubmitted(true);
    } catch (error) {
      alert("Error submitting complaint: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="bg-rose-100 p-6 rounded-full text-rose-600">
          <MessageSquare className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Shikayat Jama ho Gayi!</h2>
        <p className="text-slate-500 max-w-md">
          Aapki samasya note kar li gayi hai. ID: <strong>{complaintId}</strong>. 
          Hum jald se jald iska samadhan karenge.
        </p>
        <div className="pt-4 flex gap-4">
          <Button variant="outline" onClick={() => router.push("/citizen/dashboard")}>Back to Dashboard</Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => router.push("/citizen/complaints/status")}>Track Complaint</Button>
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
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={[
                  { label: "Water (Paani)", value: "water" },
                  { label: "Road (Sadak)", value: "road" },
                  { label: "Electricity (Bijli)", value: "electricity" },
                  { label: "Sanitation (Safai)", value: "sanitation" },
                  { label: "Other (Anye)", value: "other" },
                ]}
              />
              <Input 
                label="Ward Number" 
                placeholder="Ex: Ward 05" 
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                required
              />
            </div>

            <Input 
              label="Short Summary (Vishay)" 
              placeholder="Ex: Gali ki light kharab hai" 
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              required
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Pura Vivran (Detailed Description)</label>
              <textarea
                className="w-full bg-white border border-border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[150px]"
                placeholder="Samasya ke baare me vistar se batayein..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              ></textarea>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900">Photo Upload (Optional)</h4>
              <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary/50 transition-all cursor-pointer bg-slate-50">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {!photo ? (
                  <>
                    <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">Samasya ki photo yahan kheinche ya upload karein</p>
                    <p className="text-xs text-slate-400 mt-1">Isse hume samasya samajhne me asani hogi</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-emerald-600">Photo selected: {photo.name}</p>
                    <p className="text-xs text-slate-400 mt-1">Tap to change</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/citizen/dashboard")}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-primary py-6" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : <>Submit Complaint <Send className="w-4 h-4 ml-2" /></>}
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
