"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Users, Search, UserPlus, Filter, MoreVertical, Edit2, Trash2, Eye, X, Download } from "lucide-react";
import { api } from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CitizenManagement() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [citizenToDelete, setCitizenToDelete] = useState(null);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWardFilter, setSelectedWardFilter] = useState("All");

  const filteredCitizens = citizens.filter(citizen => {
    const matchesSearch = citizen.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          citizen.phone?.includes(searchQuery) ||
                          citizen.ward?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWard = selectedWardFilter === "All" || citizen.ward === selectedWardFilter;
    return matchesSearch && matchesWard;
  });

  const exportToPDF = () => {
    try {
      const doc = new jsPDF("landscape");
      doc.text("Citizen Management Report", 14, 15);
      
      const tableColumn = ["Name", "Ward", "Contact", "Email", "Gender", "DOB", "Aadhaar", "Address", "Status"];
      const tableRows = [];

      filteredCitizens.forEach(citizen => {
        const citizenData = [
          citizen.name || "N/A",
          citizen.ward || "N/A",
          citizen.phone || "N/A",
          citizen.email || "N/A",
          citizen.gender || "N/A",
          citizen.dob || "N/A",
          citizen.aadhaar || "N/A",
          citizen.address || "N/A",
          citizen.status || "N/A",
        ];
        tableRows.push(citizenData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });
      
      doc.save("citizens_report.pdf");
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("Failed to export PDF. Please try restarting the development server.");
    }
  };
  
  const [formData, setFormData] = useState({
    full_name: "",
    mobile: "",
    email: "",
    password: "",
    gender: "Male",
    ward: "Ward 01",
    status: "Active",
    avatar_url: "",
    aadhaar_number: "",
    dob: "",
    address: ""
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchCitizens = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if(!token) return;
      const res = await api.get("/citizens", token);
      if(res && res.citizens) {
        setCitizens(res.citizens);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, []);

  const handleOpenModal = (citizen = null) => {
    if (citizen) {
      setIsEdit(true);
      setCurrentId(citizen.id);
      setFormData({
        full_name: citizen.name,
        mobile: citizen.phone,
        email: citizen.email,
        password: "", // Leave blank for edit unless they want to change
        gender: citizen.gender,
        ward: citizen.ward,
        status: citizen.status,
        avatar_url: citizen.avatar || "",
        aadhaar_number: citizen.aadhaar && citizen.aadhaar !== "Not Linked" ? citizen.aadhaar : "",
        dob: citizen.dob && citizen.dob !== "N/A" ? citizen.dob.split(' ').reverse().join('-') : "", // Assuming "dd Mmm yyyy" format, wait, let's just use raw date from backend or fallback. Actually we will use text or standard input.
        address: citizen.address && citizen.address !== "Not updated" ? citizen.address : ""
      });
    } else {
      setIsEdit(false);
      setCurrentId(null);
      setFormData({ full_name: "", mobile: "", email: "", password: "", gender: "Male", ward: "Ward 01", status: "Active", avatar_url: "", aadhaar_number: "", dob: "", address: "" });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const timestamp = Math.round((new Date()).getTime() / 1000);
      const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
      const signatureString = `timestamp=${timestamp}${apiSecret}`;
      
      // Generate SHA-1 signature
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureString);
      const hashBuffer = await crypto.subtle.digest("SHA-1", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      formDataUpload.append("timestamp", timestamp);
      formDataUpload.append("signature", signature);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formDataUpload
      });
      const result = await res.json();
      if (result.secure_url) {
        setFormData(prev => ({ ...prev, avatar_url: result.secure_url }));
      }
    } catch(err) {
      alert("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if(!token) return;
    
    try {
      if (isEdit) {
        await api.put(`/citizens/${currentId}`, formData, token);
      } else {
        await api.post("/citizens", formData, token);
      }
      setIsModalOpen(false);
      fetchCitizens();
    } catch(err) {
      alert("Failed to save citizen details");
    }
  };

  const handleDeleteClick = (id) => {
    setCitizenToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleViewProfile = (citizen) => {
    setSelectedProfile(citizen);
    setViewProfileOpen(true);
  };

  const confirmDelete = async () => {
    if (!citizenToDelete) return;
    const token = localStorage.getItem("accessToken");
    try {
      await api.delete(`/citizens/${citizenToDelete}`, token);
      setDeleteConfirmOpen(false);
      setCitizenToDelete(null);
      fetchCitizens();
    } catch(err) {
      alert("Failed to delete citizen");
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Citizen Management</h1>
          <p className="text-slate-500">Gaav ke sabhi logo ka record yahan manage karein</p>
        </div>
        <Button onClick={() => handleOpenModal()}><UserPlus className="w-4 h-4 mr-2" /> Naya Citizen Jodein</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 py-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-10" placeholder="Search by name, phone or ward..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative flex items-center">
              <select className="px-4 py-2 border border-slate-200 rounded-full text-sm outline-none focus:border-primary/50 appearance-none bg-white font-medium hover:bg-slate-50 transition-colors cursor-pointer" value={selectedWardFilter} onChange={e => setSelectedWardFilter(e.target.value)}>
                 <option value="All">All Wards</option>
                 <option value="Ward 01">Ward 01</option>
                 <option value="Ward 02">Ward 02</option>
                 <option value="Sarahi">Sarahi</option>
              </select>
            </div>
            <Button variant="outline" size="sm" onClick={exportToPDF} className="flex items-center gap-2 rounded-full px-4">
              <Download className="w-4 h-4" /> Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-border">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Ward</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan="5" className="p-6 text-center text-slate-500 font-bold animate-pulse">Loading citizens...</td></tr>
                ) : filteredCitizens.length === 0 ? (
                  <tr><td colSpan="5" className="p-6 text-center text-slate-500 font-bold">No citizens found</td></tr>
                ) : filteredCitizens.map((citizen) => (
                  <tr key={citizen.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold overflow-hidden border border-primary/20">
                           {citizen.avatar ? (
                             <img src={citizen.avatar} alt="Profile" className="w-full h-full object-cover" />
                           ) : (
                             citizen.name ? citizen.name.charAt(0).toUpperCase() : "U"
                           )}
                         </div>
                         <div className="font-semibold text-slate-900">{citizen.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{citizen.ward}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{citizen.phone}</div>
                      <div className="text-[10px] text-slate-400">{citizen.gender}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        citizen.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {citizen.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-flex justify-end items-center h-8 w-24">
                        {/* Three-dot icon — hidden on hover via opacity */}
                        <MoreVertical className="w-4 h-4 text-slate-400 group-hover:opacity-0 transition-opacity absolute right-0" />
                        {/* Action buttons — visible only on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0">
                          <button onClick={() => handleViewProfile(citizen)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleOpenModal(citizen)} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteClick(citizen.id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-border flex items-center justify-between text-sm">
            <p className="text-slate-500 text-xs">Showing {filteredCitizens.length} citizens</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4 shrink-0">
              <h2 className="text-xl font-bold">{isEdit ? "Edit Citizen" : "Add New Citizen"}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </CardHeader>
            <CardContent className="pt-6 overflow-y-auto flex-1">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500">Full Name</label>
                  <Input required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="e.g. Ramesh Sharma" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Mobile</label>
                    <Input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="10 digits" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Gender</label>
                    <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
                  <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="ramesh@gram.in" />
                </div>
                {!isEdit && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Temporary Password</label>
                    <Input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="******" />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Ward / Village</label>
                    <select className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 bg-white" required value={formData.ward} onChange={(e) => setFormData({...formData, ward: e.target.value})}>
                      <option value="Ward 01">Ward 01</option>
                      <option value="Ward 02">Ward 02</option>
                      <option value="Sarahi">Sarahi</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Status</label>
                    <select className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 bg-white" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Aadhaar Number</label>
                    <Input type="text" placeholder="1234 5678 9012" value={formData.aadhaar_number} onChange={(e) => setFormData({...formData, aadhaar_number: e.target.value})} />
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Date of Birth</label>
                    <Input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Full Address</label>
                    <Input type="text" placeholder="House No, Street, Village" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>
                {!isEdit && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Profile Image (Optional)</label>
                    <div className="flex items-center gap-3">
                      {formData.avatar_url && (
                        <img src={formData.avatar_url} alt="Preview" className="w-10 h-10 rounded-full object-cover border" />
                      )}
                      <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                    </div>
                    {uploadingImage && <p className="text-xs text-blue-500">Uploading...</p>}
                  </div>
                )}
                <Button type="submit" className="w-full mt-4" disabled={uploadingImage}>{isEdit ? "Update Citizen" : "Add Citizen"}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modern Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border-none">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Are you sure?</h2>
              <p className="text-sm text-slate-500 font-medium mt-2">
                Kya aap sach me is citizen ko hatana chahte hain? Yeh action wapas nahi liya jaa sakta.
              </p>
            </CardHeader>
            <CardContent className="pt-4 flex gap-3">
              <Button variant="outline" className="flex-1 font-bold" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-rose-600 hover:bg-rose-700 font-bold text-white border-none" onClick={confirmDelete}>
                Yes, Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modern View Profile Modal */}
      {viewProfileOpen && selectedProfile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border-none overflow-hidden">
            <div className="bg-primary p-6 text-white text-center relative">
              <button onClick={() => setViewProfileOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-5 h-5"/></button>
              <div className="mx-auto w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-black mb-3 backdrop-blur-md border-4 border-white shadow-xl overflow-hidden">
                {selectedProfile.avatar ? (
                  <img src={selectedProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  selectedProfile.name ? selectedProfile.name.charAt(0).toUpperCase() : "U"
                )}
              </div>
              <h2 className="text-2xl font-black">{selectedProfile.name}</h2>
              <p className="text-sm text-primary-foreground/80 font-medium">{selectedProfile.ward} • {selectedProfile.status}</p>
            </div>
            
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aadhaar Number</p>
                  <p className="font-bold text-slate-800">{selectedProfile.aadhaar}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date of Birth</p>
                  <p className="font-bold text-slate-800">{selectedProfile.dob}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Number</p>
                  <p className="font-bold text-slate-800">{selectedProfile.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</p>
                  <p className="font-bold text-slate-800">{selectedProfile.gender}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Address</p>
                  <p className="font-bold text-slate-800">{selectedProfile.address}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email ID</p>
                  <p className="font-bold text-slate-800">{selectedProfile.email}</p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex gap-3">
                 <Button variant="outline" className="flex-1 font-bold" onClick={() => { setViewProfileOpen(false); handleOpenModal(selectedProfile); }}>
                   Edit Details
                 </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
