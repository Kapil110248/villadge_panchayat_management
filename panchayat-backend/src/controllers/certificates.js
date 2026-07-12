const { prisma } = require('../db');
const { v4: uuidv4 } = require('uuid');

exports.getCertificates = async (req, res) => {
  try {
    if (['admin', 'clerk'].includes(req.user.role)) {
      const certs = await prisma.certificate.findMany({ include: { user_certificate_citizen_idTouser: true }, orderBy: { submitted_at: 'desc' } });
      const mapped = certs.map(c => {
        const { user_certificate_citizen_idTouser, ...rest } = c;
        return { ...rest, citizen: user_certificate_citizen_idTouser };
      });
      res.json(mapped);
    } else {
      const certs = await prisma.certificate.findMany({ where: { citizen_id: req.user.id }, orderBy: { submitted_at: 'desc' } });
      res.json(certs);
    }
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.applyCertificate = async (req, res) => {
  try {
    const data = req.body;
    const app_num = `CERT-2026-${uuidv4().substring(0, 6).toUpperCase()}`;
    const cert = await prisma.certificate.create({ data: { application_number: app_num, citizen_id: req.user.id, certificate_type: data.certificate_type, data: data.data, purpose: data.purpose, status: "pending" } });
    await prisma.adminNotification.create({ data: { title: "New Certificate Request", message: `A new ${data.certificate_type} certificate request was submitted (App: ${app_num}).`, type: "certificate", action_url: "/admin/approvals", sender_id: req.user.id } });
    res.json({ message: "Certificate application submitted", certificate: cert });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.verifyCertificate = async (req, res) => {
  if (req.user.role !== "clerk") return res.status(403).json({ detail: "Only Clerk can verify documents" });
  try {
    const cert_id = req.params.cert_id;
    const remarks = req.body.remarks || req.query.remarks || "";
    const cert = await prisma.certificate.update({ where: { id: cert_id }, data: { processed_by_id: req.user.id, remarks: `Clerk Verified: ${remarks}`, processed_at: new Date() }, include: { citizen: true } });
    
    // Notify Admin
    await prisma.adminNotification.create({
      data: {
        title: "Certificate Verified by Clerk",
        message: `Clerk verified ${cert.certificate_type} certificate for ${cert.citizen?.full_name || 'Citizen'}. Remarks: ${remarks}`,
        type: "certificate",
        action_url: "/admin/approvals",
        sender_id: req.user.id
      }
    });

    res.json({ message: "Application verified and pushed to Admin", certificate: cert });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.approveCertificate = async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ detail: "Only Admin can sign and approve certificates" });
  try {
    const cert_id = req.params.cert_id;
    const remarks = req.body.remarks || req.query.remarks || "";
    const certificate_url = req.body.certificate_url; // Optional uploaded file
    const existing = await prisma.certificate.findUnique({ where: { id: cert_id } });
    if (!existing) return res.status(404).json({ detail: "Certificate not found" });
    const finalUrl = certificate_url || `https://sarahi-panchayat.mp.gov.in/certs/download/${existing.application_number}`;
    const cert = await prisma.certificate.update({ where: { id: cert_id }, data: { status: "approved", remarks: `Admin Approved and Signed: ${remarks}`, processed_at: new Date(), certificate_url: finalUrl } });
    res.json({ message: "Certificate approved and signed successfully", certificate: cert });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.issueCertificateDirectly = async (req, res) => {
  if (req.user.role !== "clerk") return res.status(403).json({ detail: "Only Clerk can issue certificates directly" });
  try {
    const cert_id = req.params.cert_id;
    const { remarks, certificate_url } = req.body;
    if (!certificate_url) return res.status(400).json({ detail: "Certificate document is required for direct issuance" });
    
    const existing = await prisma.certificate.findUnique({ where: { id: cert_id } });
    if (!existing) return res.status(404).json({ detail: "Certificate not found" });
    
    const cert = await prisma.certificate.update({ 
      where: { id: cert_id }, 
      data: { 
        status: "approved", 
        remarks: `Issued by Clerk: ${remarks || 'Approved'}`, 
        processed_at: new Date(), 
        certificate_url,
        processed_by_id: req.user.id
      } 
    });
    res.json({ message: "Certificate issued successfully", certificate: cert });
  } catch (error) { 
    console.error("Issue Error:", error);
    res.status(500).json({ detail: "Internal Server Error" }); 
  }
};

exports.rejectCertificate = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Only Admin or Clerk can reject certificates" });
  try {
    const cert_id = req.params.cert_id;
    const remarks = req.body.remarks || req.query.remarks || "";
    const existing = await prisma.certificate.findUnique({ where: { id: cert_id } });
    if (!existing) return res.status(404).json({ detail: "Certificate not found" });
    const prefix = req.user.role === 'admin' ? 'Admin Rejected' : 'Clerk Rejected';
    const cert = await prisma.certificate.update({ where: { id: cert_id }, data: { status: "rejected", remarks: `${prefix}: ${remarks}`, processed_at: new Date() } });
    res.json({ message: "Certificate rejected successfully", certificate: cert });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.verifyCertificatePublic = async (req, res) => {
  try {
    const cert = await prisma.certificate.findUnique({ where: { application_number: req.params.app_num }, include: { citizen: true, processor: true } });
    if (!cert) return res.status(404).json({ detail: "Certificate not found in records" });
    res.json({ verified: true, application_number: cert.application_number, citizen_name: cert.citizen.full_name, type: cert.certificate_type, issue_date: cert.processed_at, status: cert.status, remarks: cert.remarks });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.deleteCertificate = async (req, res) => {
  try {
    const cert_id = req.params.cert_id;
    const existing = await prisma.certificate.findUnique({ where: { id: cert_id } });
    
    if (!existing) return res.status(404).json({ detail: "Certificate not found" });
    if (existing.citizen_id !== req.user.id) return res.status(403).json({ detail: "Not authorized to delete this certificate" });
    if (existing.status !== 'pending') return res.status(400).json({ detail: "Only pending certificates can be deleted" });
    
    await prisma.certificate.delete({ where: { id: cert_id } });
    res.json({ message: "Certificate application deleted successfully" });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" }); 
  }
};
