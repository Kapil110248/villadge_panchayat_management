"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, User, Menu, Command, LogOut, FileText, Users, Shield, BarChart, Settings, MessageSquare, Landmark, Hammer, X, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const searchItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: BarChart, keywords: "dashboard home overview analytics" },
  { name: "Registration Requests", path: "/admin/registration-requests", icon: Users, keywords: "registration requests citizens new members" },
  { name: "Clerk Management", path: "/admin/clerks", icon: Users, keywords: "clerk staff management add employee" },
  { name: "Final Approvals", path: "/admin/approvals", icon: Shield, keywords: "approvals certificates sign approve reject" },
  { name: "Complaints Monitor", path: "/admin/complaints", icon: MessageSquare, keywords: "complaints grievances issues problems water road" },
  { name: "Scheme Entry", path: "/admin/schemes", icon: FileText, keywords: "schemes yojana government pm awas mgnrega" },
  { name: "Broadcast Notices", path: "/admin/notices", icon: Bell, keywords: "notices announcements broadcast alert sms" },
  { name: "System Reports", path: "/admin/reports", icon: BarChart, keywords: "reports analytics data export csv statistics" },
  { name: "Gram Sabha", path: "/admin/gram-sabha", icon: Landmark, keywords: "gram sabha meeting attendance agenda minutes" },
  { name: "Development Works", path: "/admin/development", icon: Hammer, keywords: "development projects construction road infrastructure" },
  { name: "Village Directory", path: "/admin/directory", icon: Users, keywords: "directory citizens list villagers phone numbers" },
  { name: "Tax Collection", path: "/admin/taxes", icon: FileText, keywords: "tax collection revenue payment property house" },
  { name: "Suggestions", path: "/admin/suggestions", icon: MessageSquare, keywords: "suggestions feedback ideas citizens" },
  { name: "Settings", path: "/admin/settings", icon: Settings, keywords: "settings configuration security portal" },
  { name: "My Profile", path: "/admin/profile", icon: User, keywords: "profile admin sarpanch account" },
];

