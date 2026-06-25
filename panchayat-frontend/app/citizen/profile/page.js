"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User, Phone, Mail, MapPin, Shield, Camera, Edit3, Award, Users, FileText, ChevronRight, X, AlertCircle, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingMemberAvatar, setUploadingMemberAvatar] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [viewingMember, setViewingMember] = useState(null);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [updatingMember, setUpdatingMember] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [vaultDocuments, setVaultDocuments] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const docInputRef = useRef(null);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [tempFile, setTempFile] = useState(null);
  const [docUploadForm, setDocUploadForm] = useState({
    name: "",
    type: "PDF"
  });

  // Edit Form state
  const [memberEditForm, setMemberEditForm] = useState({
    id: null,
    full_name: "",
    dob: "",
    gender: "male",
    relation: "Wife",
    email: "",
    mobile: "",
    avatar_url: ""
  });
  const [uploadingNewMemberAvatar, setUploadingNewMemberAvatar] = useState(false);
  const [memberForm, setMemberForm] = useState({
    full_name: "",
    dob: "",
    gender: "male",
    relation: "Wife",
    email: "",
    mobile: "",
    avatar_url: ""
  });
  const [editForm, setEditForm] = useState({
    full_name: "",
    father_name: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    address: "",
    village: "",
    pincode: "",
    aadhaar_number: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await api.get("/citizen/profile", token);
      setProfileData(res);
      
      // Load documents from backend with localStorage fallback
      if (res && res.user) {
        try {
          const docs = await api.get(`/citizen/vault-documents/${res.user.id}`, token);
          setVaultDocuments(docs || []);
        } catch (err) {
          console.error("Failed to load vault documents from server", err);
          const savedDocs = localStorage.getItem(`vault_docs_${res.user.id}`);
          if (savedDocs) {
            try {
              setVaultDocuments(JSON.parse(savedDocs));
            } catch (e) {
              console.error("Error parsing saved documents", e);
            }
          }
        }
      }

      // Initialize edit form
      if (res) {
        setEditForm({
          full_name: res.user.full_name || "",
          father_name: res.profile.father_name || "",
          email: res.user.email || "",
          mobile: res.user.mobile || "",
          dob: res.user.date_of_birth ? new Date(res.user.date_of_birth).toISOString().split('T')[0] : "",
          gender: res.profile.gender || "male",
          address: res.user.address || "",
          village: res.profile.village || "Sarahi",
          pincode: res.profile.pincode || "",
          aadhaar_number: res.profile.aadhaar_number || "",
          password: "",
          confirmPassword: ""
        });
      }
    } catch (err) {
      console.error("Error loading profile", err);
      showToast("Profile data load karne me dikkat aayi.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showToast("File size must be less than 3MB.", "error");
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
      
      // Update avatar in database immediately
      await api.put("/citizen/profile", { avatar_url: uploadData.secure_url }, token);
      localStorage.setItem("userAvatar", uploadData.secure_url);
      window.dispatchEvent(new Event("avatarUpdated"));
      showToast("Profile picture update ho gayi!");
      fetchProfile();
    } catch (err) {
      console.error(err);
      showToast("Avatar upload failed. Try again.", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      showToast("Password aur Confirm Password match nahi ho rhe hain.", "error");
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem("accessToken");
      const payload = {
        full_name: editForm.full_name,
        father_name: editForm.father_name,
        email: editForm.email,
        mobile: editForm.mobile,
        dob: editForm.dob,
        gender: editForm.gender,
        address: editForm.address,
        village: editForm.village,
        pincode: editForm.pincode,
        aadhaar_number: editForm.aadhaar_number
      };

      if (editForm.password) {
        payload.password = editForm.password;
      }

      await api.put("/citizen/profile", payload, token);
      localStorage.setItem("userName", editForm.full_name);
      window.dispatchEvent(new Event("avatarUpdated"));
      showToast("Profile changes saved successfully!");
      setShowEditModal(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || "Failed to update profile.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberForm.full_name) {
      showToast("Name is required.", "error");
      return;
    }

    try {
      setAddingMember(true);
      const token = localStorage.getItem("accessToken");
      await api.post("/citizen/family/members", memberForm, token);
      showToast("Family member added successfully!");
      setShowAddMemberModal(false);
      setMemberForm({
        full_name: "",
        dob: "",
        gender: "male",
        relation: "Wife",
        email: "",
        mobile: "",
        avatar_url: ""
      });
      fetchProfile();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || "Failed to add family member.", "error");
    } finally {
      setAddingMember(false);
    }
  };

  const handleOpenMemberDetails = (member) => {
    setViewingMember(member);
    setIsEditingMember(false);
    setMemberEditForm({
      id: member.id,
      full_name: member.name || "",
      dob: member.dob || "",
      gender: member.gender || "male",
      relation: member.relation || "Wife",
      email: member.email || "",
      mobile: member.mobile || "",
      avatar_url: member.avatar_url || ""
    });
  };

  const handleMemberAvatarUpload = async (e, memberId) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showToast("File size must be less than 3MB.", "error");
      return;
    }

    try {
      setUploadingMemberAvatar(true);
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
      
      setMemberEditForm(prev => ({ ...prev, avatar_url: uploadData.secure_url }));
      
      // Update directly in backend
      await api.put(`/citizen/family/members/${memberId}`, { avatar_url: uploadData.secure_url }, token);
      
      setViewingMember(prev => prev ? { ...prev, avatar_url: uploadData.secure_url } : null);
      showToast("Family member profile picture update ho gayi!");
      fetchProfile();
    } catch (err) {
      console.error(err);
      showToast("Avatar upload failed. Try again.", "error");
    } finally {
      setUploadingMemberAvatar(false);
    }
  };

  const handleNewMemberAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showToast("File size must be less than 3MB.", "error");
      return;
    }

    try {
      setUploadingNewMemberAvatar(true);
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
      
      setMemberForm(prev => ({ ...prev, avatar_url: uploadData.secure_url }));
      showToast("Photo uploaded successfully!");
    } catch (err) {
      console.error(err);
      showToast("Avatar upload failed. Try again.", "error");
    } finally {
      setUploadingNewMemberAvatar(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast("File size must be less than 10MB.", "error");
      return;
    }
    setTempFile(file);
    const baseName = file.name.split('.').slice(0, -1).join('.') || "Document";
    const extension = file.name.split('.').pop()?.toLowerCase();
    const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension || '');
    
    setDocUploadForm({
      name: baseName,
      type: isImage ? "Image" : "PDF"
    });
    setShowDocUploadModal(true);
  };

  const handleConfirmUpload = async (e) => {
    e.preventDefault();
    if (!tempFile) return;

    try {
      setUploadingDoc(true);
      setShowDocUploadModal(false);
      const token = localStorage.getItem("accessToken");
      const fd = new FormData();
      fd.append('file', tempFile);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const uploadData = await res.json();
      
      let icon = "FileText";
      let color = "text-emerald-400";
      if (docUploadForm.type === "Aadhaar Card") {
        icon = "Shield";
        color = "text-emerald-400";
      } else if (docUploadForm.type === "Ration Identity") {
        icon = "Award";
        color = "text-amber-400";
      } else if (docUploadForm.type === "Image") {
        icon = "Camera";
        color = "text-sky-400";
      }
      
      const newDocs = [
        ...vaultDocuments,
        {
          name: docUploadForm.name,
          status: "Verified",
          icon: icon,
          color: color,
          url: uploadData.secure_url,
          docType: docUploadForm.type
        }
      ];
      setVaultDocuments(newDocs);
      if (profileData && profileData.user) {
        localStorage.setItem(`vault_docs_${profileData.user.id}`, JSON.stringify(newDocs));
        try {
          await api.post("/citizen/vault-documents", { documents: newDocs }, token);
        } catch (err) {
          console.error("Failed to save vault documents to backend", err);
        }
      }
      showToast(`${docUploadForm.name} upload ho gya!`);
      setTempFile(null);
    } catch (err) {
      console.error(err);
      showToast("Document upload failed. Try again.", "error");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!isEditingMember) return;
    if (!memberEditForm.full_name) {
      showToast("Name is required.", "error");
      return;
    }

    try {
      setUpdatingMember(true);
      const token = localStorage.getItem("accessToken");
      await api.put(`/citizen/family/members/${memberEditForm.id}`, memberEditForm, token);
      showToast("Family member details updated successfully!");
      setViewingMember(null);
      setIsEditingMember(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || "Failed to update family member.", "error");
    } finally {
      setUpdatingMember(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500 font-medium">Loading profile...</div>;
  }

  if (!profileData) {
    return <div className="text-center py-12 text-slate-500 font-medium">Profile details could not be found.</div>;
  }

  const { user, profile, members } = profileData;

  return (
    <div className="space-y-10 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} flex items-center gap-2 animate-in slide-in-from-top-5`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Premium Header Profile */}
      <div className="relative p-10 bg-white rounded-[3rem] premium-card overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative group">
            <div className="w-40 h-40 bg-slate-100 rounded-[3rem] p-1.5 shadow-2xl border-2 border-white group-hover:scale-105 transition-transform duration-500">
               <div className="w-full h-full bg-white rounded-[2.5rem] flex items-center justify-center overflow-hidden relative">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-20 h-20 text-slate-200" />
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold animate-pulse">
                      Uploading...
                    </div>
                  )}
               </div>
            </div>
            <label className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-2xl shadow-xl hover:bg-primary-dark transition-all scale-90 group-hover:scale-100 cursor-pointer">
              <Camera className="w-5 h-5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            </label>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest mb-3">
               <Shield className="w-3 h-3" /> Verified Citizen
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user.full_name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4">
              <span className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> {profile.village ? `Ward & Village ${profile.village}` : "Not Set"}
              </span>
              <span className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" /> Aadhaar Linked
              </span>
            </div>
          </div>

          <div className="flex gap-3 shrink-0">
             <Button className="bg-slate-900 rounded-2xl gap-2 hover:bg-slate-800" onClick={() => setShowEditModal(true)}>
               <Edit3 className="w-4 h-4" /> Edit Profile
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader title="Information Overview" subtitle="Official identity and contact synchronization" />
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Aadhar Association</p>
                  <p className="text-lg font-black text-slate-900">{profile.aadhaar_number}</p>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                     <div className="bg-emerald-500 h-full w-full" />
                  </div>
               </div>
               
               <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Mobile Connectivity</p>
                  <p className="text-lg font-black text-slate-900">{user.mobile || "Not Provided"}</p>
                  {user.mobile && <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight italic">✓ Active for SMS Alerts</p>}
               </div>

               <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Father's Name</p>
                  <p className="text-lg font-black text-slate-900">{profile.father_name || "Not Provided"}</p>
               </div>

               <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Email Sync</p>
                  <p className="text-lg font-black text-slate-900">{user.email}</p>
               </div>

               <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Date of Birth</p>
                  <p className="text-lg font-black text-slate-900">
                    {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "Not Provided"}
                  </p>
               </div>

               <div className="md:col-span-2 space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Residential Landmark / Address</p>
                  <p className="text-base font-bold text-slate-700 leading-relaxed uppercase tracking-tight">
                    {user.address || "No address details provided."}
                  </p>
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Household Circle" subtitle="Members linked to your official address" />
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50">
                  {members && members.length > 0 ? (
                    members.map((member, i) => (
                      <div key={i} onClick={() => handleOpenMemberDetails(member)} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden flex items-center justify-center text-sm font-black text-slate-400 group-hover:border-primary/20 group-hover:rotate-6 transition-all shadow-sm shrink-0">
                             {member.avatar_url ? (
                               <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full bg-white flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                 {member.name.charAt(0)}
                               </div>
                             )}
                          </div>
                          <div>
                             <p className="text-lg font-black text-slate-900">{member.name}</p>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{member.relation} • {member.age} Years</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 font-medium text-sm italic">
                      No household members linked to this address yet.
                    </div>
                  )}
               </div>
               <div className="p-6">
                  <Button onClick={() => setShowAddMemberModal(true)} variant="ghost" className="w-full rounded-2xl border-2 border-dashed border-slate-100 hover:border-primary/20 hover:bg-primary/5 text-slate-400 hover:text-primary">
                    <Users className="w-4 h-4 mr-2" /> Add Family Member
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
            <Card className="text-white border-none relative overflow-hidden" style={{ background: '#0f172a' }}>
               <CardHeader title="Digital Vault" titleClassName="text-white" subtitle="Manage your official certificates" subtitleClassName="text-slate-400" className="border-white/5" />
               <CardContent className="space-y-4 relative z-10">
                  {vaultDocuments.length > 0 ? (
                    vaultDocuments.map((doc, i) => {
                      const IconComponent = doc.icon === "Shield" ? Shield : doc.icon === "Award" ? Award : doc.icon === "Camera" ? Camera : FileText;
                      return (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl rounded-[1.5rem] border border-white/5 hover:bg-white/10 transition-all group">
                           <div onClick={() => doc.url && window.open(doc.url, '_blank')} className="flex items-center gap-4 min-w-0 cursor-pointer flex-1">
                              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 ${doc.color}`}>
                                 <IconComponent className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold truncate">{doc.name}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                               {doc.status}
                             </span>
                             <button 
                               type="button" 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setDeleteTarget({ index: i, name: doc.name });
                               }}
                               className="p-1 hover:bg-white/10 text-white/40 hover:text-rose-400 rounded-lg transition-colors"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-sm font-medium italic">
                      No documents in your vault yet.
                    </div>
                  )}
                  <div className="pt-6">
                     <Button 
                       type="button" 
                       variant="outline" 
                       className="w-full border-white/10 text-white hover:bg-white/10 rounded-2xl"
                       onClick={() => docInputRef.current?.click()}
                       disabled={uploadingDoc}
                     >
                       {uploadingDoc ? "Uploading..." : "Upload New Document"}
                     </Button>
                     <input 
                       type="file" 
                       ref={docInputRef} 
                       className="hidden" 
                       onChange={handleFileSelect} 
                     />
                  </div>
               </CardContent>
               <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            </Card>

            <Card className="p-8 text-center bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-100">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-emerald-200">
                  <Shield className="w-8 h-8 text-emerald-600" />
               </div>
               <h4 className="text-xl font-black text-slate-900 mb-2">Security Hub</h4>
               <p className="text-sm text-slate-500 font-medium leading-relaxed">
                 Your data is encrypted and protected by the Panchayat Digital Security Act.
               </p>
            </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-lg relative shadow-2xl border-0 bg-white max-h-[90vh] flex flex-col overflow-hidden rounded-2xl">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 pb-4 border-b border-slate-100 shrink-0 pr-12">
              <h2 className="text-xl font-black text-slate-900 font-sans">Edit Profile Details</h2>
              <p className="text-sm font-medium text-slate-500">Apni panchayat records aur details ko update karein</p>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 pr-4 scrollbar-thin min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Father's Name *</label>
                    <input
                      required
                      type="text"
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                      value={editForm.father_name}
                      onChange={(e) => setEditForm({ ...editForm, father_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mobile Number *</label>
                    <input
                      required
                      type="text"
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                      value={editForm.mobile}
                      onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email ID *</label>
                    <input
                      required
                      type="email"
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Gender</label>
                    <select
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Date of Birth</label>
                    <input
                      type="date"
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                      value={editForm.dob}
                      onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Village / Ward *</label>
                    <input
                      required
                      type="text"
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                      value={editForm.village}
                      onChange={(e) => setEditForm({ ...editForm, village: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Pincode</label>
                    <input
                      type="text"
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                      value={editForm.pincode}
                      onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Aadhaar Number *</label>
                    <input
                      required
                      type="text"
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                      value={editForm.aadhaar_number}
                      onChange={(e) => setEditForm({ ...editForm, aadhaar_number: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Address</label>
                  <textarea
                    rows={2}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none resize-none"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>

                {/* Password Update section */}
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                      <input
                        type="password"
                        placeholder="Leave blank to keep current"
                        className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                        value={editForm.password}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Leave blank to keep current"
                        className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                        value={editForm.confirmPassword}
                        onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50/50">
                <Button type="button" variant="outline" className="w-1/2 py-5 rounded-xl text-sm font-bold border-slate-200" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updating} className="w-1/2 py-5 rounded-xl text-sm font-bold bg-primary hover:bg-primary-dark text-white shadow-lg">
                  {updating ? "Saving Changes..." : "Save Details"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
      {/* Add Family Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-md relative shadow-2xl border-0 bg-white max-h-[90vh] flex flex-col overflow-hidden rounded-2xl">
            <button onClick={() => setShowAddMemberModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 pb-4 border-b border-slate-100 shrink-0 pr-12">
              <h2 className="text-xl font-black text-slate-900 font-sans">Add Family Member</h2>
              <p className="text-sm font-medium text-slate-500 font-sans">Apne address se naya family member link karein</p>
            </div>
            
            <form onSubmit={handleAddMember} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 pr-4 scrollbar-thin min-h-0">
                <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center relative shadow-sm">
                      {memberForm.avatar_url ? (
                        <img src={memberForm.avatar_url} alt="New Member" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-slate-300" />
                      )}
                      {uploadingNewMemberAvatar && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-bold animate-pulse">
                          ...
                        </div>
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark cursor-pointer scale-90 hover:scale-100 transition-all">
                      <Camera className="w-3.5 h-3.5" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleNewMemberAvatarUpload} disabled={uploadingNewMemberAvatar} />
                    </label>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Member Photo</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Click camera icon to upload a photo</p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name *</label>
                  <input
                    required
                    type="text"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                    placeholder="Enter full name"
                    value={memberForm.full_name}
                    onChange={(e) => setMemberForm({ ...memberForm, full_name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Relation *</label>
                    <select
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                      value={memberForm.relation}
                      onChange={(e) => setMemberForm({ ...memberForm, relation: e.target.value })}
                    >
                      <option value="Wife">Wife</option>
                      <option value="Husband">Husband</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Gender</label>
                    <select
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                      value={memberForm.gender}
                      onChange={(e) => setMemberForm({ ...memberForm, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                    value={memberForm.dob}
                    onChange={(e) => setMemberForm({ ...memberForm, dob: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mobile (Optional)</label>
                    <input
                      type="text"
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                      placeholder="Enter mobile number"
                      value={memberForm.mobile}
                      onChange={(e) => setMemberForm({ ...memberForm, mobile: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email (Optional)</label>
                    <input
                      type="email"
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                      placeholder="Enter email address"
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50/50">
                <Button type="button" variant="outline" className="w-1/2 py-5 rounded-xl text-sm font-bold border-slate-200" onClick={() => setShowAddMemberModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addingMember} className="w-1/2 py-5 rounded-xl text-sm font-bold bg-primary hover:bg-primary-dark text-white shadow-lg">
                  {addingMember ? "Adding..." : "Add Member"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
      {/* View / Edit Family Member Details Modal */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-md relative shadow-2xl border-0 bg-white max-h-[90vh] flex flex-col overflow-hidden rounded-2xl">
            <button onClick={() => { setViewingMember(null); setIsEditingMember(false); }} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 pb-4 border-b border-slate-100 shrink-0 pr-12">
              <h2 className="text-xl font-black text-slate-900 font-sans">
                {isEditingMember ? "Edit Family Member" : "Family Member Details"}
              </h2>
              <p className="text-sm font-medium text-slate-500 font-sans">
                {isEditingMember ? "Panchayat records me details update karein" : "Linked household member profile details"}
              </p>
            </div>
            
            <form onSubmit={handleUpdateMember} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 pr-4 scrollbar-thin min-h-0">
                {isEditingMember ? (
                  // EDIT MODE FORM
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="relative group shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center relative shadow-sm">
                          {memberEditForm.avatar_url || viewingMember.avatar_url ? (
                            <img src={memberEditForm.avatar_url || viewingMember.avatar_url} alt={memberEditForm.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                              {memberEditForm.full_name?.charAt(0)}
                            </div>
                          )}
                          {uploadingMemberAvatar && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-bold animate-pulse">
                              ...
                            </div>
                          )}
                        </div>
                        <label className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark cursor-pointer scale-90 hover:scale-100 transition-all">
                          <Camera className="w-3.5 h-3.5" />
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMemberAvatarUpload(e, memberEditForm.id)} disabled={uploadingMemberAvatar} />
                        </label>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">Profile Image</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Click camera icon to upload a photo</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name *</label>
                      <input
                        required
                        type="text"
                        className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                        value={memberEditForm.full_name}
                        onChange={(e) => setMemberEditForm({ ...memberEditForm, full_name: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Relation *</label>
                        <select
                          className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                          value={memberEditForm.relation}
                          onChange={(e) => setMemberEditForm({ ...memberEditForm, relation: e.target.value })}
                        >
                          <option value="Wife">Wife</option>
                          <option value="Husband">Husband</option>
                          <option value="Son">Son</option>
                          <option value="Daughter">Daughter</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Brother">Brother</option>
                          <option value="Sister">Sister</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Gender</label>
                        <select
                          className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                          value={memberEditForm.gender}
                          onChange={(e) => setMemberEditForm({ ...memberEditForm, gender: e.target.value })}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Date of Birth</label>
                      <input
                        type="date"
                        className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                        value={memberEditForm.dob}
                        onChange={(e) => setMemberEditForm({ ...memberEditForm, dob: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mobile (Optional)</label>
                        <input
                          type="text"
                          className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                          value={memberEditForm.mobile}
                          onChange={(e) => setMemberEditForm({ ...memberEditForm, mobile: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email (Optional)</label>
                        <input
                          type="email"
                          className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                          value={memberEditForm.email}
                          onChange={(e) => setMemberEditForm({ ...memberEditForm, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // VIEW MODE DETAILS
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                      <div className="relative group shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center relative shadow-sm">
                          {viewingMember.avatar_url ? (
                            <img src={viewingMember.avatar_url} alt={viewingMember.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                              {viewingMember.name?.charAt(0)}
                            </div>
                          )}
                          {uploadingMemberAvatar && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-bold animate-pulse">
                              ...
                            </div>
                          )}
                        </div>
                        {viewingMember.relation !== "Family Head" && (
                          <label className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark cursor-pointer scale-90 hover:scale-100 transition-all">
                            <Camera className="w-3.5 h-3.5" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMemberAvatarUpload(e, viewingMember.id)} disabled={uploadingMemberAvatar} />
                          </label>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900">{viewingMember.name}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{viewingMember.relation}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Gender</span>
                        <span className="text-sm font-bold text-slate-800 mt-1 block capitalize">{viewingMember.gender}</span>
                      </div>
                      <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Age</span>
                        <span className="text-sm font-bold text-slate-800 mt-1 block">{viewingMember.age} Years</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Date of Birth</span>
                      <span className="text-sm font-bold text-slate-800 mt-1 block">
                        {viewingMember.dob ? new Date(viewingMember.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "Not Set"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Mobile</span>
                        <span className="text-xs font-bold text-slate-800 mt-1 block">{viewingMember.mobile || "Not Linked"}</span>
                      </div>
                      <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Email</span>
                        <span className="text-xs font-bold text-slate-800 mt-1 block break-all">{viewingMember.email || "Not Linked"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50/50">
                {isEditingMember ? (
                  <>
                    <Button type="button" variant="outline" className="w-1/2 py-5 rounded-xl text-sm font-bold border-slate-200" onClick={() => setIsEditingMember(false)}>
                      Back to View
                    </Button>
                    <Button type="submit" disabled={updatingMember} className="w-1/2 py-5 rounded-xl text-sm font-bold bg-primary hover:bg-primary-dark text-white shadow-lg">
                      {updatingMember ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="outline" className="w-1/2 py-5 rounded-xl text-sm font-bold border-slate-200" onClick={() => setViewingMember(null)}>
                      Close
                    </Button>
                    {viewingMember.relation !== "Family Head" && (
                      <Button 
                        type="button" 
                        className="w-1/2 py-5 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsEditingMember(true);
                        }}
                      >
                        Edit Details
                      </Button>
                    )}
                  </>
                )}
              </div>
            </form>
          </Card>
        </div>
      )}
      {/* Document Upload Details Modal */}
      {showDocUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-md relative shadow-2xl border-0 bg-white rounded-2xl">
            <button onClick={() => { setShowDocUploadModal(false); setTempFile(null); }} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900 font-sans">Document Details</h2>
              <p className="text-sm font-medium text-slate-500 font-sans">Apne document ka naam aur type nirdharit karein</p>
            </div>
            
            <form onSubmit={handleConfirmUpload} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Document Name *</label>
                <input
                  required
                  type="text"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                  value={docUploadForm.name}
                  onChange={(e) => setDocUploadForm({ ...docUploadForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Document Type *</label>
                <select
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                  value={docUploadForm.type}
                  onChange={(e) => setDocUploadForm({ ...docUploadForm, type: e.target.value })}
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Ration Identity">Ration Identity</option>
                  <option value="Property Tax Receipt">Property Tax Receipt</option>
                  <option value="PDF">PDF Document</option>
                  <option value="Image">Image File</option>
                  <option value="Other Certificate">Other Certificate</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="w-1/2 py-5 rounded-xl text-sm font-bold border-slate-200" onClick={() => { setShowDocUploadModal(false); setTempFile(null); }}>
                  Cancel
                </Button>
                <Button type="submit" className="w-1/2 py-5 rounded-xl text-sm font-bold bg-primary hover:bg-primary-dark text-white shadow-lg">
                  Confirm & Upload
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm relative shadow-2xl border-0 bg-white overflow-hidden rounded-[2rem] p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500 border border-rose-100">
               <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Document Hatayein?</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
              Kya aap sach mein <span className="font-bold text-slate-800">"{deleteTarget.name}"</span> ko apne Digital Vault se hatana chahte hain?
            </p>
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="w-1/2 py-4 rounded-xl text-xs font-bold border-slate-200" 
                onClick={() => setDeleteTarget(null)}
              >
                Nahi, Cancel
              </Button>
              <Button 
                type="button" 
                className="w-1/2 py-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/10" 
                onClick={async () => {
                  const updatedDocs = vaultDocuments.filter((_, index) => index !== deleteTarget.index);
                  setVaultDocuments(updatedDocs);
                  const token = localStorage.getItem("accessToken");
                  localStorage.setItem(`vault_docs_${user.id}`, JSON.stringify(updatedDocs));
                  try {
                    await api.post("/citizen/vault-documents", { documents: updatedDocs }, token);
                  } catch (err) {
                    console.error("Failed to save vault documents to backend", err);
                  }
                  showToast("Document deleted successfully.");
                  setDeleteTarget(null);
                }}
              >
                Haan, Hatayein
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
