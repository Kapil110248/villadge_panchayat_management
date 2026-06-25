"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileText, Upload, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { api } from "@/lib/api";

const CERTIFICATE_TYPES = [
  { label: "Income Certificate (Aay Praman Patra)", value: "income" },
  { label: "Birth Certificate (Janam Praman Patra)", value: "birth" },
  { label: "Death Certificate (Mrityu Praman Patra)", value: "death" },
  { label: "Residence Certificate (Nivas Praman Patra)", value: "residence" },
  { label: "Other (Anya Praman Patra)", value: "other" },
];

const DYNAMIC_FIELDS = {
  income: [
    { name: "annual_income", label: "Annual Income (₹)", type: "number", placeholder: "e.g., 50000" },
    { name: "income_source", label: "Source of Income", type: "text", placeholder: "Agriculture, Labor, Business..." },
  ],
  birth: [
    { name: "child_name", label: "Child's Full Name", type: "text", placeholder: "Enter child's name" },
    { name: "mother_name", label: "Mother's Name", type: "text", placeholder: "Enter mother's name" },
    { name: "place_of_birth", label: "Place of Birth", type: "text", placeholder: "Hospital name or Home address" },
  ],
  death: [
    { name: "deceased_name", label: "Deceased Person's Name", type: "text", placeholder: "Enter deceased's name" },
    { name: "date_of_death", label: "Date of Death", type: "date" },
    { name: "cause_of_death", label: "Cause of Death", type: "text", placeholder: "Natural, Illness, etc." },
  ],
  residence: [
    { name: "duration_years", label: "Duration of Stay (Years)", type: "number", placeholder: "e.g., 10" },
  ],
  other: []
};

const REQUIRED_DOCUMENTS = {
  income: ["Aadhaar Card", "Old Income Cert / Self Declaration"],
  birth: ["Hospital Discharge Slip", "Parents Aadhaar Card"],
  death: ["Doctor Certificate / Cremation Receipt", "Deceased Aadhaar Card"],
  residence: ["Voter ID / Ration Card", "Electricity Bill"],
  other: ["ID Proof", "Supporting Document"]
};

