const { prisma } = require('../db');

exports.getClerkDashboardStats = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const total_citizens = await prisma.user.count({ where: { role: "citizen" } });
    const pending_review = await prisma.certificate.count({ where: { status: "pending" } });
    const processed = await prisma.certificate.count({ where: { status: "approved" } });
    const grievances = await prisma.complaint.count({ where: { status: "open" } });
    const pending_certs = await prisma.certificate.findMany({ where: { status: "pending" }, include: { citizen: true }, orderBy: { submitted_at: 'desc' }, take: 3 });
    const open_comps = await prisma.complaint.findMany({ where: { status: "open" }, include: { citizen: true }, orderBy: { submitted_at: 'desc' }, take: 3 });
    let action_required = [];
    for (const cert of pending_certs) { action_required.push({ name: cert.citizen ? cert.citizen.full_name : "Citizen", type: `${cert.certificate_type.charAt(0).toUpperCase() + cert.certificate_type.slice(1)} Cert.`, urgency: "High", color: "text-rose-600", date: cert.submitted_at }); }
    for (const comp of open_comps) { action_required.push({ name: comp.citizen ? comp.citizen.full_name : "Citizen", type: "Complaint Update", urgency: "Med", color: "text-amber-600", date: comp.submitted_at }); }
    action_required.sort((a, b) => new Date(b.date) - new Date(a.date));
    action_required = action_required.slice(0, 5);
    res.json({ stats: { total_citizens, pending_review, processed, grievances }, action_required });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

// Get clerk profile (own profile)
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { employee: true }
    });
    if (!user) return res.status(404).json({ detail: "User not found" });
    res.json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      mobile: user.mobile || "",
      designation: user.employee ? user.employee.designation : "clerk",
      employee_id: `CLK-${user.id.toString().padStart(4, '0')}`,
      created_at: user.created_at,
      avatar_url: user.avatar_url || null,
      date_of_birth: user.date_of_birth || null,
      address: user.address || "",
      bio: user.bio || "",
    });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

// Upload avatar image
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ detail: "No file uploaded" });
    
    const cloudinary = require('cloudinary').v2;
    const fs = require('fs');
    cloudinary.config({ 
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
      api_key: process.env.CLOUDINARY_API_KEY, 
      api_secret: process.env.CLOUDINARY_API_SECRET 
    });

    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'panchayat_avatars',
        resource_type: 'auto'
    });
    
    fs.unlinkSync(req.file.path);

    const avatarUrl = result.secure_url;
    await prisma.user.update({ where: { id: req.user.id }, data: { avatar_url: avatarUrl } });
    res.json({ message: "Avatar uploaded successfully", avatar_url: avatarUrl });
  } catch (error) {
    console.error("Clerk avatar upload error:", error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

// Update clerk profile - cannot change designation (set by admin)
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, mobile, email, address, bio, date_of_birth, current_password, new_password } = req.body;
    const { verifyPassword, getPasswordHash } = require('../utils/security');

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ detail: "User not found" });

    const updateData = {};
    if (full_name && full_name.trim()) updateData.full_name = full_name.trim();
    if (mobile !== undefined) updateData.mobile = mobile.trim();
    if (address !== undefined) updateData.address = address;
    if (bio !== undefined) updateData.bio = bio;
    if (date_of_birth) updateData.date_of_birth = new Date(date_of_birth);

    if (email && email.trim() && email.trim() !== user.email) {
      const emailExists = await prisma.user.findFirst({ where: { email: email.trim(), id: { not: req.user.id } } });
      if (emailExists) return res.status(400).json({ detail: "Email already in use by another account" });
      updateData.email = email.trim();
    }

    if (new_password && new_password.trim()) {
      if (!current_password) return res.status(400).json({ detail: "Current password required to set new password" });
      const pwdMatch = verifyPassword(current_password, user.password_hash);
      if (!pwdMatch) return res.status(401).json({ detail: "Current password is incorrect" });
      if (new_password.length < 6) return res.status(400).json({ detail: "New password must be at least 6 characters" });
      updateData.password_hash = getPasswordHash(new_password);
    }

    await prisma.user.update({ where: { id: req.user.id }, data: updateData });
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};
