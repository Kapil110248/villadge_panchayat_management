"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  Shield,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    aadhaarNumber: "",
    address: "",
    village: "Sarahi",
    pincode: "",
    dateOfBirth: "",
    gender: "male",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    // Validate Passwords
    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Map frontend camelCase to backend snake_case
      const payload = {
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        aadhaar_number: formData.aadhaarNumber,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        village: formData.village,
        pincode: formData.pincode,
        password: formData.password
      };

      await api.post("/auth/register", payload);
      setSubmitted(true);
    } catch (error) {
      console.error("Registration failed:", error);
      alert(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center shadow-2xl border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Request Submitted!</h2>
          <p className="text-slate-600 font-medium mb-8 leading-relaxed">
            Aapki registration request successfully submit ho gayi hai. Admin aapki details verify karenge aur approve karenge. Aapko email/SMS se notification milegi.
          </p>
          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full rounded-2xl py-6">
                Back to Home
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full rounded-2xl py-6 border-slate-200">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-primary transition-colors mb-6">
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="font-bold text-sm">Back to Home</span>
        </Link>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-4xl font-black text-slate-900">Gram Sahayak</h1>
        </div>
        <p className="text-slate-600 font-medium text-lg">Citizen Registration Request</p>
      </div>

      {/* Registration Form */}
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-emerald-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8" />
            <h2 className="text-3xl font-black">Naya Sadasya Registration</h2>
          </div>
          <p className="text-emerald-100 font-medium">
            Gaon ke sadasya ke liye registration request bhejein. Admin verify karke approve karenge.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Full Name (Aadhaar ke anusaar) *
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Ramesh Kumar Sharma"
                  className="w-full bg-slate-50 border-2 border-transparent px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="w-full bg-slate-50 border-2 border-transparent px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  className="w-full bg-slate-50 border-2 border-transparent px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="male">Male (Purush)</option>
                  <option value="female">Female (Mahila)</option>
                  <option value="other">Other (Anya)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                  <CreditCard className="w-3 h-3" />
                  Aadhaar Number *
                </label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  placeholder="XXXX-XXXX-XXXX"
                  maxLength="12"
                  className="w-full bg-slate-50 border-2 border-transparent px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. ramesh@gmail.com"
                  className="w-full bg-slate-50 border-2 border-transparent px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  placeholder="e.g. 9876543210"
                  maxLength="10"
                  className="w-full bg-slate-50 border-2 border-transparent px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Account Security
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Kam se kam 6 characters"
                    minLength="6"
                    className="w-full bg-slate-50 border-2 border-transparent px-4 py-3.5 pr-12 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Password dobara likhein"
                    minLength="6"
                    className="w-full bg-slate-50 border-2 border-transparent px-4 py-3.5 pr-12 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {passwordError && (
              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4">
                <p className="text-sm font-bold text-rose-700 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {passwordError}
                </p>
              </div>
            )}
          </div>

          {/* Address Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Address Information
            </h3>

            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Complete Address *
                </label>
                <textarea
                  name="address"
                  placeholder="e.g. Ward No. 3, Near Hanuman Mandir, Sarahi"
                  rows="3"
                  className="w-full bg-slate-50 border-2 border-transparent px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none resize-none"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                    Village/Town *
                  </label>
                  <input
                    type="text"
                    name="village"
                    placeholder="e.g. Sarahi"
                    className="w-full bg-slate-50 border-2 border-transparent px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                    value={formData.village}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="e.g. 123456"
                    maxLength="6"
                    className="w-full bg-slate-50 border-2 border-transparent px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
            <h4 className="font-black text-amber-900 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Important Notice
            </h4>
            <ul className="text-sm text-amber-800 font-medium space-y-1 list-disc list-inside">
              <li>Sabhi details Aadhaar Card ke anusaar honi chahiye</li>
              <li>Admin aapki details verify karenge</li>
              <li>Approval ke baad hi aap login kar sakte hain</li>
              <li>Galat jaankari dene par request reject ho sakti hai</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full py-7 text-lg font-bold rounded-2xl shadow-xl shadow-primary/10 gap-2"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Submit Registration Request <ArrowRight className="w-5 h-5" /></>
            )}
          </Button>

          <p className="text-center text-xs text-slate-400 font-medium">
            Pehle se registered hain? <Link href="/login" className="text-primary font-bold hover:underline">Login karein</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
