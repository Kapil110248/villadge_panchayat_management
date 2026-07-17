const { prisma } = require('../db');
const fs = require('fs');
const path = require('path');

exports.getDashboardStats = async (req, res) => {
  try {
    const citizenId = req.user.id;

    // Fetch user's village
    const profile = await prisma.citizenProfile.findUnique({
      where: { user_id: citizenId },
      select: { village: true }
    });
    const villageName = profile?.village || "Sarahi";

    // Certificates
    const allCertificates = await prisma.certificate.findMany({
      where: { citizen_id: citizenId },
      orderBy: { submitted_at: 'desc' },
      take: 5
    });

    const certCounts = await prisma.certificate.groupBy({
      by: ['status'],
      where: { citizen_id: citizenId },
      _count: true
    });
    
    // Complaints
    const allComplaints = await prisma.complaint.findMany({
      where: { citizen_id: citizenId },
      orderBy: { submitted_at: 'desc' },
      take: 5
    });

    const compCounts = await prisma.complaint.groupBy({
      by: ['status'],
      where: { citizen_id: citizenId },
      _count: true
    });

    let applied = 0, active = 0, approved = 0, pending = 0;
    
    // Process Certificate Counts
    certCounts.forEach(c => {
      applied += c._count;
      if (c.status === 'approved') approved += c._count;
      if (c.status === 'pending') pending += c._count;
    });

    // Process Complaint Counts
    compCounts.forEach(c => {
      applied += c._count;
      if (c.status === 'open' || c.status === 'in_progress') active += c._count;
      if (c.status === 'resolved') approved += c._count;
      if (c.status === 'open') pending += c._count;
    });

    // Format recent activities (combine and sort)
    const recentActivitiesRaw = [
      ...allCertificates.map(cert => ({
        title: `${cert.certificate_type} Certificate`,
        dateObj: cert.submitted_at,
        time: cert.submitted_at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: cert.status.charAt(0).toUpperCase() + cert.status.slice(1),
        type: "Certificate"
      })),
      ...allComplaints.map(comp => ({
        title: comp.title || comp.category || "Complaint",
        dateObj: comp.submitted_at,
        time: comp.submitted_at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: comp.status.charAt(0).toUpperCase() + comp.status.slice(1),
        type: "Complaint"
      }))
    ];
    
    // Sort combined activities by date descending and take top 5
    const recentActivities = recentActivitiesRaw
      .sort((a, b) => b.dateObj - a.dateObj)
      .slice(0, 5)
      .map(({ dateObj, ...rest }) => rest);

    // Fetch latest notice
    const latestNotice = await prisma.notice.findFirst({
      where: { is_published: true },
      orderBy: { created_at: 'desc' }
    });

    // Village Stats Calculation
    const totalCitizens = await prisma.user.count({ where: { role: 'citizen' } });
    const citizensWithProfile = await prisma.citizenProfile.count({
      where: { aadhaar_number: { not: { startsWith: 'PENDING' } } }
    });
    
    // Scheme Utilization (Proxy: Citizens who have used the system for certificates/complaints)
    const uniqueCitizensUsingCerts = await prisma.certificate.groupBy({
      by: ['citizen_id']
    });
    const uniqueCitizensUsingComplaints = await prisma.complaint.groupBy({
      by: ['citizen_id']
    });
    
    const activeUsers = new Set([
      ...uniqueCitizensUsingCerts.map(c => c.citizen_id),
      ...uniqueCitizensUsingComplaints.map(c => c.citizen_id)
    ]).size;

    const digitization = totalCitizens > 0 ? Math.round((citizensWithProfile / totalCitizens) * 100) : 0;
    const utilization = totalCitizens > 0 ? Math.round((activeUsers / totalCitizens) * 100) : 0;

    res.json({
      stats: {
        applied: applied,
        active: active,
        approved: approved,
        pending: pending
      },
      villageName,
      recentActivities,
      latestNotice,
      villageStats: {
        digitization: Math.min(digitization, 100),
        utilization: Math.min(utilization, 100)
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.createComplaint = async (req, res) => {
  try {
    const { category, ward, summary, description, photo_url } = req.body;
    
    const complaint_number = `COMP-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;

    const complaint = await prisma.complaint.create({
      data: {
        complaint_number,
        citizen_id: req.user.id,
        complaint_type: category || 'other',
        subject: summary || 'No Subject',
        description: description || '',
        location: ward || 'Unknown',
        image_url: photo_url || null,
        status: 'open',
        priority: 'normal'
      }
    });

    await prisma.adminNotification.create({
      data: {
        title: "New Citizen Complaint",
        message: `${summary} (Ward: ${ward})`,
        type: "complaint",
        action_url: "/admin/complaints",
        sender_id: req.user.id
      }
    });

    res.json({ message: "Complaint submitted successfully", complaint_number });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: { citizen_id: req.user.id },
      orderBy: { submitted_at: 'desc' }
    });
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.citizenNotification.findMany({
      where: { citizen_id: req.user.id },
      orderBy: { created_at: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const id = req.params.id;
    await prisma.citizenNotification.delete({
      where: { id }
    });
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await prisma.citizenNotification.deleteMany({
      where: { citizen_id: req.user.id }
    });
    res.json({ message: "All notifications deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.confirmComplaintResolution = async (req, res) => {
  try {
    const id = req.params.id;
    await prisma.complaint.update({
      where: { id },
      data: { 
        status: "resolved",
        citizen_confirmed: true,
        resolved_at: new Date()
      }
    });
    res.json({ message: "Complaint marked as finally resolved by citizen." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.getSchemes = async (req, res) => {
  try {
    const schemes = await prisma.scheme.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' }
    });
    res.json({ schemes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.applyScheme = async (req, res) => {
  try {
    const { scheme_id, form_data } = req.body;
    
    // Check if already applied
    const existing = await prisma.schemeApplication.findFirst({
      where: { scheme_id, citizen_id: req.user.id }
    });
    
    if (existing) {
      return res.status(400).json({ detail: "You have already applied for this scheme." });
    }
    
    // Get scheme name for notification
    const scheme = await prisma.scheme.findUnique({ where: { id: scheme_id } });
    
    await prisma.schemeApplication.create({
      data: {
        scheme_id,
        citizen_id: req.user.id,
        status: "Pending",
        form_data: form_data ? JSON.stringify(form_data) : null
      }
    });
    
    // Send notification to admin
    await prisma.adminNotification.create({
      data: {
        title: "New Scheme Application",
        message: `${req.user.full_name} ne "${scheme?.scheme_name || 'Unknown Scheme'}" ke liye apply kiya hai.`,
        type: "scheme_application",
        sender_id: req.user.id,
        action_url: "/admin/schemes"
      }
    });
    
    res.json({ message: "Application submitted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await prisma.schemeApplication.findMany({
      where: { citizen_id: req.user.id },
      include: { scheme: true },
      orderBy: { submitted_at: 'desc' }
    });
    const formattedApplications = applications.map(app => ({
      ...app,
      form_data: (typeof app.form_data === 'string' && app.form_data.trim() !== '') ? JSON.parse(app.form_data) : app.form_data
    }));
    res.json({ applications: formattedApplications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.approveSchemeApplication = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if it belongs to this citizen
    const app = await prisma.schemeApplication.findFirst({
      where: { id, citizen_id: req.user.id },
      include: { scheme: true }
    });
    
    if (!app) {
      return res.status(404).json({ detail: "Application not found." });
    }
    
    const updated = await prisma.schemeApplication.update({
      where: { id },
      data: { status: "Approved" }
    });

    // Notify admin
    await prisma.adminNotification.create({
      data: {
        title: "Scheme Completed / Confirmed",
        message: `${req.user.full_name} ne "${app.scheme.scheme_name}" ka work completion confirm kar diya hai.`,
        type: "scheme_completion",
        sender_id: req.user.id,
        action_url: "/admin/schemes"
      }
    });

    res.json({ message: "Application marked as Approved/Completed.", application: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

const { getPasswordHash } = require('../utils/security');

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        citizenprofile: true,
        family_user_family_member_idTofamily: {
          include: {
            user_family_head_idTouser: { include: { citizenprofile: true } },
            user_user_family_member_idTofamily: { include: { citizenprofile: true } }
          }
        },
        family_family_head_idTouser: {
          include: {
            user_user_family_member_idTofamily: { include: { citizenprofile: true } }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    let members = [];
    if (user.family_family_head_idTouser) {
      members = user.family_family_head_idTouser.user_user_family_member_idTofamily.map(m => ({
        id: m.id,
        name: m.full_name,
        email: m.email,
        mobile: m.mobile || "",
        dob: m.date_of_birth ? new Date(m.date_of_birth).toISOString().split('T')[0] : "",
        gender: (m.citizenprofile && m.citizenprofile.gender) || "male",
        relation: m.bio || "Family Member",
        age: m.date_of_birth ? new Date().getFullYear() - new Date(m.date_of_birth).getFullYear() : "N/A",
        avatar_url: m.avatar_url || (m.citizenprofile && m.citizenprofile.avatar_url) || null
      }));
    } else if (user.family_user_family_member_idTofamily) {
      const head = user.family_user_family_member_idTofamily.user_family_head_idTouser;
      members = [
        {
          id: head.id,
          name: head.full_name,
          email: head.email,
          mobile: head.mobile || "",
          dob: head.date_of_birth ? new Date(head.date_of_birth).toISOString().split('T')[0] : "",
          gender: (head.citizenprofile && head.citizenprofile.gender) || "male",
          relation: "Family Head",
          age: head.date_of_birth ? new Date().getFullYear() - new Date(head.date_of_birth).getFullYear() : "N/A",
          avatar_url: head.avatar_url || (head.citizenprofile && head.citizenprofile.avatar_url) || null
        },
        ...user.family_user_family_member_idTofamily.user_user_family_member_idTofamily.filter(m => m.id !== user.id).map(m => ({
          id: m.id,
          name: m.full_name,
          email: m.email,
          mobile: m.mobile || "",
          dob: m.date_of_birth ? new Date(m.date_of_birth).toISOString().split('T')[0] : "",
          gender: (m.citizenprofile && m.citizenprofile.gender) || "male",
          relation: m.bio || "Family Member",
          age: m.date_of_birth ? new Date().getFullYear() - new Date(m.date_of_birth).getFullYear() : "N/A",
          avatar_url: m.avatar_url || (m.citizenprofile && m.citizenprofile.avatar_url) || null
        }))
      ];
    }

    res.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        mobile: user.mobile,
        avatar_url: user.avatar_url || (user.citizenprofile && user.citizenprofile.avatar_url) || null,
        date_of_birth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : null,
        created_at: user.created_at,
        bio: user.bio,
        is_active: user.is_active,
        address: user.address || (user.citizenprofile && user.citizenprofile.address) || null
      },
      profile: user.citizenprofile ? {
        aadhaar_number: user.citizenprofile.aadhaar_number,
        village: user.citizenprofile.village || "Sarahi",
        pincode: user.citizenprofile.pincode,
        gender: user.citizenprofile.gender,
        father_name: user.citizenprofile.father_name || ""
      } : {
        aadhaar_number: "Not Linked",
        village: "Sarahi",
        pincode: "",
        gender: "",
        father_name: ""
      },
      members
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      email,
      mobile,
      password,
      dob,
      gender,
      address,
      village,
      pincode,
      avatar_url,
      aadhaar_number,
      bio,
      father_name
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { citizenprofile: true }
    });

    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    const userUpdateData = {};
    if (full_name !== undefined) userUpdateData.full_name = full_name;
    if (email !== undefined) {
      const existingUser = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } }
      });
      if (existingUser) {
        return res.status(400).json({ detail: "Email is already taken by another account" });
      }
      userUpdateData.email = email;
    }
    if (mobile !== undefined) userUpdateData.mobile = mobile;
    if (avatar_url !== undefined) userUpdateData.avatar_url = avatar_url;
    if (address !== undefined) userUpdateData.address = address;
    if (dob !== undefined) userUpdateData.date_of_birth = dob ? new Date(dob) : null;
    if (bio !== undefined) userUpdateData.bio = bio;
    if (password) userUpdateData.password_hash = getPasswordHash(password);

    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData
    });

    const profileData = {};
    if (gender !== undefined) profileData.gender = gender.toLowerCase();
    if (village !== undefined) profileData.village = village;
    if (pincode !== undefined) profileData.pincode = pincode;
    if (avatar_url !== undefined) profileData.avatar_url = avatar_url;
    if (address !== undefined) profileData.address = address;
    if (dob !== undefined) profileData.date_of_birth = dob ? new Date(dob) : null;
    if (father_name !== undefined) profileData.father_name = father_name;
    if (aadhaar_number !== undefined) {
      const existingProfile = await prisma.citizenProfile.findFirst({
        where: { aadhaar_number, NOT: { user_id: userId } }
      });
      if (existingProfile) {
        return res.status(400).json({ detail: "Aadhaar number is already registered by another account" });
      }
      profileData.aadhaar_number = aadhaar_number;
    }

    if (user.citizenprofile) {
      await prisma.citizenProfile.update({
        where: { id: user.citizenprofile.id },
        data: profileData
      });
    } else {
      const { v4: uuidv4 } = require('uuid');
      profileData.aadhaar_number = `PENDING-${uuidv4().substring(0, 8)}`;
      await prisma.citizenProfile.create({
        data: {
          ...profileData,
          user_id: userId
        }
      });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.addFamilyMember = async (req, res) => {
  try {
    const headId = req.user.id;
    const { full_name, email, mobile, dob, gender, relation, avatar_url } = req.body;

    if (!full_name) {
      return res.status(400).json({ detail: "Name is required" });
    }

    let family = await prisma.family.findUnique({
      where: { head_id: headId }
    });

    if (!family) {
      const headUser = await prisma.user.findUnique({
        where: { id: headId },
        include: { citizenprofile: true }
      });

      family = await prisma.family.create({
        data: {
          head_id: headId,
          ward_number: (headUser.citizenprofile && headUser.citizenprofile.village) || "Sarahi",
          address: headUser.address || (headUser.citizenprofile && headUser.citizenprofile.address) || "Sarahi Village"
        }
      });
    }

    let memberEmail = email;
    if (!memberEmail) {
      const sanitized = full_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      memberEmail = `${sanitized}-${Math.floor(1000 + Math.random() * 9000)}@family.sarahi.in`;
    } else {
      const existing = await prisma.user.findUnique({ where: { email: memberEmail } });
      if (existing) {
        return res.status(400).json({ detail: "User with this email is already registered." });
      }
    }

    const { v4: uuidv4 } = require('uuid');
    const tempPasswordHash = getPasswordHash("FamilyMember123!");

    const newMember = await prisma.user.create({
      data: {
        full_name,
        email: memberEmail,
        mobile: mobile || null,
        password_hash: tempPasswordHash,
        role: "citizen",
        is_active: true,
        date_of_birth: dob ? new Date(dob) : null,
        address: family.address,
        bio: relation || "Family Member",
        family_member_id: family.id,
        avatar_url: avatar_url || null,
        citizenprofile: {
          create: {
            aadhaar_number: `MEMBER-${uuidv4().substring(0, 8)}`,
            gender: gender ? gender.toLowerCase() : "male",
            village: family.ward_number,
            address: family.address,
            date_of_birth: dob ? new Date(dob) : null,
            avatar_url: avatar_url || null
          }
        }
      }
    });

    res.json({ message: "Family member added successfully", id: newMember.id });
  } catch (error) {
    console.error("Add Family Member Error:", error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.updateFamilyMember = async (req, res) => {
  try {
    const headId = req.user.id;
    const memberId = req.params.id;
    const { full_name, email, mobile, dob, gender, relation, avatar_url } = req.body;

    const family = await prisma.family.findUnique({
      where: { head_id: headId }
    });

    if (!family) {
      return res.status(403).json({ detail: "You are not authorized to edit this family member" });
    }

    const member = await prisma.user.findFirst({
      where: { id: memberId, family_member_id: family.id },
      include: { citizenprofile: true }
    });

    if (!member) {
      return res.status(404).json({ detail: "Family member not found in your household" });
    }

    const userUpdateData = {};
    if (full_name !== undefined) userUpdateData.full_name = full_name;
    if (email !== undefined) {
      const existingUser = await prisma.user.findFirst({
        where: { email, NOT: { id: memberId } }
      });
      if (existingUser) {
        return res.status(400).json({ detail: "Email is already taken by another account" });
      }
      userUpdateData.email = email;
    }
    if (mobile !== undefined) userUpdateData.mobile = mobile;
    if (dob !== undefined) userUpdateData.date_of_birth = dob ? new Date(dob) : null;
    if (relation !== undefined) userUpdateData.bio = relation;
    if (avatar_url !== undefined) userUpdateData.avatar_url = avatar_url;

    await prisma.user.update({
      where: { id: memberId },
      data: userUpdateData
    });

    const profileUpdateData = {};
    if (gender !== undefined) profileUpdateData.gender = gender.toLowerCase();
    if (dob !== undefined) profileUpdateData.date_of_birth = dob ? new Date(dob) : null;
    if (avatar_url !== undefined) profileUpdateData.avatar_url = avatar_url;

    if (member.citizenprofile) {
      await prisma.citizenProfile.update({
        where: { id: member.citizenprofile.id },
        data: profileUpdateData
      });
    } else {
      const { v4: uuidv4 } = require('uuid');
      await prisma.citizenProfile.create({
        data: {
          user_id: memberId,
          aadhaar_number: `MEMBER-${uuidv4().substring(0, 8)}`,
          gender: gender ? gender.toLowerCase() : "male",
          village: family.ward_number,
          address: family.address,
          date_of_birth: dob ? new Date(dob) : null,
          avatar_url: avatar_url || null
        }
      });
    }

    res.json({ message: "Family member updated successfully" });
  } catch (error) {
    console.error("Update Family Member Error:", error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

const vaultDocsFilePath = path.join(__dirname, '../../vault_documents.json');

const readVaultDocs = () => {
  try {
    if (fs.existsSync(vaultDocsFilePath)) {
      return JSON.parse(fs.readFileSync(vaultDocsFilePath, 'utf8'));
    }
  } catch (error) {
    console.error("Error reading vault docs:", error);
  }
  return {};
};

const writeVaultDocs = (data) => {
  try {
    fs.writeFileSync(vaultDocsFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing vault docs:", error);
  }
};

exports.getVaultDocuments = async (req, res) => {
  try {
    const userId = req.params.userId;
    const allDocs = readVaultDocs();
    const userDocs = allDocs[userId] || [];
    res.json(userDocs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.saveVaultDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documents } = req.body;
    const allDocs = readVaultDocs();
    allDocs[userId] = documents || [];
    writeVaultDocs(allDocs);
    res.json({ message: "Vault documents saved successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};
