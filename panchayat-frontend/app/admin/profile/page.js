"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User, Mail, Phone, MapPin, Award, Calendar, ShieldAlert, Edit, Star, X, CheckCircle, Camera, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminProfile() {
  const [adminData, setAdminData] = useState({
    name: "Ramesh Kumar",
    role: "Panchayat Administrator (Sarpanch)",
    village: "Sarahi",
    tenure: "2023 - 2028",
    email: "ramesh.sarpanch@gram.in",
    phone: "+91 88XXX XXXXX",
    jurisdiction: "Sarahi Block A & B",
    rating: "4.8/5.0",
    avatar_url: "",
    signature_url: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [editForm, setEditForm] = useState({ ...adminData });
  const [pwdForm, setPwdForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [updatingPwd, setUpdatingPwd] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const data = await api.get("/admin/profile", token);
      if (data) {
        setAdminData(data);
        setEditForm(data);
      }
    } catch (e) {
      console.error("Fetch Profile Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("File size must be less than 3MB.");
      return;
    }

    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem("accessToken");
      const fd = new FormData();
      fd.append('file', file);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const uploadData = await res.json();
      
      // Update avatar in admin config profile
      const updateRes = await api.put("/admin/profile", { ...adminData, avatar_url: uploadData.secure_url }, token);
      if (updateRes && updateRes.config) {
        setAdminData(updateRes.config);
        setEditForm(updateRes.config);
        
        // Dispatch event so that navbars / header avatars update if they listen to it
        window.dispatchEvent(new Event("avatarUpdated"));
        localStorage.setItem("userAvatar", uploadData.secure_url);
        
        setToastMessage("Profile picture update ho gayi!");
        setTimeout(() => setToastMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
      alert("Avatar upload failed. Try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB.");
      return;
    }

    try {
      setUploadingSignature(true);
      const token = localStorage.getItem("accessToken");
      const fd = new FormData();
      fd.append('file', file);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const uploadData = await res.json();
      
      // Update signature in admin config profile
      const updateRes = await api.put("/admin/profile", { ...adminData, signature_url: uploadData.secure_url }, token);
      if (updateRes && updateRes.config) {
        setAdminData(updateRes.config);
        setEditForm(updateRes.config);
        setToastMessage("Official signature update ho gaya!");
        setTimeout(() => setToastMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
      alert("Signature upload failed. Try again.");
    } finally {
      setUploadingSignature(false);
    }
  };

  // Drawing Canvas Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a"; // dark slate signature color
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      setUploadingSignature(true);
      
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("Canvas signature conversion failed");
      
      const file = new File([blob], "signature.png", { type: "image/png" });
      const token = localStorage.getItem("accessToken");
      const fd = new FormData();
      fd.append('file', file);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const uploadData = await res.json();
      
      const updateRes = await api.put("/admin/profile", { ...adminData, signature_url: uploadData.secure_url }, token);
      if (updateRes && updateRes.config) {
        setAdminData(updateRes.config);
        setEditForm(updateRes.config);
        setToastMessage("Official signature update ho gaya!");
        setTimeout(() => setToastMessage(""), 3000);
        setShowSignModal(false);
      }
    } catch (err) {
      console.error(err);
      alert("Signature save nahi ho paya. Kripya firse koshish karein.");
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.put("/admin/profile", editForm, token);
      if (res && res.config) {
        setAdminData(res.config);
        setToastMessage("Profile updated successfully!");
        setTimeout(() => setToastMessage(""), 3000);
        setShowEditModal(false);
      }
    } catch (e) {
      alert("Error updating profile: " + e.message);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwdError("");
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      setPwdError("New password and confirm password do not match");
      return;
    }
    
    try {
      setUpdatingPwd(true);
      const token = localStorage.getItem("accessToken");
      await api.put("/admin/profile/password", {
        current_password: pwdForm.current_password,
        new_password: pwdForm.new_password
      }, token);
      
      setToastMessage("Password updated successfully!");
      setTimeout(() => setToastMessage(""), 3000);
      setShowPwdModal(false);
      setPwdForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (e) {
      setPwdError(e.message || "An error occurred while updating password.");
    } finally {
      setUpdatingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-500 font-semibold">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Prashasan <span className="text-primary">Profile</span></h1>
          <p className="text-slate-500 font-medium mt-1">Official profile of the Village Administrator.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-2 md:mt-0">
          <Button onClick={() => { setShowPwdModal(true); setPwdError(""); setPwdForm({ current_password: "", new_password: "", confirm_password: "" }); }} variant="outline" className="w-full sm:w-auto gap-2 shadow-sm"><ShieldAlert className="w-4 h-4" /> Change Password</Button>
          <Button onClick={() => setShowEditModal(true)} className="w-full sm:w-auto gap-2 bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20"><Edit className="w-4 h-4" /> Edit Profile</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-primary/20 bg-primary/5">
          <CardContent className="p-10 flex flex-col items-center text-center">
            <div className="relative mb-6 group">
               <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center border-4 border-primary/20 shadow-2xl overflow-hidden transition-all duration-300 group-hover:scale-105">
                  {uploadingAvatar ? (
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  ) : adminData.avatar_url ? (
                    <img src={adminData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-primary" />
                  )}
               </div>
               <label className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-2xl shadow-lg hover:bg-primary-dark transition-all duration-300 cursor-pointer hover:scale-110 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                  <input type="file" onChange={handleAvatarUpload} className="hidden" accept="image/*" disabled={uploadingAvatar} />
               </label>
            </div>
            <h3 className="text-2xl font-black text-slate-900">{adminData.name}</h3>
            <p className="text-primary font-black text-xs uppercase tracking-widest mt-1">{adminData.role}</p>
            
            <div className="w-full h-px bg-primary/10 my-8" />
            
            <div className="grid grid-cols-2 gap-4 w-full">
               <div className="bg-white p-4 rounded-2xl border border-primary/10 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Tenure</p>
                  <p className="text-xs font-black text-slate-900">{adminData.tenure}</p>
               </div>
               <div className="bg-white p-4 rounded-2xl border border-primary/10 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Rating</p>
                  <p className="text-xs font-black text-emerald-600">{adminData.rating}</p>
               </div>
            </div>

            <div className="w-full h-px bg-primary/10 my-8" />
            
            <div className="w-full bg-white p-5 rounded-[2rem] border border-primary/10 shadow-sm flex flex-col items-center">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Official Signature</p>
               <div className="w-full h-24 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden mb-3">
                  {uploadingSignature ? (
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  ) : adminData.signature_url ? (
                    <img src={adminData.signature_url} alt="Signature" className="h-full object-contain p-2" />
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">No Signature Saved</span>
                  )}
               </div>
               
               <div className="flex gap-2 w-full">
                  <button onClick={() => setShowSignModal(true)} type="button" className="flex-grow py-2 text-[10px] font-black uppercase bg-primary text-white hover:bg-primary-dark rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/10">
                     <Edit className="w-3.5 h-3.5" /> Draw Sign
                  </button>
                  <label className="flex-grow py-2 text-[10px] font-black uppercase bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center">
                     <Camera className="w-3.5 h-3.5" /> Upload File
                     <input type="file" onChange={handleSignatureUpload} className="hidden" accept="image/*" disabled={uploadingSignature} />
                  </label>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Administration Scope" subtitle="Official area of jurisdiction and direct responsibilities" />
          <CardContent className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mobile Contact</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <Phone className="w-4 h-4 text-slate-400" />
                     <span className="font-bold text-slate-900">{adminData.phone}</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Official Email</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <Mail className="w-4 h-4 text-slate-400" />
                     <span className="font-bold text-slate-900">{adminData.email}</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Village</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <MapPin className="w-4 h-4 text-slate-400" />
                     <span className="font-bold text-slate-900">{adminData.village}</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Jurisdiction</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <ShieldAlert className="w-4 h-4 text-slate-400" />
                     <span className="font-bold text-slate-900">{adminData.jurisdiction}</span>
                  </div>
               </div>
            </div>
            
            <div className="p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                     <Award className="w-6 h-6 text-primary-light" />
                     <h4 className="text-lg font-black tracking-tight">Administrative Honors</h4>
                  </div>
                  <ul className="space-y-2">
                     <li className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary-light rounded-full" />
                        Best Managed Village Award (MP Rural Dev, 2024)
                     </li>
                     <li className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary-light rounded-full" />
                        100% Digitization Target Achieved (Quarter 4, 2025)
                     </li>
                  </ul>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 sm:p-8 shrink-0 pr-12 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0"><User className="w-6 h-6 text-primary" /></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Edit Prashasan Profile</h3>
                    <p className="text-sm font-medium text-slate-500">Update village administrator settings.</p>
                  </div>
                </div>
            </div>
            <CardContent className="p-6 sm:p-8 pt-0 overflow-y-auto">
              <form onSubmit={handleUpdate} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sarpanch Name</label>
                    <input type="text" required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Title</label>
                    <input type="text" required value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Contact</label>
                    <input type="text" required value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Email</label>
                    <input type="email" required value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Village/Panchayat Name</label>
                    <input type="text" required value={editForm.village} onChange={e => setEditForm({...editForm, village: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenure</label>
                    <input type="text" required value={editForm.tenure} onChange={e => setEditForm({...editForm, tenure: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jurisdiction</label>
                    <input type="text" required value={editForm.jurisdiction} onChange={e => setEditForm({...editForm, jurisdiction: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none" />
                  </div>
                </div>
                
                <div className="pt-4 flex gap-4">
                  <Button type="button" onClick={() => setShowEditModal(false)} variant="outline" className="w-1/2 py-6 rounded-xl">Cancel</Button>
                  <Button type="submit" className="w-1/2 py-6 rounded-xl text-md font-bold bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/20">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Draw Signature Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <button onClick={() => setShowSignModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 shrink-0 text-left pr-12 pb-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0"><Edit className="w-6 h-6 text-primary" /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Draw Official Signature</h3>
                  <p className="text-sm font-medium text-slate-500">Sign directly inside the box below.</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6 text-center overflow-y-auto">
              
              <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden mb-6 shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  className="w-full bg-white touch-none cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              
              <div className="flex gap-4">
                <Button type="button" onClick={clearCanvas} variant="outline" className="w-1/2 py-5 rounded-xl font-bold">Clear Pad</Button>
                <Button type="button" onClick={saveDrawing} className="w-1/2 py-5 rounded-xl font-bold bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/20" disabled={uploadingSignature}>
                  {uploadingSignature ? "Saving..." : "Save Signature"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Password Update Modal */}
      {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md relative shadow-2xl border-0 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowPwdModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
            <CardContent className="p-8">
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center"><ShieldAlert className="w-6 h-6 text-rose-500" /></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Change Password</h3>
                    <p className="text-sm font-medium text-slate-500">Update your account security.</p>
                  </div>
                </div>

                {pwdError && (
                  <div className="bg-rose-50 text-rose-600 text-sm font-semibold p-4 rounded-xl border border-rose-100 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    {pwdError}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
                    <input type="password" required value={pwdForm.current_password} onChange={e => setPwdForm({...pwdForm, current_password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                    <input type="password" required value={pwdForm.new_password} onChange={e => setPwdForm({...pwdForm, new_password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                    <input type="password" required value={pwdForm.confirm_password} onChange={e => setPwdForm({...pwdForm, confirm_password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none" />
                  </div>
                </div>
                
                <div className="pt-4 flex gap-4">
                  <Button type="button" onClick={() => setShowPwdModal(false)} variant="outline" className="w-1/2 py-6 rounded-xl">Cancel</Button>
                  <Button type="submit" disabled={updatingPwd} className="w-1/2 py-6 rounded-xl text-md font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-xl shadow-rose-500/20">
                    {updatingPwd ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modern Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