export default function ApplyCertificate() {
  const [type, setType] = useState("income");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    aadhar_number: "",
    full_name: "",
    father_name: "",
    mobile: "",
    dob: "",
    address: "",
    purpose: "",
    other_certificate_name: ""
  });
  
  // Dynamic Fields State
  const [dynamicData, setDynamicData] = useState({});
  
  // Documents State
  const [documents, setDocuments] = useState({});
  const [otherDocs, setOtherDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(null);

  const addOtherDoc = () => {
    setOtherDocs([...otherDocs, { id: Date.now(), title: `Extra Document ${otherDocs.length + 1}` }]);
  };

  const removeOtherDoc = (id) => {
    setOtherDocs(otherDocs.filter(d => d.id !== id));
    // Also remove from documents state if uploaded
    setDocuments(prev => {
      const d = { ...prev };
      delete d[`other_${id}`];
      return d;
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDynamicChange = (e) => {
    setDynamicData({ ...dynamicData, [e.target.name]: e.target.value });
  };

  const uploadToBackend = async (file, docName) => {
    setUploadingDoc(docName);
    
    const fd = new FormData();
    fd.append('file', file);
    
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
      
      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fd,
      });
      
      if (!res.ok) {
         const errorData = await res.json();
         setErrorMsg(`Upload Failed: ${errorData.error || "Please try again"}.`);
         return;
      }
      
      const data = await res.json();
      setDocuments(prev => ({ ...prev, [docName]: data.secure_url }));
    } catch (err) {
      console.error(err);
      setErrorMsg(`Upload failed for ${docName}. Network issue or Server error.`);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleFileChange = (e, docName) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size is too large. Please upload a file smaller than 5MB.");
      return;
    }
    uploadToBackend(file, docName);
  };

  const handleOtherDocTitleChange = (id, newTitle) => {
    setOtherDocs(otherDocs.map(doc => doc.id === id ? { ...doc, title: newTitle } : doc));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem("accessToken");
      
      // Combine base data, dynamic fields, and uploaded document URLs into a single JSON object for the backend
      const combinedData = {
        ...formData,
        ...dynamicData,
        documents: documents
      };
      
      const payload = {
        certificate_type: type === "other" ? formData.other_certificate_name || "Other" : type,
        data: combinedData,
        purpose: formData.purpose || "General Verification"
      };

      await api.post("/certificates/apply", payload, token);
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit application", err);
      setErrorMsg("Application submission failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="bg-emerald-100 p-6 rounded-full animate-bounce">
          <CheckCircle2 className="w-16 h-16 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Application Submitted!</h2>
        <p className="text-slate-500 max-w-md">
          Aapka certificate application jama ho gaya hai. Aap progress "My Certificates" page par dekh sakte hain.
        </p>
        <div className="pt-4 flex gap-4">
          <Button variant="outline" onClick={() => { setSubmitted(false); setDynamicData({}); setDocuments({}); }}>Apply for Another</Button>
          <Button onClick={() => window.location.href = "/citizen/certificates/status"}>View Status</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 relative">
      
      {/* Modern Error Toast/Banner */}
      {errorMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="bg-rose-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-rose-500/30 flex items-center gap-4 max-w-md w-[90vw]">
            <div className="bg-white/20 p-2 rounded-full">
               <AlertCircle className="w-6 h-6" />
            </div>
            <p className="font-medium text-sm flex-1">{errorMsg}</p>
            <button onClick={() => setErrorMsg(null)} className="text-white/70 hover:text-white transition-colors bg-black/10 hover:bg-black/20 p-2 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Certificate ke liye Apply Karein</h1>
        <p className="text-slate-500 mt-2 text-lg">Apni jankari bharein aur required documents secure Cloudinary server par upload karein.</p>
      </div>

      <Card className="rounded-[2rem] border-white shadow-xl shadow-slate-200/50 overflow-hidden">
        <CardHeader title="Certificate Application Form" subtitle="Fill out the details carefully" className="bg-slate-50/50 border-b border-slate-100" />
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Certificate Type */}
            <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span> Certificate Type</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Certificate ka Prakaar (Type)"
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setDynamicData({});
                    setDocuments({});
                  }}
                  options={CERTIFICATE_TYPES}
                />
                {type === "other" && (
                  <div className="animate-in fade-in zoom-in duration-300">
                    <Input 
                      label="Kounsa Certificate chahiye? (Certificate Name)" 
                      name="other_certificate_name" 
                      required 
                      onChange={handleInputChange} 
                      placeholder="Ex: Character Certificate, Caste Certificate" 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Personal Details (Fixed for all) */}
            <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span> Personal Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Aadhar Number" name="aadhar_number" required onChange={handleInputChange} placeholder="0000 0000 0000" />
                <Input label="Pura Naam (Full Name)" name="full_name" required onChange={handleInputChange} placeholder="Ex: Ramesh Kumar" />
                <Input label="Pita/Pati ka Naam (Father/Husband's Name)" name="father_name" required onChange={handleInputChange} placeholder="Ex: Suresh Kumar" />
                <Input label="Mobile Number" name="mobile" type="tel" required onChange={handleInputChange} placeholder="+91" />
                <Input label="Date of Birth" name="dob" type="date" required onChange={handleInputChange} />
                <Input label="Purpose of Certificate" name="purpose" required onChange={handleInputChange} placeholder="Ex: Admission, Scholarship, Loan" />
              </div>

              <div className="space-y-2 mt-4">
                <label className="text-sm font-black text-slate-900">Pura Pata (Full Address)</label>
                <textarea
                  name="address"
                  required
                  onChange={handleInputChange}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px] transition-all text-slate-900 font-medium placeholder:text-slate-400"
                  placeholder="Village, Post Office, District, Block..."
                ></textarea>
              </div>
            </div>

            {/* Step 3: Dynamic Details based on Type */}
            <div className="space-y-4 bg-primary/5 p-6 rounded-2xl border border-primary/10">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">3</span> 
                {type.charAt(0).toUpperCase() + type.slice(1)} Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {DYNAMIC_FIELDS[type].map((field) => (
                  <Input 
                    key={field.name} 
                    label={field.label} 
                    name={field.name} 
                    type={field.type} 
                    placeholder={field.placeholder} 
                    required 
                    onChange={handleDynamicChange} 
                  />
                ))}
              </div>
            </div>

            {/* Step 4: Document Uploads (Cloudinary) */}
            <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">4</span> Required Documents</h4>
              <p className="text-sm text-slate-500 mb-4">Please upload clear pictures or PDFs (Max 5MB). Files are securely stored in the cloud.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {REQUIRED_DOCUMENTS[type].map((docName) => (
                  <div key={docName} className={`relative border-2 border-dashed ${documents[docName] ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-primary/50'} rounded-2xl p-6 text-center transition-all group overflow-hidden`}>
                    
                    {documents[docName] ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-emerald-700">Uploaded Successfully</p>
                        <p className="text-xs text-emerald-600/70 mt-1">{docName}</p>
                        <button 
                          type="button" 
                          onClick={() => setDocuments(prev => { const d = {...prev}; delete d[docName]; return d; })}
                          className="mt-4 text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center justify-center w-full"
                        >
                          <X className="w-3 h-3 mr-1" /> Remove & Re-upload
                        </button>
                      </div>
                    ) : (
                      <>
                        <input 
                          type="file" 
                          accept="image/*,.pdf" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => handleFileChange(e, docName)}
                          disabled={uploadingDoc === docName}
                        />
                        {uploadingDoc === docName ? (
                           <div className="flex flex-col items-center justify-center py-2">
                             <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                             <p className="text-sm font-bold text-primary">Uploading to Cloud...</p>
                           </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 shadow-sm mb-3 transition-colors">
                              <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-slate-700">{docName}</p>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-2">Click or drag file here</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Other Documents Section */}
              <div className="mt-8 border-t border-slate-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-bold text-slate-900">Additional Documents (Optional)</h5>
                  <Button type="button" variant="outline" onClick={addOtherDoc} className="text-xs h-9">
                    + Add Document
                  </Button>
                </div>
                
                {otherDocs.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {otherDocs.map((doc) => {
                      const docKey = `other_${doc.id}`;
                      return (
                        <div key={doc.id} className={`relative border-2 border-dashed ${documents[docKey] ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-white hover:border-primary/50'} rounded-2xl p-6 text-center transition-all group overflow-hidden`}>
                          
                          {/* Title Input for Other Doc */}
                          <div className="mb-4 relative z-20">
                            <input 
                              type="text" 
                              value={doc.title}
                              onChange={(e) => handleOtherDocTitleChange(doc.id, e.target.value)}
                              className="w-full text-center text-sm font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-primary outline-none px-2 py-1"
                              placeholder="Document Name"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {documents[docKey] ? (
                            <div className="flex flex-col items-center relative z-20">
                              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                                <CheckCircle2 className="w-6 h-6" />
                              </div>
                              <p className="text-sm font-bold text-emerald-700">Uploaded</p>
                              <div className="flex gap-2 mt-4 w-full">
                                <button 
                                  type="button" 
                                  onClick={() => setDocuments(prev => { const d = {...prev}; delete d[docKey]; return d; })}
                                  className="text-xs font-bold text-slate-500 hover:text-slate-700 w-full py-2 bg-slate-100 rounded-lg"
                                >
                                  Re-upload
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => removeOtherDoc(doc.id)}
                                  className="text-xs font-bold text-rose-500 hover:text-white hover:bg-rose-500 w-full py-2 bg-rose-50 rounded-lg transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <input 
                                type="file" 
                                accept="image/*,.pdf" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={(e) => handleFileChange(e, docKey)}
                                disabled={uploadingDoc === docKey}
                              />
                              {uploadingDoc === docKey ? (
                                <div className="flex flex-col items-center justify-center py-2 relative z-0">
                                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                                  <p className="text-sm font-bold text-primary">Uploading...</p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center relative z-0">
                                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:bg-primary/10 shadow-sm mb-3 transition-colors border border-slate-200">
                                    <Upload className="w-6 h-6" />
                                  </div>
                                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Click to upload file</p>
                                  <button 
                                    type="button" 
                                    onClick={(e) => { e.stopPropagation(); removeOtherDoc(doc.id); }}
                                    className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 z-30"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 mt-8">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-amber-800">Declaration</h5>
                <p className="text-sm text-amber-700 mt-1">
                  Main ghoshna karta/karti hu ki upar di gayi sabhi jankari mere gyan aur vishwas ke anusar satya hai. Kisi bhi galat jankari ke liye main swayam zimmedar hounga/houngi.
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading || Object.keys(documents).length < REQUIRED_DOCUMENTS[type].length} 
              className="w-full h-14 text-lg font-black rounded-2xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 shadow-xl shadow-indigo-500/20"
            >
              {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting securely...</> : "Submit Final Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
