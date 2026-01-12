"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { 
  Shield, 
  Users, 
  FileText, 
  MessageSquare, 
  ChevronRight, 
  Building2,
  ArrowRight,
  Globe,
  HandHelping,
  PhoneCall,
  Award,
  Landmark,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  Star,
  Zap,
  TrendingUp,
  Target
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 md:px-20 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Landmark className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Gram Panchayat Sarahi
                </h1>
                <p className="text-sm font-semibold text-primary">Digital Village Portal</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#services" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                Services
              </a>
              <a href="#schemes" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                Schemes
              </a>
              <a href="#notices" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                Notices
              </a>
              <a href="#contact" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                Contact
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/register">
                <Button variant="outline" className="border-2 border-slate-300 font-bold hover:border-primary hover:text-primary">
                  Register
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/20">
                  Portal Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white py-20 md:py-32 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-60 -translate-y-1/4 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl opacity-60 translate-y-1/4 -translate-x-1/4" />
        </div>

        <div className="max-w-7xl mx-auto px-8 md:px-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full border border-primary/20">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-black uppercase tracking-wider">Digital India Initiative</span>
              </div>

              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">
                  Welcome to<br />
                  <span className="text-primary">
                    Sarahi Panchayat
                  </span><br />
                  <span className="text-3xl md:text-4xl text-slate-600">Digital Portal</span>
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed max-w-xl font-medium">
                  Access all panchayat services online. Apply for certificates, register complaints, explore government schemes - all from the comfort of your home.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-6 text-base shadow-xl shadow-primary/20 rounded-xl">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#services">
                  <Button variant="outline" size="lg" className="border-2 border-slate-300 font-bold px-8 py-6 text-base rounded-xl hover:border-primary hover:bg-primary/5">
                    Explore Services
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200">
                <div>
                  <p className="text-3xl font-black text-primary">8,500+</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Citizens</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-blue-600">4,200+</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Registered Users</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-rose-600">100%</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Digital</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 via-emerald-100 to-primary/20 flex items-center justify-center">
                  <Building2 className="w-40 h-40 text-primary/40" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <p className="text-2xl font-black mb-1">Gram Panchayat Bhawan</p>
                  <p className="text-sm text-slate-200">Sarahi, Madhya Pradesh</p>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border-2 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">4.9</p>
                    <p className="text-xs font-semibold text-slate-500">User Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8 md:px-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-4 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-black uppercase tracking-wider">Our Services</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Panchayat Digital Services</h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
              Everything you need to interact with your local panchayat, available 24/7
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: "Certificates", 
                desc: "Birth, Death, Income & Residence certificates online", 
                icon: FileText, 
                color: "blue"
              },
              { 
                title: "Grievances", 
                desc: "Report and track water, road, electricity issues", 
                icon: MessageSquare, 
                color: "rose"
              },
              { 
                title: "Govt. Schemes", 
                desc: "Check eligibility and apply for PM-Kisan & more", 
                icon: Award, 
                color: "emerald"
              },
              { 
                title: "Citizen Support", 
                desc: "Direct line to Panchayat Secretary & Sarpanch", 
                icon: HandHelping, 
                color: "amber"
              },
            ].map((service, i) => (
              <Link 
                href="/login" 
                key={i} 
                className="group bg-white border-2 border-slate-200 hover:border-primary rounded-[2.5rem] p-8 transition-all hover:shadow-2xl hover:-translate-y-2"
              >
                <div className={`w-14 h-14 bg-${service.color}-500/10 text-${service.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-${service.color}-600 group-hover:text-white transition-all border border-${service.color}-500/20`}>
                  <service.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2">{service.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 font-medium">{service.desc}</p>
                <div className="flex items-center gap-2 text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Access Now <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Notice Board */}
      <section id="notices" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-8 md:px-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-black text-slate-900 mb-2">Latest Updates</h3>
              <p className="text-slate-600 font-medium">Stay informed with recent announcements</p>
            </div>
            <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Gram Sabha Meeting Scheduled", date: "15 Jan 2026", type: "Important" },
              { title: "New Scheme Launch Announcement", date: "10 Jan 2026", type: "Update" },
              { title: "Water Supply Project Completed", date: "05 Jan 2026", type: "Success" },
            ].map((notice, i) => (
              <div key={i} className="bg-white border-2 border-slate-100 hover:border-primary rounded-2xl p-6 shadow-md hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full border border-primary/20">
                    {notice.type}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <h4 className="font-black text-lg text-slate-900 mb-3">{notice.title}</h4>
                <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {notice.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-8 md:px-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* About */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Landmark className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-black text-xl">Gram Panchayat Sarahi</p>
                  <p className="text-sm text-slate-400">Digital Village Portal</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6 font-medium">
                Part of the Digital India initiative by the Government of Madhya Pradesh, bringing transparency and efficiency to rural governance.
              </p>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 bg-slate-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors">
                  <Globe className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-slate-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors">
                  <PhoneCall className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-slate-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#services" className="hover:text-primary transition-colors flex items-center gap-2 font-medium"><ChevronRight className="w-4 h-4" /> Services</a></li>
                <li><a href="#schemes" className="hover:text-primary transition-colors flex items-center gap-2 font-medium"><ChevronRight className="w-4 h-4" /> Schemes</a></li>
                <li><a href="#notices" className="hover:text-primary transition-colors flex items-center gap-2 font-medium"><ChevronRight className="w-4 h-4" /> Notices</a></li>
                <li><a href="/login" className="hover:text-primary transition-colors flex items-center gap-2 font-medium"><ChevronRight className="w-4 h-4" /> Login</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-white mb-4 text-lg">Contact Us</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="font-medium">Gram Panchayat Bhawan<br />Sarahi, Madhya Pradesh<br />PIN: 123456</span>
                </li>
                <li className="flex items-center gap-3">
                  <PhoneCall className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-medium">1800-XXX-XXXX</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-medium">sarahi@mp.gov.in</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2026 Gram Panchayat Sarahi. All rights reserved.
            </p>
            <p className="text-sm text-slate-500">
              Powered by <span className="text-primary font-semibold">Digital India</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