export function Navbar({ role, onMenuClick }) {
  const [userName, setUserName] = useState("Ramesh Kumar");
  const [userAvatar, setUserAvatar] = useState(null);
  const [villageName, setVillageName] = useState("Sarahi");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeToast, setActiveToast] = useState(null);

  const displayedNotifIds = useRef(new Set());
  const isFirstLoad = useRef(true);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const endpoint = role === "admin" ? "/notifications" : "/citizen/notifications";
      const res = await api.get(endpoint, token);
      
      let fetchedNotifs = [];
      let unread = 0;
      if (role !== "admin") {
        fetchedNotifs = res || [];
        unread = fetchedNotifs.filter(n => !n.is_read).length;
      } else {
        fetchedNotifs = res.notifications || [];
        unread = res.unread_count || 0;
      }

      setNotifications(fetchedNotifs);
      setUnreadCount(unread);

      // Handle real-time Toast alerts for new incoming unread notifications
      if (fetchedNotifs.length > 0) {
        if (isFirstLoad.current) {
          fetchedNotifs.forEach(n => displayedNotifIds.current.add(n.id));
          isFirstLoad.current = false;
        } else {
          const newUnread = fetchedNotifs.find(n => !n.is_read && !displayedNotifIds.current.has(n.id));
          if (newUnread) {
            displayedNotifIds.current.add(newUnread.id);
            setActiveToast(newUnread);
            setTimeout(() => {
              setActiveToast(curr => curr?.id === newUnread.id ? null : curr);
            }, 8000);
          }
        }
      }
    } catch (e) { console.error("Failed to fetch notifications"); }
  };

  const markAsRead = async (id, url) => {
    try {
      const token = localStorage.getItem("accessToken");
      const endpoint = role === "admin" ? `/notifications/${id}/read` : `/citizen/notifications/${id}/read`;
      await api.put(endpoint, {}, token);
      fetchNotifications();
      if (url) {
        setShowNotifications(false);
        let targetUrl = url;
        if (role === "clerk" && url.startsWith("/admin/")) {
          targetUrl = url.replace("/admin/", "/clerk/");
        }
        router.push(targetUrl);
      }
    } catch (e) {}
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const endpoint = role === "admin" ? `/notifications/read-all` : `/citizen/notifications/read-all`;
      await api.put(endpoint, {}, token);
      fetchNotifications();
    } catch (e) {}
  };

  useEffect(() => {
    const handleAvatarUpdate = async () => {
      const storedName = localStorage.getItem("userName");
      if (storedName) setUserName(storedName);
      const storedAvatar = localStorage.getItem("userAvatar");
      if (storedAvatar) setUserAvatar(storedAvatar);

      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          if (role === "admin") {
            const data = await api.get("/admin/profile", token);
            if (data) {
              if (data.name) {
                setUserName(data.name);
                localStorage.setItem("userName", data.name);
              }
              if (data.avatar_url !== undefined) {
                setUserAvatar(data.avatar_url);
                localStorage.setItem("userAvatar", data.avatar_url || "");
              }
              if (data.village) {
                setVillageName(data.village);
              }
            }
          } else {
            // Fetch public panchayat info
            try {
              const pInfo = await api.get("/panchayat/info");
              if (pInfo && pInfo.village) {
                setVillageName(pInfo.village);
              }
            } catch (e) {}

            if (role === "citizen") {
              const data = await api.get("/citizen/profile", token);
              if (data && data.user) {
                if (data.user.full_name) {
                  setUserName(data.user.full_name);
                  localStorage.setItem("userName", data.user.full_name);
                }
                if (data.user.avatar_url !== undefined) {
                  setUserAvatar(data.user.avatar_url);
                  localStorage.setItem("userAvatar", data.user.avatar_url || "");
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading navbar details:", err);
      }
    };
    
    handleAvatarUpdate();
    window.addEventListener("avatarUpdated", handleAvatarUpdate);
    
    // Fetch immediately
    fetchNotifications();
    
    // Poll every 5 seconds for instant notification arrival
    const interval = setInterval(fetchNotifications, 5000);
    return () => {
      window.removeEventListener("avatarUpdated", handleAvatarUpdate);
      clearInterval(interval);
    };
  }, [role]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.querySelector("input")?.focus();
      }
      if (e.key === "Escape") {
        setShowResults(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredResults = searchQuery.trim()
    ? searchItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelect = (path) => {
    setSearchQuery("");
    setShowResults(false);
    router.push(path);
  };

  return (
    <header className="h-20 border-b border-slate-200/50 glass sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4 md:gap-6 flex-1">
        <button onClick={onMenuClick} className="lg:hidden p-2 md:p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all">
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        
        <div className="relative max-w-lg w-full hidden md:block" ref={searchRef}>
          <div className="flex items-center gap-3 bg-slate-100 border border-transparent rounded-[1.25rem] px-4 h-[46px] focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all">
             <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
             <input
               type="text"
               placeholder="Search records, schemes, certificates..."
               className="flex-1 bg-transparent text-sm font-medium placeholder:text-slate-400 outline-none border-none focus:ring-0 w-full p-0 m-0"
               value={searchQuery}
               onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
               onFocus={() => { if (searchQuery.trim()) setShowResults(true); }}
             />
             
             <div className="flex items-center gap-2 flex-shrink-0">
               {searchQuery && (
                 <button onClick={() => { setSearchQuery(""); setShowResults(false); }} className="p-1 hover:bg-slate-200 rounded-full transition-all">
                   <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                 </button>
               )}
               <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm pointer-events-none">
                  <Command className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400">K</span>
               </div>
             </div>
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50">
              {filteredResults.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm font-bold text-slate-400">No results found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="py-2 max-h-80 overflow-y-auto">
                  <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pages ({filteredResults.length})</p>
                  {filteredResults.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleSelect(item.path)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-all text-left group"
                      >
                        <div className="w-9 h-9 bg-slate-100 group-hover:bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                          <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{item.path}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 font-bold text-xs uppercase tracking-tighter shadow-sm">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          {role} Access
        </div>
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all group">
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute top-3 right-3 w-4 h-4 bg-primary text-[8px] font-black text-white flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-0 sm:top-full sm:absolute sm:mt-2 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-black text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs font-bold text-primary hover:text-primary/80">Mark all read</button>
                )}
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="font-bold text-sm">All caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-4 transition-colors cursor-pointer group ${!notif.is_read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-slate-50'}`}
                        onClick={() => markAsRead(notif.id, notif.action_url)}
                      >
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${!notif.is_read ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}>
                            {notif.sender?.avatar_url ? (
                               <img src={notif.sender.avatar_url.startsWith('http') ? notif.sender.avatar_url : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8001'}${notif.sender.avatar_url}`} alt="Sender" className="w-full h-full object-cover" />
                            ) : notif.type === 'complaint' ? <MessageSquare className="w-4 h-4" /> : 
                             notif.type === 'certificate' ? <FileText className="w-4 h-4" /> : 
                             notif.type === 'leave' ? <User className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`text-sm ${!notif.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>{notif.title}</p>
                              {notif.sender && (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full line-clamp-1 break-all">
                                  {notif.sender.full_name} {notif.sender.mobile ? `(${notif.sender.mobile})` : ''}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">
                              {new Date(notif.created_at).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-5 border-l border-slate-200">
          <div className="text-right hidden xl:block">
            <p className="text-sm font-black text-slate-900 leading-none">{userName}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              {villageName.toLowerCase().includes("panchayat") || villageName.toLowerCase().includes("panchyat") ? villageName : `${villageName} Village`}
            </p>
          </div>
          <Link href={`/${role}/profile`} className="relative group cursor-pointer block">
             <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 p-1 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center overflow-hidden">
                   {userAvatar ? (
                     <img src={userAvatar.startsWith('http') ? userAvatar : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:8001'}${userAvatar}`} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <User className="w-6 h-6 text-primary" />
                   )}
                </div>
             </div>
             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </Link>
          <Link 
            href="/logout" 
            className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm group border border-rose-100"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Real-time Notification Toast */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white/95 backdrop-blur border border-primary/20 rounded-2xl shadow-2xl p-4 flex gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-black text-slate-900 line-clamp-1">{activeToast.title}</h4>
              <button 
                onClick={() => setActiveToast(null)} 
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed line-clamp-2">{activeToast.message}</p>
            {activeToast.action_url && (
              <button 
                onClick={() => {
                  markAsRead(activeToast.id, activeToast.action_url);
                  setActiveToast(null);
                }} 
                className="mt-2 text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                View Details <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
