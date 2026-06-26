"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  FaLandmark, FaWhatsapp, FaFacebookF, FaYoutube, FaGooglePlay, FaApple,
  FaAmbulance, FaPhoneAlt, FaFireExtinguisher, FaHospital, FaBuilding
} from "react-icons/fa";
import {
  HiOutlineDocumentText, HiOutlineChatBubbleLeftRight, HiOutlineBell,
  HiOutlineShieldCheck, HiOutlineQrCode, HiOutlineUserGroup,
  HiOutlineGlobeAlt, HiOutlineBookOpen, HiOutlineBanknotes,
  HiOutlineExclamationTriangle, HiOutlineSun, HiOutlineHeart,
  HiOutlineMapPin, HiOutlinePhone, HiOutlineEnvelope, HiOutlineClock,
  HiOutlineChevronRight, HiOutlineBars3, HiOutlineXMark,
  HiOutlineArrowRight, HiOutlineStar, HiOutlineCheckCircle,
  HiOutlineRocketLaunch, HiOutlineHomeModern, HiOutlineWrenchScrewdriver,
  HiOutlineLightBulb, HiOutlineClipboardDocumentCheck, HiOutlineTrophy,
  HiOutlineSparkles, HiOutlineArrowTrendingUp, HiOutlineHandThumbUp,
  HiOutlineCalendarDays, HiOutlineAcademicCap, HiOutlinePhoto
} from "react-icons/hi2";

/* ─────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.5, delay: i * 0.08 }
  })
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

/* ─────────────────────────────────────────────
   COUNT-UP HOOK
───────────────────────────────────────────── */
function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return [ref, count];
}

/* ─────────────────────────────────────────────
   SECTION WRAPPER
───────────────────────────────────────────── */
function Section({ children, className = "", id }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeIn}
    >
      {children}
    </motion.section>
  );
}

