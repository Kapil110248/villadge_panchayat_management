"use client";

import { useState, useEffect, useRef } from "react";
import {
  Camera, User, Mail, Phone, Briefcase, Calendar, ShieldCheck,
  Edit3, X, Save, Lock, Eye, EyeOff, MapPin, FileText,
  CheckCircle2, KeyRound, Sparkles, Building2, Clock
} from "lucide-react";
import { api } from "@/lib/api";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : "http://localhost:8001";

export default function ClerkProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const fileRef = useRef();

  const [form, setForm] = useState({
    full_name: "", mobile: "", email: "", address: "", bio: "", date_of_birth: "",
    current_password: "", new_password: "", confirm_password: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await api.get("/clerk/profile", token);
      setProfile(res);
      setForm(f => ({
        ...f,
        full_name: res.full_name || "",
        mobile: res.mobile || "",
        email: res.email || "",
        address: res.address || "",
        bio: res.bio || "",
        date_of_birth: res.date_of_birth ? res.date_of_birth.split("T")[0] : "",
      }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem("accessToken");
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch(`${BACKEND}/api/clerk/profile/avatar`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      
      if (data.avatar_url) {
        localStorage.setItem("userAvatar", data.avatar_url);
        window.dispatchEvent(new Event("avatarUpdated"));
      }

      await fetchProfile();
      setSuccess("Profile photo update ho gaya! ✅");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) { setError(e.message); }
    finally { setUploadingAvatar(false); }
  };

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (!form.full_name.trim()) return setError("Full name required.");
    if (form.new_password && form.new_password !== form.confirm_password)
      return setError("Passwords match nahi karte.");
    if (form.new_password && form.new_password.length < 6)
      return setError("New password min 6 characters hona chahiye.");
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      const payload = {
        full_name: form.full_name, mobile: form.mobile, email: form.email,
        address: form.address, bio: form.bio,
        date_of_birth: form.date_of_birth || undefined,
      };
      if (form.new_password) {
        payload.current_password = form.current_password;
        payload.new_password = form.new_password;
      }
      await api.put("/clerk/profile", payload, token);
      localStorage.setItem("userName", form.full_name);
      await fetchProfile();
      setIsEditing(false);
      setSuccess("Profile successfully update ho gaya! ✅");
      setTimeout(() => setSuccess(""), 4000);
    } catch (e) { setError(e.message || "Update failed."); }
    finally { setSaving(false); }
  };

  const startEdit = () => {
    setIsEditing(true); setError(""); setSuccess("");
    setForm(f => ({ ...f, current_password: "", new_password: "", confirm_password: "" }));
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : null;
  const fmtDesig = (d) => (d || "Panchayat Clerk").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const avatarSrc = profile?.avatar_url 
    ? (profile.avatar_url.startsWith('http') ? profile.avatar_url : `${BACKEND}${profile.avatar_url}`) 
    : null;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 font-bold">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">

      {/* ── HERO BANNER ── */}
      <div className="relative rounded-3xl overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900" />
        <div className="absolute inset-0 opacity-30" style={{backgroundImage:"radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #059669 0%, transparent 40%)"}} />

        <div className="relative p-6 md:p-8">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-white/20 shadow-2xl overflow-hidden bg-white/10 flex items-center justify-center cursor-pointer group"
                  onClick={() => fileRef.current?.click()}
                >
                  {avatarSrc
                    ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                    : <User className="w-10 h-10 text-white/60" />
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploadingAvatar
                      ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Camera className="w-6 h-6 text-white" />}
                  </div>
                </div>
                <button onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 hover:scale-110 transition-transform">
                  <Camera className="w-3 h-3 text-white" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Name & Role */}
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white">{profile?.full_name}</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">{fmtDesig(profile?.designation)}</span>
                  <Lock className="w-2.5 h-2.5 text-white/30" title="Admin sets this" />
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="flex items-center gap-1 text-white/60 text-xs font-medium">
                    <ShieldCheck className="w-3 h-3" />{profile?.employee_id}
                  </span>
                  <span className="flex items-center gap-1 text-white/60 text-xs font-medium">
                    <Clock className="w-3 h-3" />Joined {fmtDate(profile?.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit/Save buttons */}
            <div className="shrink-0 flex gap-2">
              {!isEditing ? (
                <button onClick={startEdit}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-bold text-sm rounded-2xl border border-white/20 transition-all hover:scale-105">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <>
                  <button onClick={() => { setIsEditing(false); setError(""); fetchProfile(); }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition-all">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-60">
                    <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
            {[
              { icon: Building2, label: "Village", val: "Sarahi" },
              { icon: Briefcase, label: "Department", val: "Gram Panchayat" },
              { icon: Calendar, label: "D.O.B", val: fmtDate(profile?.date_of_birth) || "Not set" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <s.icon className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wide">{s.label}</p>
                  <p className="text-white font-bold text-xs truncate">{s.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 font-bold text-sm">
          <X className="w-4 h-4 shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-bold text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />{success}
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Contact & Personal */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-sm">Personal Information</h2>
                <p className="text-xs text-slate-500">Aapki contact aur personal details</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <FormField label="Full Name" icon={User} edit={isEditing}
                value={profile?.full_name}
                input={<EditInput val={form.full_name} onChange={v => setForm(f => ({ ...f, full_name: v }))} placeholder="Pura naam" />}
              />
              {/* Email */}
              <FormField label="Email Address" icon={Mail} edit={isEditing}
                value={profile?.email}
                input={<EditInput type="email" val={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="Email address" />}
              />
              {/* Mobile */}
              <FormField label="Mobile Number" icon={Phone} edit={isEditing}
                value={profile?.mobile || "—"}
                input={<EditInput type="tel" val={form.mobile} onChange={v => setForm(f => ({ ...f, mobile: v }))} placeholder="Mobile number" />}
              />
              {/* DOB */}
              <FormField label="Date of Birth" icon={Calendar} edit={isEditing}
                value={fmtDate(profile?.date_of_birth) || "Not set"}
                input={<EditInput type="date" val={form.date_of_birth} onChange={v => setForm(f => ({ ...f, date_of_birth: v }))} />}
              />
              {/* Address */}
              <div className="sm:col-span-2">
                <FormField label="Address" icon={MapPin} edit={isEditing}
                  value={profile?.address || "Koi address nahi diya"}
                  input={<EditInput val={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="Aapka pata likhein" />}
                />
              </div>
            </div>
          </div>

          {/* Bio Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-sm">Official Bio</h2>
                <p className="text-xs text-slate-500">Apne baare mein kuch likhein</p>
              </div>
            </div>
            <div className="p-6">
              {isEditing ? (
                <textarea rows={4} value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Apna parichay, kaam ka vivran likhein..."
                  className="w-full border border-slate-200 rounded-2xl p-4 text-sm text-slate-700 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 resize-none transition-all"
                />
              ) : (
                <p className="text-slate-600 text-sm leading-relaxed">
                  {profile?.bio || (
                    <span className="text-slate-400 italic">Koi bio nahi likhi hai. Edit karein aur apna parichay add karein.</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Password Change - only in edit */}
          {isEditing && (
            <div className="bg-white rounded-3xl border border-primary/20 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-primary/5">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-sm">Password Change</h2>
                  <p className="text-xs text-slate-500">Optional — khali chhod sakte hain</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <PwdField label="Current Password" val={form.current_password} show={showCurrentPwd}
                  toggle={() => setShowCurrentPwd(p => !p)}
                  onChange={v => setForm(f => ({ ...f, current_password: v }))} placeholder="Purana password" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PwdField label="New Password" val={form.new_password} show={showNewPwd}
                    toggle={() => setShowNewPwd(p => !p)}
                    onChange={v => setForm(f => ({ ...f, new_password: v }))} placeholder="Min. 6 characters" />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Confirm Password</label>
                    <input type="password" value={form.confirm_password}
                      onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))}
                      placeholder="Dobara likhein"
                      className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all ${form.confirm_password && form.new_password !== form.confirm_password ? "border-rose-400 bg-rose-50" : "border-slate-200 focus:border-primary/50"}`}
                    />
                    {form.confirm_password && form.new_password !== form.confirm_password && (
                      <p className="text-xs text-rose-500 font-bold pl-1">Match nahi karte</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">

          {/* Employee Info */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-black text-slate-900 text-sm">Employee Details</h3>
            </div>
            <div className="p-5 space-y-4">
              {[
                { icon: ShieldCheck, label: "Employee ID", val: profile?.employee_id, color: "bg-blue-50 text-blue-600" },
                { icon: Calendar,    label: "Date of Joining", val: fmtDate(profile?.created_at), color: "bg-emerald-50 text-emerald-600" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="font-bold text-slate-900 text-sm font-mono">{item.val || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Position - Admin locked */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Position</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] bg-amber-200 text-amber-800 px-2 py-1 rounded-full font-black">
                <Lock className="w-2.5 h-2.5" /> Admin
              </span>
            </div>
            <p className="font-black text-slate-800 text-base">{fmtDesig(profile?.designation)}</p>
            <p className="text-xs text-amber-700/80 leading-relaxed">
              Yeh position sirf admin change kar sakta hai. Agar galat hai toh admin se contact karein.
            </p>
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-br from-primary/5 to-emerald-50 rounded-3xl border border-primary/20 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Quick Tips</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                Photo upload karne ke liye avatar par click karein
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                Password optional hai — sirf tab bharen jab badalna ho
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                Apni bio add karein taaki parichay dikhe
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper Components ────────────────────────────────

function FormField({ icon: Icon, label, value, edit, input }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <Icon className="w-3 h-3" /> {label}
      </label>
      {edit ? input : (
        <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-800 min-h-[44px] flex items-center">
          {value}
        </div>
      )}
    </div>
  );
}

function EditInput({ val, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={val}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 bg-white transition-all"
    />
  );
}

function PwdField({ label, val, onChange, placeholder, show, toggle }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} value={val}
          onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
        />
        <button type="button" onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
