"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Lock, Mail, Shield, User as UserIcon, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    
    localStorage.setItem("userRole", role);
    localStorage.setItem("userEmail", email);
    
    if (role === "admin") router.push("/admin/dashboard");
    else if (role === "clerk") router.push("/clerk/dashboard");
    else router.push("/citizen/dashboard");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50">
      {/* Background Decorative Elements - FIXED: added pointer-events-none */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />

      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-2xl overflow-hidden relative z-10">
        
        {/* Left Side: Illustration & Text */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary to-emerald-700 text-white relative">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-8">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Secure Portal</span>
            </div>
            <h1 className="text-5xl font-black leading-tight mb-6">
              Empowering <br /> 
              <span className="text-primary-light">Rural</span> Digitalization.
            </h1>
            <p className="text-emerald-100 text-lg leading-relaxed max-w-sm">
              Digitizing village operations for better transparency and faster citizen services.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                   <UserIcon className="w-6 h-6" />
                </div>
                <div>
                   <p className="font-bold">10k+ CitizensJoined</p>
                   <p className="text-xs text-emerald-200">Across 5 different Gram Panchayats</p>
                </div>
             </div>
          </div>

          {/* Abstract circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center bg-white/40">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Panchayat Login</h2>
            <p className="text-slate-500 font-medium">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email / Mobile</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. user@gram.in"
                      className="w-full bg-slate-100 border-2 border-transparent pl-12 pr-4 py-3.5 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                 </div>
              </div>

              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Secret PIN / Password</label>
                 <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-slate-100 border-2 border-transparent pl-12 pr-4 py-3.5 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                 </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center">I am a</p>
              <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1">
                {["citizen", "clerk", "admin"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      setEmail(`${r}@gram.in`);
                      setPassword("password123");
                    }}
                    className={`flex-1 py-2.5 text-[10px] font-black rounded-xl capitalize transition-all duration-300 ${
                      role === r
                        ? "bg-white text-primary shadow-sm scale-[1.02]"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-7 text-lg font-bold rounded-2xl shadow-xl shadow-primary/10 gap-2 bg-primary text-white hover:bg-primary-dark"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Access My Dashboard <ArrowRight className="w-5 h-5" /></>
              )}
            </Button>
          </form>

          <div className="mt-10 text-center">
             <p className="text-slate-400 text-xs font-bold">
               Naya Account? <button className="text-primary hover:underline">Register Karein</button>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
