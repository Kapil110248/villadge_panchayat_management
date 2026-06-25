const { prisma } = require('../db');
const { getPasswordHash } = require('../utils/security');

exports.getDashboard = async (req, res) => {
  try {
    const total_citizens = await prisma.user.count({ where: { role: 'citizen' } });
    const pending_approvals = await prisma.registrationRequest.count({ where: { status: 'pending' } });
    const open_complaints = await prisma.complaint.count({ where: { status: 'open' } });
    const total_certificates = await prisma.certificate.count();
    
    const resolved_complaints = await prisma.complaint.count({ where: { status: 'resolved' } });
    const total_complaints = await prisma.complaint.count();
    
    const active_schemes = await prisma.scheme.count({ where: { is_active: true } });
    const total_schemes = await prisma.scheme.count();
    
    const complaint_resolve_pct = total_complaints > 0 ? Math.round((resolved_complaints / total_complaints) * 100) : 0;
    const scheme_util_pct = total_schemes > 0 ? Math.round((active_schemes / total_schemes) * 100) : 0;
    
    const recent_registrations = await prisma.registrationRequest.findMany({
      orderBy: { submitted_at: 'desc' },
      take: 4
    });
    
    const recent_complaints = await prisma.complaint.findMany({
      orderBy: { submitted_at: 'desc' },
      take: 4
    });

    res.json({
      stats: { total_citizens, pending_approvals, open_complaints, total_certificates },
      health: { complaint_resolve_pct, scheme_util_pct },
      recent_registrations, recent_complaints
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.getRegistrationRequests = async (req, res) => {
  try {
    const requests = await prisma.registrationRequest.findMany({ orderBy: { submitted_at: 'desc' } });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.approveRegistrationRequest = async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const request = await prisma.registrationRequest.findUnique({ where: { id: requestId } });
    
    if (!request) return res.status(404).json({ detail: "Request not found" });
    if (request.status !== "pending") return res.status(400).json({ detail: "Request is already processed" });
    
    const existingUser = await prisma.user.findFirst({ where: { email: request.email } });
    if (existingUser) return res.status(400).json({ detail: "User with this email already exists" });
    
    const newUser = await prisma.user.create({
      data: {
        email: request.email, password_hash: request.password_hash, role: "citizen",
        full_name: request.full_name, mobile: request.mobile, is_active: true
      }
    });
    
    await prisma.citizenProfile.create({
      data: {
        user_id: newUser.id, aadhaar_number: request.aadhaar_number, date_of_birth: request.date_of_birth,
        gender: request.gender, address: request.address, village: request.village, pincode: request.pincode
      }
    });
    
    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: { status: "approved", reviewed_at: new Date(), reviewed_by_id: req.user.id }
    });
    
    res.json({ message: "Registration request approved successfully", user_id: newUser.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.rejectRegistrationRequest = async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const request = await prisma.registrationRequest.findUnique({ where: { id: requestId } });
    
    if (!request) return res.status(404).json({ detail: "Request not found" });
    if (request.status !== "pending") return res.status(400).json({ detail: "Request is already processed" });
    
    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: { status: "rejected", reviewed_at: new Date(), reviewed_by_id: req.user.id }
    });
    
    res.json({ message: "Registration request rejected successfully" });
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.getClerks = async (req, res) => {
  try {
    const clerks = await prisma.user.findMany({
      where: { role: "clerk" }, include: { employee: true, processed_certs: true }
    });
    const result = clerks.map(clerk => ({
      id: clerk.id, name: clerk.full_name, email: clerk.email, mobile: clerk.mobile,
      status: clerk.is_active ? "Active" : "Inactive", village: "Panchayat Office",
      tasksHandled: clerk.processed_certs ? clerk.processed_certs.length : 0
    }));
    res.json({ clerks: result });
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.createClerk = async (req, res) => {
  try {
    const data = req.body;
    const existing = await prisma.user.findFirst({ where: { email: data.email } });
    if (existing) return res.status(400).json({ detail: "Email already registered" });
    
    const newUser = await prisma.user.create({
      data: {
        full_name: data.full_name, email: data.email, mobile: data.mobile,
        password_hash: getPasswordHash(data.password), role: "clerk", is_active: true
      }
    });
    await prisma.employee.create({ data: { name: data.full_name, designation: "clerk", user_id: newUser.id } });
    await prisma.adminNotification.create({ data: { title: "New Staff Added", message: `${data.full_name} was added as a Clerk.`, type: "user_action", action_url: "/admin/clerks" } });
    res.json({ message: "Clerk added successfully", clerk_id: newUser.id });
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      include: { citizen: true }, orderBy: { submitted_at: 'desc' }
    });
    const result = complaints.map(c => {
      const statusStr = c.status;
      return {
        id: c.id, ref_id: c.complaint_number, citizen: c.citizen ? c.citizen.full_name : "Unknown",
        citizen_mobile: c.citizen ? c.citizen.mobile : "N/A",
        category: c.complaint_type, date: c.submitted_at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: statusStr === "in_progress" ? "In Progress" : statusStr === "resolution_proposed" ? "Resolution Proposed" : statusStr.charAt(0).toUpperCase() + statusStr.slice(1),
        urgent: c.priority.toLowerCase() === "high", description: c.description, image_url: c.image_url,
        admin_reply: c.admin_reply, resolution_image_url: c.resolution_image_url
      };
    });
    res.json({ complaints: result });
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let statusVal = req.body.status.toLowerCase().replace(" ", "_");
    
    // If the admin is proposing resolution, save the image and message and change status
    if (statusVal === "resolution_proposed") {
      const { message, image_url } = req.body;
      const complaint = await prisma.complaint.update({ 
        where: { id }, 
        data: { 
          status: statusVal,
          admin_reply: message,
          resolution_image_url: image_url
        } 
      });
      
      // Notify the citizen
      await prisma.citizenNotification.create({
        data: {
          citizen_id: complaint.citizen_id,
          title: "Complaint Resolution Proposed",
          message: `Your complaint (${complaint.complaint_number}) has been marked as resolved by the admin. Please review the details and confirm.`,
          type: "complaint_update",
          action_url: "/citizen/complaints/status"
        }
      });
      
      return res.json({ message: "Resolution proposed and citizen notified." });
    }
    
    // Default status update
    const complaint = await prisma.complaint.update({ where: { id }, data: { status: statusVal } });
    
    // Notify the citizen of general status update
    await prisma.citizenNotification.create({
      data: {
        citizen_id: complaint.citizen_id,
        title: "Complaint Status Updated",
        message: `Your complaint (${complaint.complaint_number}) status has been updated to ${req.body.status}.`,
        type: "complaint_update",
        action_url: "/citizen/complaints/status"
      }
    });

    res.json({ message: "Status updated and citizen notified." });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.sendComplaintMessage = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { message } = req.body;
    
    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) return res.status(404).json({ detail: "Complaint not found" });

    await prisma.citizenNotification.create({
      data: {
        citizen_id: complaint.citizen_id,
        title: `Message from Admin regarding Complaint ${complaint.complaint_number}`,
        message: message,
        type: "message",
        action_url: "/citizen/complaints/status"
      }
    });

    await prisma.complaint.update({
      where: { id },
      data: { admin_reply: message }
    });

    res.json({ message: "Message sent to citizen." });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.getNotices = async (req, res) => {
  try {
    const notices = await prisma.notice.findMany({ include: { creator: true }, orderBy: { created_at: 'desc' } });
    const result = notices.map(n => ({
      id: n.id, title: n.title, content: n.content, notice_type: n.notice_type, is_published: n.is_published,
      created_at: n.created_at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      expiry_date: n.expiry_date ? n.expiry_date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
      created_by: n.creator ? n.creator.full_name : "Unknown"
    }));
    res.json({ notices: result });
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.createNotice = async (req, res) => {
  try {
    const data = req.body;
    const notice = await prisma.notice.create({
      data: { title: data.title, content: data.content, notice_type: data.notice_type || "update", is_published: true, created_by_id: req.user.id }
    });
    await prisma.adminNotification.create({ data: { title: "New Notice Broadcast", message: `Notice: ${data.title}`, type: "broadcast", action_url: "/admin/notices" } });
    res.json({ message: "Notice created successfully", notice_id: notice.id });
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    await prisma.notice.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.updateNotice = async (req, res) => {
  try {
    const data = req.body;
    await prisma.notice.update({
      where: { id: parseInt(req.params.id) },
      data: { title: data.title, content: data.content, notice_type: data.notice_type }
    });
    res.json({ message: "Notice updated successfully" });
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.getSchemes = async (req, res) => {
  try {
    const schemes = await prisma.scheme.findMany({ orderBy: { created_at: 'desc' } });
    const result = schemes.map(s => ({
      id: s.id, name: s.scheme_name, description: s.description, is_active: s.is_active,
      created_at: s.created_at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: s.is_active ? "Active" : "Paused",
      form_fields: s.form_fields,
      benefit: s.benefit,
      category: s.category,
      icon: s.icon,
      color_theme: s.color_theme
    }));
    res.json({ schemes: result });
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.createScheme = async (req, res) => {
  try {
    const data = req.body;
    const scheme = await prisma.scheme.create({
      data: { 
        scheme_name: data.scheme_name, 
        description: data.description, 
        is_active: true, 
        created_by_id: req.user.id,
        benefit: data.benefit || null,
        category: data.category || "General",
        icon: data.icon || "BookOpen",
        color_theme: data.color_theme || "bg-blue-50 text-blue-700",
        form_fields: data.form_fields || null
      }
    });
    await prisma.adminNotification.create({ data: { title: "New Scheme Launched", message: `Scheme: ${data.scheme_name}`, type: "scheme", action_url: "/admin/schemes" } });
    res.json({ message: "Scheme added successfully", scheme_id: scheme.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.deleteScheme = async (req, res) => {
  try {
    await prisma.scheme.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Scheme deleted" });
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.updateScheme = async (req, res) => {
  try {
    const data = req.body;
    await prisma.scheme.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        scheme_name: data.scheme_name, 
        description: data.description,
        benefit: data.benefit || null,
        category: data.category || undefined,
        icon: data.icon || undefined,
        color_theme: data.color_theme || undefined,
        form_fields: data.form_fields || null
      }
    });
    res.json({ message: "Scheme updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.toggleScheme = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const scheme = await prisma.scheme.findUnique({ where: { id } });
    if (!scheme) return res.status(404).json({ detail: "Scheme not found" });
    const updated = await prisma.scheme.update({ where: { id }, data: { is_active: !scheme.is_active } });
    res.json({ message: "Scheme status toggled", is_active: updated.is_active });
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.getReportStats = async (req, res) => {
  try {
    const total_citizens = await prisma.user.count({ where: { role: "citizen" } });
    const total_complaints = await prisma.complaint.count();
    const resolved_complaints = await prisma.complaint.count({ where: { status: "resolved" } });
    const total_certificates = await prisma.certificate.count();
    const approved_certificates = await prisma.certificate.count({ where: { status: "approved" } });
    const total_schemes = await prisma.scheme.count();
    const active_schemes = await prisma.scheme.count({ where: { is_active: true } });
    const total_notices = await prisma.notice.count();
    const open_complaints = await prisma.complaint.count({ where: { status: "open" } });
    
    const completion_rate = total_complaints > 0 ? Number(((resolved_complaints / total_complaints) * 100).toFixed(1)) : 0;
    const cert_approval_rate = total_certificates > 0 ? Number(((approved_certificates / total_certificates) * 100).toFixed(1)) : 0;
    
    res.json({ total_citizens, total_complaints, resolved_complaints, open_complaints, total_certificates, approved_certificates, total_schemes, active_schemes, total_notices, completion_rate, cert_approval_rate });
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.getGramSabha = async (req, res) => {
  try {
    const meetings = await prisma.gramSabhaMeeting.findMany({ include: { suggestions: { include: { citizen: true } } }, orderBy: { date_time: 'desc' } });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.createGramSabha = async (req, res) => {
  try {
    const data = req.body;
    let dt = new Date(data.date_time);
    if (isNaN(dt)) dt = new Date();
    const newMeeting = await prisma.gramSabhaMeeting.create({ data: { date_time: dt, location: data.location, agenda: data.agenda, status: "scheduled" } });
    await prisma.adminNotification.create({ data: { title: "Gram Sabha Scheduled", message: `Meeting on ${dt.toLocaleDateString()}`, type: "meeting", action_url: "/admin/gram-sabha" } });
    res.json(newMeeting);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.updateGramSabhaMinutes = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const minutes_url = req.body.minutes_url || "";
    const meeting = await prisma.gramSabhaMeeting.findUnique({ where: { id } });
    if (!meeting) return res.status(404).json({ detail: "Meeting not found" });
    const updated = await prisma.gramSabhaMeeting.update({ where: { id }, data: { status: "completed", minutes_url } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.getSchemeApplications = async (req, res) => {
  try {
    const applications = await prisma.schemeApplication.findMany({
      include: {
        scheme: { select: { scheme_name: true } },
        citizen: { select: { full_name: true, mobile: true, email: true } }
      },
      orderBy: { submitted_at: 'desc' }
    });
    
    const formatted = applications.map(app => ({
      id: app.id,
      scheme_name: app.scheme.scheme_name,
      scheme_id: app.scheme_id,
      citizen_name: app.citizen.full_name,
      citizen_mobile: app.citizen.mobile || 'N/A',
      citizen_email: app.citizen.email,
      status: app.status,
      submitted_at: app.submitted_at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      form_data: app.form_data,
      admin_remarks: app.admin_remarks,
      result_file: app.result_file
    }));
    
    res.json({ applications: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.approveSchemeApplication = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.schemeApplication.update({
      where: { id },
      data: { status: "Approved" }
    });
    res.json({ message: "Application approved." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.rejectSchemeApplication = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { rejection_reason } = req.body;
    
    const app = await prisma.schemeApplication.update({
      where: { id },
      data: { 
        status: "Rejected",
        admin_remarks: rejection_reason || null
      },
      include: { scheme: true }
    });

    // Send notification to citizen
    await prisma.citizenNotification.create({
      data: {
        citizen_id: app.citizen_id,
        title: "Scheme Application Rejected",
        message: `Aapki scheme "${app.scheme.scheme_name}" ki application reject ho gayi hai. Reason: ${rejection_reason || 'N/A'}.`,
        type: "scheme_update",
        action_url: "/citizen/schemes"
      }
    });

    res.json({ message: "Application rejected.", application: app });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.readySchemeApplication = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { admin_remarks, result_file } = req.body;
    
    const app = await prisma.schemeApplication.update({
      where: { id },
      data: { 
        status: "Ready",
        admin_remarks: admin_remarks || null,
        result_file: result_file || null
      },
      include: { scheme: true }
    });

    // Send notification to citizen
    await prisma.citizenNotification.create({
      data: {
        citizen_id: app.citizen_id,
        title: "Scheme Application Processed",
        message: `Admin ne aapki scheme "${app.scheme.scheme_name}" ke application par action le liya hai. Kripya check karke final approve karein.`,
        type: "scheme_update",
        action_url: "/citizen/schemes"
      }
    });

    res.json({ message: "Sent to citizen for verification.", application: app });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.progressSchemeApplication = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const app = await prisma.schemeApplication.update({
      where: { id },
      data: { status: "In Progress" },
      include: { scheme: true }
    });

    // Notify citizen
    await prisma.citizenNotification.create({
      data: {
        citizen_id: app.citizen_id,
        title: "Scheme Work Started",
        message: `Panchayat office ne aapki scheme "${app.scheme.scheme_name}" par kaam shuru kar diya hai.`,
        type: "scheme_update",
        action_url: "/citizen/schemes"
      }
    });

    res.json({ message: "Application status updated to In Progress.", application: app });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};
