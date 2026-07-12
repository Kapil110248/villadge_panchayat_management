const { prisma } = require('../db');
const { v4: uuidv4 } = require('uuid');

exports.getCitizens = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const citizens = await prisma.user.findMany({ where: { role: "citizen" }, include: { profile: true }, orderBy: { created_at: 'desc' } });
    const result = citizens.map(c => {
      const profile = c.profile;
      return { id: c.id, name: c.full_name, email: c.email, phone: c.mobile, status: c.is_active ? "Active" : "Inactive", ward: profile && profile.village ? profile.village : "Ward 01", gender: profile && profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : "Unknown", aadhaar: profile && profile.aadhaar_number ? profile.aadhaar_number : "Not Linked", dob: profile && profile.date_of_birth ? profile.date_of_birth.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A", address: profile && profile.address ? profile.address : "Not updated", avatar: profile && profile.avatar_url ? profile.avatar_url : null, father_name: profile && profile.father_name ? profile.father_name : "N/A", created_at: c.created_at ? c.created_at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Unknown" };
    });
    res.json({ citizens: result });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.createCitizen = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const data = req.body;
    const existing = await prisma.user.findFirst({ where: { email: data.email } });
    if (existing) return res.status(400).json({ detail: "User with this email already exists" });
    const newUser = await prisma.user.create({ data: { email: data.email, password_hash: data.password, role: "citizen", full_name: data.full_name, mobile: data.mobile, is_active: data.status === "Active", profile: { create: { gender: data.gender.toLowerCase(), village: data.ward, aadhaar_number: data.aadhaar_number || `PENDING-${uuidv4().substring(0, 8)}`, avatar_url: data.avatar_url, address: data.address, date_of_birth: data.dob ? new Date(data.dob) : null, father_name: data.father_name } } } });
    res.json({ message: "Citizen created successfully", id: newUser.id });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.updateCitizen = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const id = req.params.id;
    const data = req.body;
    const user = await prisma.user.findUnique({ where: { id }, include: { profile: true } });
    if (!user) return res.status(404).json({ detail: "Citizen not found" });
    let update_data = {};
    if (data.full_name !== undefined) update_data.full_name = data.full_name;
    if (data.mobile !== undefined) update_data.mobile = data.mobile;
    if (data.email !== undefined) update_data.email = data.email;
    if (data.status !== undefined) update_data.is_active = (data.status === "Active");
    if (Object.keys(update_data).length > 0) { await prisma.user.update({ where: { id }, data: update_data }); }
    let profile_data = {};
    if (data.gender) profile_data.gender = data.gender.toLowerCase();
    if (data.ward) profile_data.village = data.ward;
    if (data.aadhaar_number) profile_data.aadhaar_number = data.aadhaar_number;
    if (data.address) profile_data.address = data.address;
    if (data.dob) profile_data.date_of_birth = new Date(data.dob);
    if (data.father_name !== undefined) profile_data.father_name = data.father_name;
    if (Object.keys(profile_data).length > 0) {
      if (user.profile) { await prisma.citizenProfile.update({ where: { id: user.profile.id }, data: profile_data }); } else { if (!profile_data.aadhaar_number) profile_data.aadhaar_number = `PENDING-${uuidv4().substring(0, 8)}`; await prisma.citizenProfile.create({ data: { ...profile_data, user_id: id } }); }
    }
    res.json({ message: "Citizen updated successfully" });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.deleteCitizen = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const id = req.params.id;
    const user = await prisma.user.findUnique({ where: { id }, include: { profile: true } });
    if (user && user.profile) { await prisma.citizenProfile.delete({ where: { id: user.profile.id } }); }
    await prisma.user.delete({ where: { id } });
    res.json({ message: "Citizen deleted successfully" });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