/* ═══════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
═══════════════════════════════════════════ */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "Services", href: "#services" },
    { name: "Schemes", href: "#schemes" },
    { name: "Development", href: "#development" },
    { name: "Notices", href: "#notices" },
    { name: "Gram Sabha", href: "#gramsabha" },
    { name: "Contact", href: "#contact" },
  ];

  /* ─────────────────────────────────────────
     DATA
  ───────────────────────────────────────── */
  const quickServices = [
    { title: "Residence Certificate", desc: "Niwas Praman Patra ke liye aavedan karein", icon: HiOutlineHomeModern, color: "from-emerald-500 to-green-600" },
    { title: "Income Certificate", desc: "Aay Praman Patra online prapt karein", icon: HiOutlineBanknotes, color: "from-blue-500 to-indigo-600" },
    { title: "Birth Certificate", desc: "Janm Praman Patra ke liye aavedan", icon: HiOutlineSparkles, color: "from-pink-500 to-rose-600" },
    { title: "Death Certificate", desc: "Mrityu Praman Patra registration", icon: HiOutlineDocumentText, color: "from-slate-500 to-slate-700" },
    { title: "Character Certificate", desc: "Charitra Praman Patra ke liye apply karein", icon: HiOutlineShieldCheck, color: "from-violet-500 to-purple-600" },
    { title: "Complaint Registration", desc: "Shikayat darj karein aur track karein", icon: HiOutlineChatBubbleLeftRight, color: "from-amber-500 to-orange-600" },
    { title: "Application Tracking", desc: "Aavedan ki sthiti online dekhein", icon: HiOutlineClipboardDocumentCheck, color: "from-teal-500 to-cyan-600" },
    { title: "Government Schemes", desc: "Sarkaari yojnaon ki jaankari prapt karein", icon: HiOutlineBookOpen, color: "from-indigo-500 to-blue-600" },
  ];

  const features = [
    { title: "Online Certificate System", desc: "Sabhi pramanpatron ke liye digital aavedan", icon: HiOutlineDocumentText, color: "bg-blue-500" },
    { title: "Complaint Management", desc: "Shikayat darj karein, track karein", icon: HiOutlineChatBubbleLeftRight, color: "bg-rose-500" },
    { title: "QR Verified Certificates", desc: "QR Code se praman patra ki sattyata jaanchein", icon: HiOutlineQrCode, color: "bg-violet-500" },
    { title: "WhatsApp Notifications", desc: "Sabhi updates seedha WhatsApp par", icon: FaWhatsapp, color: "bg-green-500" },
    { title: "Gram Sabha Management", desc: "Gram Sabha ki taarikh, agenda, aur minute", icon: HiOutlineUserGroup, color: "bg-indigo-500" },
    { title: "Development Tracking", desc: "Gaon ke vikas karyon ki live monitoring", icon: HiOutlineArrowTrendingUp, color: "bg-orange-500" },
    { title: "Village Directory", desc: "Sampoorn graam parivaar pustak", icon: HiOutlineGlobeAlt, color: "bg-cyan-500" },
    { title: "Digital Document Vault", desc: "Sabhi dastavez surakshit cloud me", icon: HiOutlineShieldCheck, color: "bg-emerald-500" },
    { title: "Tax Management", desc: "Grih kar, jal kar online bhugtan", icon: HiOutlineBanknotes, color: "bg-amber-500" },
    { title: "Emergency Alerts", desc: "Baadh, bimari ke alerts turant milein", icon: HiOutlineExclamationTriangle, color: "bg-red-500" },
    { title: "Agriculture Help Center", desc: "Krishi salah aur yojnaon ki jaankari", icon: HiOutlineSun, color: "bg-lime-500" },
    { title: "Health Camp Registration", desc: "Swasthya shivir me online registration", icon: HiOutlineHeart, color: "bg-pink-500" },
  ];

  const devProjects = [
    { name: "Main Road Concrete Laying", budget: "₹4,50,000", progress: 72, status: "In Progress", color: "from-blue-500 to-indigo-500" },
    { name: "Water Pipeline Extension - Ward 3", budget: "₹2,80,000", progress: 45, status: "In Progress", color: "from-cyan-500 to-blue-500" },
    { name: "Solar Street Light Installation", budget: "₹1,20,000", progress: 100, status: "Completed", color: "from-emerald-500 to-green-500" },
    { name: "Government School Renovation", budget: "₹3,50,000", progress: 30, status: "In Progress", color: "from-amber-500 to-orange-500" },
  ];

  const schemes = [
    { name: "PM Awas Yojana", desc: "Garibon ke liye pakka makan", benefit: "₹1,20,000 anudan", eligibility: "BPL parivaar, kachcha makan", color: "from-orange-500 to-amber-600", icon: HiOutlineHomeModern },
    { name: "Ayushman Bharat", desc: "₹5 Lakh tak ka muft ilaaj", benefit: "Muft swasthya beema", eligibility: "BPL/Ration card holders", color: "from-blue-500 to-indigo-600", icon: HiOutlineHeart },
    { name: "PM Kisan Samman Nidhi", desc: "Kisaanon ko ₹6000 saalana", benefit: "₹2000 har 4 mahine", eligibility: "Sabhi chhote kisaan", color: "from-emerald-500 to-green-600", icon: HiOutlineSun },
    { name: "Ladli Behna Yojana", desc: "Mahilaon ko aarthik sahayata", benefit: "₹1250 pratimah", eligibility: "21-60 aayuवर्ग ki mahilayen", color: "from-pink-500 to-rose-600", icon: HiOutlineTrophy },
  ];

  const notices = [
    { title: "Jal Aapurti Soochna", desc: "Ward 3-4 me kal subah jal aapurti band rahegi pipeline repair ke karan.", badge: "Urgent", badgeColor: "bg-red-500" },
    { title: "Gram Sabha Baithak", desc: "Desh ki taarikh 25 June, samay 10:30 AM, sthan Panchayat Bhawan.", badge: "Important", badgeColor: "bg-amber-500" },
    { title: "Muft Swasthya Shivir", desc: "10 July ko Polio tikakaran abhiyaan - sabhi 5 varsh se kam aayu ke bachche.", badge: "New", badgeColor: "bg-emerald-500" },
    { title: "Bijli Maintenance", desc: "Shanivaar ko Ward 1-2 me bijli supply 2 ghante band rahegi.", badge: "Important", badgeColor: "bg-amber-500" },
  ];

  const emergencyContacts = [
    { name: "Ambulance", number: "108", icon: FaAmbulance, color: "from-red-500 to-rose-600" },
    { name: "Police", number: "100", icon: HiOutlineShieldCheck, color: "from-blue-600 to-indigo-700" },
    { name: "Fire Brigade", number: "101", icon: FaFireExtinguisher, color: "from-orange-500 to-red-500" },
    { name: "Health Center", number: "1800-XXX-XXXX", icon: FaHospital, color: "from-emerald-500 to-green-600" },
    { name: "Panchayat Office", number: "07XX-XXXXXX", icon: FaBuilding, color: "from-violet-500 to-purple-600" },
  ];

  const testimonials = [
    { name: "Ramesh Patel", ward: "Ward 01", feedback: "Digital portal se certificate banana bahut aasaan ho gaya hai. Pehle office ke 4-5 chakkar lagate the, ab ghar baithe ho jaata hai.", rating: 5 },
    { name: "Sunita Devi", ward: "Ward 03", feedback: "Meri complaint online darj ki thi, 3 din me solve ho gayi. Bahut achhi seva hai.", rating: 5 },
    { name: "Mohan Lal Verma", ward: "Ward 05", feedback: "PM Kisan ka paisa samay par milta hai. Panchayat portal par sab kuch track kar sakta hoon.", rating: 4 },
    { name: "Anita Bai", ward: "Ward 02", feedback: "Health camp ki jaankari WhatsApp par mil gayi. Bahut suvidhaajanak system hai.", rating: 5 },
  ];

  const galleryItems = [
    { title: "Panchayat Bhawan", color: "from-emerald-400 to-green-600" },
    { title: "Government School", color: "from-blue-400 to-indigo-600" },
    { title: "Anganwadi Center", color: "from-pink-400 to-rose-600" },
    { title: "Water Storage Tank", color: "from-cyan-400 to-blue-600" },
    { title: "Village Events", color: "from-amber-400 to-orange-600" },
    { title: "Development Works", color: "from-violet-400 to-purple-600" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">

      {/* ═══════════════════════════════════════
         NAVBAR
      ═══════════════════════════════════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-900/5 border-b border-slate-200/50" : "bg-transparent"}`}>
        {/* Saffron top strip */}
        <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-[#138808] to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                  <FaLandmark className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-base md:text-lg font-black text-slate-900 leading-tight tracking-tight">Gram Panchayat Sarahi</p>
                <p className="text-[10px] font-bold text-[#138808] uppercase tracking-widest">Digital Village Portal</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-1">
              {navLinks.map(link => (
                <a key={link.name} href={link.href} className="px-3 py-2 text-sm font-bold text-slate-600 hover:text-[#138808] rounded-lg hover:bg-emerald-50 transition-all">
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Login Buttons */}
            <div className="hidden md:flex items-center gap-2">
              
           
              <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#138808] to-emerald-600 rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0">
                 Login and Register
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="xl:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors" aria-label="Toggle menu">
              {mobileMenuOpen ? <HiOutlineXMark className="w-6 h-6 text-slate-700" /> : <HiOutlineBars3 className="w-6 h-6 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map(link => (
                  <a key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-bold text-slate-700 hover:text-[#138808] hover:bg-emerald-50 rounded-xl transition-all">
                    {link.name}
                  </a>
                ))}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                  <Link href="/login" className="py-2.5 text-xs font-bold text-center text-emerald-700 bg-emerald-50 rounded-xl">Citizen</Link>
                  <Link href="/login" className="py-2.5 text-xs font-bold text-center text-blue-700 bg-blue-50 rounded-xl">Clerk</Link>
                  <Link href="/login" className="py-2.5 text-xs font-bold text-center text-white bg-gradient-to-r from-[#138808] to-emerald-600 rounded-xl">Admin</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════════════════════════════════════
         HERO SECTION
      ═══════════════════════════════════════ */}
      <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/30" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#138808]/8 rounded-full blur-[100px] animate-blob pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[100px] animate-blob animation-delay-2000 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-[#FF9933]/6 rounded-full blur-[100px] animate-blob animation-delay-4000 pointer-events-none" />

        {/* Floating shapes */}
        <div className="absolute top-32 right-20 w-20 h-20 border-2 border-[#138808]/10 rounded-3xl rotate-12 animate-float pointer-events-none hidden lg:block" />
        <div className="absolute bottom-40 left-10 w-16 h-16 border-2 border-blue-500/10 rounded-full animate-float animation-delay-2000 pointer-events-none hidden lg:block" />
        <div className="absolute top-60 left-40 w-6 h-6 bg-[#FF9933]/20 rounded-full animate-bounce-slow pointer-events-none hidden lg:block" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div className="space-y-8" initial="hidden" animate="visible">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 bg-[#138808]/10 text-[#138808] rounded-full border border-[#138808]/20">
                <HiOutlineShieldCheck className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">Digital India Initiative • Govt. of M.P.</span>
              </motion.div>

              <motion.div variants={fadeUp} custom={1} className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                  Digital Gram{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#138808] to-emerald-600">Panchayat</span>{" "}
                  Portal
                </h1>
                <p className="text-xl sm:text-2xl font-bold text-[#FF9933]">
                  अब पंचायत आपके मोबाइल में
                </p>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
                  Apply certificates, register complaints, track applications, view notices, participate in Gram Sabha, and access government services — without visiting the Panchayat office.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} custom={2} className="flex flex-wrap gap-4">
                <Link href="/login" className="inline-flex items-center gap-2 px-7 py-4 text-sm font-bold text-white bg-gradient-to-r from-[#138808] to-emerald-600 rounded-2xl hover:shadow-xl hover:shadow-emerald-500/25 transition-all hover:-translate-y-1 active:translate-y-0">
                  Apply for Certificate <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/login" className="inline-flex items-center gap-2 px-7 py-4 text-sm font-bold text-slate-700 bg-white border-2 border-slate-200 rounded-2xl hover:border-[#138808] hover:text-[#138808] hover:shadow-lg transition-all hover:-translate-y-1">
                  Register Complaint
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} custom={3} className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-200/50">
                {[
                  { value: "1100+", label: "Residents" },
                  { value: "100%", label: "Digital Records" },
                  { value: "24×7", label: "Online Services" },
                  { value: "15+", label: "Govt. Services" },
                ].map((stat, i) => (
                  <div key={i} className="text-center sm:text-left">
                    <p className="text-2xl sm:text-3xl font-black text-[#138808]">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Illustration Area */}
            <motion.div variants={slideInRight} initial="hidden" animate="visible" className="relative hidden lg:block">
              <div className="relative">
                {/* Main Card */}
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-300/50 border border-slate-200/50">
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#138808]/10 via-emerald-50 to-blue-50 flex flex-col items-center justify-center p-12 relative">
                    {/* Panchayat building illustration */}
                    <div className="w-32 h-32 bg-gradient-to-br from-[#138808] to-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30">
                      <FaLandmark className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 text-center">Gram Panchayat Sarahi</h3>
                    <p className="text-sm text-slate-500 font-bold text-center mt-1">Madhya Pradesh</p>

                    {/* Mini icons floating */}
                    <div className="absolute top-8 right-8 w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-float">
                      <HiOutlineDocumentText className="w-7 h-7 text-blue-500" />
                    </div>
                    <div className="absolute bottom-12 left-8 w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-float animation-delay-2000">
                      <HiOutlineChatBubbleLeftRight className="w-7 h-7 text-rose-500" />
                    </div>
                    <div className="absolute top-20 left-12 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center animate-float animation-delay-4000">
                      <HiOutlineQrCode className="w-6 h-6 text-violet-500" />
                    </div>
                  </div>
                </div>

                {/* Floating Badge — Rating */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
                      <HiOutlineStar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-900">4.9</p>
                      <p className="text-[10px] font-bold text-slate-500">User Rating</p>
                    </div>
                  </div>
                </div>

                {/* Floating Badge — Online */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-5 py-3 border border-slate-100 animate-float animation-delay-2000">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-black text-slate-700">1100+ Citizens Online</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         QUICK SERVICES
      ═══════════════════════════════════════ */}
      <Section id="services" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#138808]/10 text-[#138808] rounded-full border border-[#138808]/20 mb-4">
              <HiOutlineRocketLaunch className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">Popular Services</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">Quick Services</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
              Sabse zyada use hone wali panchayat sevayen — ab ek click me
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {quickServices.map((svc, i) => (
              <motion.div key={i} variants={scaleIn} custom={i}>
                <Link href="/login" className="group block p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#138808]/30 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-300">
                  <div className={`w-14 h-14 bg-gradient-to-br ${svc.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <svc.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-1">{svc.title}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">{svc.desc}</p>
                  <div className="flex items-center gap-1 text-[#138808] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Apply Now <HiOutlineChevronRight className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
         DIGITAL FEATURES
      ═══════════════════════════════════════ */}
      <Section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-full border border-blue-500/20 mb-4">
              <HiOutlineLightBulb className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">Why Choose Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">Why Choose Digital Gram Panchayat?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
              Aadhunik technology se panchayat sevaon me paardakshita aur sulabhta
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {features.map((feat, i) => (
              <motion.div key={i} variants={scaleIn} custom={i}
                className="group p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 ${feat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feat.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1">{feat.title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
         LIVE VILLAGE STATISTICS
      ═══════════════════════════════════════ */}
      <Section className="py-20 lg:py-28 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-emerald-400 rounded-full border border-white/10 mb-4">
              <HiOutlineArrowTrendingUp className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">Live Data</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">Village Statistics</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">Real-time data of our digital village governance</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            {[
              { label: "Total Residents", end: 1100, suffix: "+", icon: HiOutlineUserGroup, color: "from-emerald-400 to-green-500" },
              { label: "Active Certificates", end: 856, suffix: "+", icon: HiOutlineDocumentText, color: "from-blue-400 to-indigo-500" },
              { label: "Complaints Resolved", end: 342, suffix: "+", icon: HiOutlineCheckCircle, color: "from-amber-400 to-orange-500" },
              { label: "Govt. Schemes", end: 15, suffix: "+", icon: HiOutlineBookOpen, color: "from-pink-400 to-rose-500" },
              { label: "Dev. Projects", end: 8, suffix: "", icon: HiOutlineWrenchScrewdriver, color: "from-cyan-400 to-blue-500" },
              { label: "Gram Sabha", end: 12, suffix: "", icon: HiOutlineCalendarDays, color: "from-violet-400 to-purple-500" },
            ].map((stat, i) => {
              const [ref, count] = useCountUp(stat.end);
              return (
                <motion.div key={i} variants={scaleIn} custom={i} ref={ref}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center hover:bg-white/10 transition-all group"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl font-black text-white mb-1">{count}{stat.suffix}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
         DEVELOPMENT WORKS
      ═══════════════════════════════════════ */}
      <Section id="development" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-600 rounded-full border border-orange-500/20 mb-4">
              <HiOutlineWrenchScrewdriver className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">Village Development</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">Development Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">Gaon ke vikas karyon ki live sthiti dekhein</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {devProjects.map((proj, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                className="group bg-white border-2 border-slate-100 rounded-3xl p-7 hover:shadow-xl hover:border-slate-200 transition-all"
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">{proj.name}</h3>
                    <p className="text-xs font-bold text-slate-500">Budget: {proj.budget}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${proj.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {proj.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-slate-900">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${proj.color} rounded-full`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${proj.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
         GRAM SABHA
      ═══════════════════════════════════════ */}
      <Section id="gramsabha" className="py-20 lg:py-28 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={slideInLeft}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-600 rounded-full border border-indigo-500/20 mb-4">
                <HiOutlineUserGroup className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">Gram Sabha</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-6">Upcoming Gram Sabha</h2>
              <p className="text-lg text-slate-600 font-medium mb-8">
                Gaon ki sabse badi baithak me shamil hon. Apne mudde uthayein, sujhaav dein, aur vikas me hissa lein.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 hover:shadow-lg transition-all">
                  View Details <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-2xl hover:bg-indigo-100 transition-all">
                  Submit Suggestion
                </Link>
              </div>
            </motion.div>

            <motion.div variants={slideInRight}>
              <div className="bg-white rounded-3xl shadow-xl shadow-indigo-500/10 border border-indigo-100 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-100 to-transparent rounded-bl-[5rem] pointer-events-none" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center"><HiOutlineCalendarDays className="w-6 h-6 text-white" /></div>
                    <div>
                      <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Next Meeting</p>
                      <p className="text-2xl font-black text-slate-900">25 June 2026</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                      <p className="text-base font-black text-slate-900">10:30 AM</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Venue</p>
                      <p className="text-base font-black text-slate-900">Panchayat Bhawan</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-5 border border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Agenda</p>
                    <ul className="space-y-2 text-sm text-slate-700 font-medium">
                      <li className="flex items-start gap-2"><HiOutlineCheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" /> Road repair discussion — Ward 2 & Ward 4</li>
                      <li className="flex items-start gap-2"><HiOutlineCheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" /> Water pipeline maintenance in Block B</li>
                      <li className="flex items-start gap-2"><HiOutlineCheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" /> Final sanitation guidelines approval</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
         GOVERNMENT SCHEMES
      ═══════════════════════════════════════ */}
      <Section id="schemes" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF9933]/10 text-[#FF9933] rounded-full border border-[#FF9933]/20 mb-4">
              <HiOutlineTrophy className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">Government Schemes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">Sarkaari Yojnayen</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">Kendriya evam rajya sarkar ki pramukh yojnaon ki jaankari</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {schemes.map((scheme, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                className="group bg-white border-2 border-slate-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`h-2 bg-gradient-to-r ${scheme.color}`} />
                <div className="p-7">
                  <div className={`w-14 h-14 bg-gradient-to-br ${scheme.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <scheme.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-2">{scheme.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mb-4">{scheme.desc}</p>
                  <div className="space-y-2 mb-5">
                    <div className="bg-emerald-50 rounded-xl px-3 py-2">
                      <p className="text-[10px] font-black text-emerald-700 uppercase">Benefit: {scheme.benefit}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl px-3 py-2">
                      <p className="text-[10px] font-black text-blue-700 uppercase">Eligibility: {scheme.eligibility}</p>
                    </div>
                  </div>
                  <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-[#138808] hover:text-emerald-700 transition-colors">
                    Apply Now <HiOutlineChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
         NOTICE BOARD
      ═══════════════════════════════════════ */}
      <Section id="notices" className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-600 rounded-full border border-rose-500/20 mb-4">
              <HiOutlineBell className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">Notice Board</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">Latest Notices</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">Panchayat ki taza soochnayen aur ghoshnayen</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {notices.map((notice, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                className="group bg-white border-2 border-slate-100 rounded-3xl p-7 hover:shadow-xl hover:border-slate-200 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 ${notice.badgeColor} text-white text-[10px] font-black rounded-full uppercase tracking-wider`}>
                    {notice.badge}
                  </span>
                  <HiOutlineClock className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{notice.title}</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{notice.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
         EMERGENCY SERVICES
      ═══════════════════════════════════════ */}
      <Section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 rounded-full border border-red-500/20 mb-4">
              <HiOutlineExclamationTriangle className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">Emergency</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">Emergency Services</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">Aapaat sthiti me turant sampark karein</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {emergencyContacts.map((contact, i) => (
              <motion.a key={i} href={`tel:${contact.number}`} variants={scaleIn} custom={i}
                className="group bg-white border-2 border-slate-100 rounded-3xl p-7 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-red-200 cursor-pointer"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${contact.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <contact.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1">{contact.name}</h3>
                <p className="text-lg font-black text-red-600">{contact.number}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Tap to Call</p>
              </motion.a>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
         VILLAGE GALLERY
      ═══════════════════════════════════════ */}
      <Section className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 text-violet-600 rounded-full border border-violet-500/20 mb-4">
              <HiOutlinePhoto className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">Village Gallery</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">Our Village</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">Gram Panchayat Sarahi ki jhalak</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryItems.map((item, i) => (
              <motion.div key={i} variants={scaleIn} custom={i}
                className={`group relative ${i === 0 || i === 5 ? "md:row-span-2" : ""} rounded-3xl overflow-hidden cursor-pointer`}
              >
                <div className={`w-full ${i === 0 || i === 5 ? "h-full min-h-[300px]" : "aspect-[4/3]"} bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <div className="text-center text-white p-6">
                    <HiOutlinePhoto className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-lg font-black">{item.title}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
         TESTIMONIALS
      ═══════════════════════════════════════ */}
      <Section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20 mb-4">
              <HiOutlineHandThumbUp className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">Citizen Feedback</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">Naagrik Samiksha</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">Hamare portal ke baare me logon ki raay</p>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-100 rounded-[2.5rem] p-8 sm:p-12 text-center"
              >
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                    <HiOutlineStar key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-lg sm:text-xl text-slate-700 font-medium leading-relaxed mb-8 italic">
                  &ldquo;{testimonials[activeTestimonial].feedback}&rdquo;
                </p>
                <div>
                  <div className="w-14 h-14 bg-gradient-to-br from-[#138808] to-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl font-black mx-auto mb-3">
                    {testimonials[activeTestimonial].name.charAt(0)}
                  </div>
                  <p className="text-base font-black text-slate-900">{testimonials[activeTestimonial].name}</p>
                  <p className="text-xs font-bold text-slate-500">{testimonials[activeTestimonial].ward}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)}
                  className={`w-3 h-3 rounded-full transition-all ${i === activeTestimonial ? "bg-[#138808] w-8" : "bg-slate-300 hover:bg-slate-400"}`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
         DOWNLOAD APP
      ═══════════════════════════════════════ */}
      <Section className="py-20 lg:py-28 bg-gradient-to-r from-[#138808] to-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={slideInLeft} className="text-white space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">Download Our <br />Mobile App</h2>
              <p className="text-lg text-emerald-100 font-medium max-w-md">
                Sabhi panchayat sevayen ab aapke mobile me. Download karein aur ghar baithe sevaon ka labh uthayein.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="inline-flex items-center gap-3 px-6 py-4 bg-black rounded-2xl hover:bg-slate-900 transition-all hover:-translate-y-1 shadow-xl">
                  <FaGooglePlay className="w-7 h-7 text-white" />
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Get it on</p>
                    <p className="text-sm font-black text-white">Google Play</p>
                  </div>
                </button>
                <button className="inline-flex items-center gap-3 px-6 py-4 bg-black rounded-2xl hover:bg-slate-900 transition-all hover:-translate-y-1 shadow-xl">
                  <FaApple className="w-7 h-7 text-white" />
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Download on</p>
                    <p className="text-sm font-black text-white">App Store</p>
                  </div>
                </button>
              </div>
            </motion.div>

            <motion.div variants={slideInRight} className="hidden lg:flex justify-center">
              <div className="relative w-64 h-[500px] bg-slate-900 rounded-[3rem] border-4 border-slate-700 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-10" />
                <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-blue-50 flex flex-col items-center justify-center p-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#138808] to-emerald-600 rounded-3xl flex items-center justify-center mb-4 shadow-xl">
                    <FaLandmark className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-base font-black text-slate-900 text-center">GP Sarahi</h4>
                  <p className="text-[10px] text-slate-500 font-bold text-center mt-1">Digital Village Portal</p>
                  <div className="mt-6 w-full space-y-2">
                    {["Certificates", "Complaints", "Schemes", "Notices"].map((item, i) => (
                      <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
         CONTACT SECTION
      ═══════════════════════════════════════ */}
      <Section id="contact" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-600 rounded-full border border-cyan-500/20 mb-4">
              <HiOutlineEnvelope className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">Contact Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">Sampark Karein</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">Kisi bhi sahaayata ke liye panchayat karyaalay se sampark karein</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Info */}
            <motion.div variants={slideInLeft} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
                    <HiOutlineMapPin className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 mb-1">Panchayat Address</h4>
                    <p className="text-sm text-slate-600 font-medium">Gram Panchayat Bhawan,<br />Sarahi, Madhya Pradesh<br />PIN: 485001</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0">
                    <HiOutlinePhone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 mb-1">Phone</h4>
                    <p className="text-sm text-slate-600 font-medium">1800-XXX-XXXX (Toll Free)<br />07XX-XXXXXX (Office)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center shrink-0">
                    <HiOutlineEnvelope className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 mb-1">Email</h4>
                    <p className="text-sm text-slate-600 font-medium">sarahi@mp.gov.in</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0">
                    <HiOutlineClock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 mb-1">Office Hours</h4>
                    <p className="text-sm text-slate-600 font-medium">Mon - Sat: 10:00 AM - 5:00 PM<br />Sunday: Closed</p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl h-48 flex items-center justify-center">
                <div className="text-center">
                  <HiOutlineMapPin className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-500">Google Maps Integration</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div variants={slideInRight}>
              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-200/50">
                <h3 className="text-xl font-black text-slate-900 mb-6">Send us a Message</h3>
                <form className="space-y-5" onSubmit={e => { e.preventDefault(); alert("Aapka sandesh bhej diya gaya hai!"); }}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input type="text" placeholder="Aapka naam" required className="w-full !bg-slate-50 !border-slate-200 !rounded-2xl !px-5 !py-4 text-sm font-semibold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
                    <input type="tel" placeholder="10 digit mobile number" required className="w-full !bg-slate-50 !border-slate-200 !rounded-2xl !px-5 !py-4 text-sm font-semibold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</label>
                    <textarea rows={4} placeholder="Aapka sandesh likhein..." required className="w-full !bg-slate-50 !border-slate-200 !rounded-2xl !px-5 !py-4 text-sm font-semibold !min-h-[120px] resize-none" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#138808] to-emerald-600 text-white text-sm font-bold rounded-2xl hover:shadow-xl hover:shadow-emerald-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0">
                    Send Message
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
         FOOTER
      ═══════════════════════════════════════ */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* About */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-gradient-to-br from-[#138808] to-emerald-600 rounded-2xl flex items-center justify-center">
                  <FaLandmark className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-lg text-white leading-tight">Gram Panchayat</p>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Sarahi, M.P.</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
                Digital India initiative ke tahat gaon ki sarkar aur sevaon ko online laya gaya hai.
              </p>
              <div className="flex items-center gap-2">
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-green-600 rounded-xl flex items-center justify-center transition-colors" aria-label="WhatsApp">
                  <FaWhatsapp className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors" aria-label="Facebook">
                  <FaFacebookF className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-red-600 rounded-xl flex items-center justify-center transition-colors" aria-label="YouTube">
                  <FaYoutube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-black text-white mb-5">Quick Links</h4>
              <ul className="space-y-3">
                {["Home", "Services", "Schemes", "Notices", "Gram Sabha", "Contact"].map(link => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase().replace(" ", "")}`} className="text-sm text-slate-400 font-medium hover:text-emerald-400 transition-colors flex items-center gap-2">
                      <HiOutlineChevronRight className="w-3 h-3" /> {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-black text-white mb-5">Services</h4>
              <ul className="space-y-3">
                {["Birth Certificate", "Death Certificate", "Income Certificate", "Residence Certificate", "Complaint", "Application Tracking"].map(svc => (
                  <li key={svc}>
                    <Link href="/login" className="text-sm text-slate-400 font-medium hover:text-emerald-400 transition-colors flex items-center gap-2">
                      <HiOutlineChevronRight className="w-3 h-3" /> {svc}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Government Links */}
            <div>
              <h4 className="font-black text-white mb-5">Government Links</h4>
              <ul className="space-y-3">
                {[
                  { name: "Digital India", href: "#" },
                  { name: "Govt. of M.P.", href: "#" },
                  { name: "Ministry of Panchayat", href: "#" },
                  { name: "eGramSwaraj", href: "#" },
                  { name: "PM-KISAN Portal", href: "#" },
                ].map(link => (
                  <li key={link.name}>
                    <a href={link.href} className="text-sm text-slate-400 font-medium hover:text-emerald-400 transition-colors flex items-center gap-2">
                      <HiOutlineChevronRight className="w-3 h-3" /> {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Indian Flag Stripe */}
          <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-full mb-8" />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 font-medium text-center md:text-left">
              © 2026 Digital Gram Panchayat Portal — Sarahi, Madhya Pradesh. All Rights Reserved.
            </p>
            <p className="text-sm text-slate-500 font-medium">
              Powered by <span className="text-emerald-400 font-bold">Digital India</span> 🇮🇳
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
