const { prisma } = require('../db');
const { getPasswordHash, verifyPassword, createAccessToken } = require('../utils/security');

exports.register = async (req, res) => {
  try {
    const data = req.body;

    // Check if already registered
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({ detail: "Email already registered" });
    }

    // Check if already has a pending request
    const existingReq = await prisma.registrationRequest.findFirst({
      where: {
        OR: [
          { email: data.email },
          { aadhaar_number: data.aadhaar_number }
        ]
      }
    });
    if (existingReq) {
      return res.status(400).json({ detail: "Registration request already exists" });
    }

    // Hash password
    const hashedPwd = getPasswordHash(data.password);
    
    // Create Request
    const dobDate = new Date(data.date_of_birth);

    const reqRecord = await prisma.registrationRequest.create({
      data: {
        full_name: data.full_name,
        date_of_birth: dobDate,
        gender: data.gender,
        aadhaar_number: data.aadhaar_number,
        email: data.email,
        mobile: data.mobile,
        address: data.address,
        village: data.village,
        pincode: data.pincode,
        password_hash: hashedPwd,
        father_name: data.father_name || null,
        status: 'pending'
      }
    });

    await prisma.adminNotification.create({
      data: {
        title: "New Registration Request",
        message: `${data.full_name} has applied for citizen registration.`,
        type: "user_action",
        action_url: "/admin/registration-requests"
      }
    });

    return res.json({ 
      message: "Registration request submitted successfully. Please wait for admin approval.", 
      request_id: reqRecord.id 
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const data = req.body;
    console.log(`[LOGIN DEBUG] Received: email=${data.email}, role=${data.role}, password_len=${data.password ? data.password.length : 0}`);

    if (data.role === "citizen") {
      // 1. Check if ACTIVE user exists
      const user = await prisma.user.findUnique({ where: { email: data.email } });
      console.log(`[LOGIN DEBUG] Citizen user found: ${!!user}`);
      
      if (!user) {
        // 2. Check if Approved Request exists but user entry missing or Pending
        const request = await prisma.registrationRequest.findFirst({ where: { email: data.email } });
        if (request) {
          if (request.status === "pending") {
            return res.status(401).json({ detail: "Account pending approval" });
          } else if (request.status === "rejected") {
            return res.status(401).json({ detail: "Registration rejected" });
          }
        }
        return res.status(401).json({ detail: "Invalid credentials" });
      }

      const pwdMatch = verifyPassword(data.password, user.password_hash);
      console.log(`[LOGIN DEBUG] Password match: ${pwdMatch}`);
      if (!pwdMatch) {
        return res.status(401).json({ detail: "Invalid credentials" });
      }
      
      const token = createAccessToken({ sub: user.email, role: "citizen", id: user.id });
      return res.json({
        access_token: token,
        token_type: "bearer",
        role: "citizen",
        user: { name: user.full_name, id: user.id, avatar_url: user.avatar_url }
      });
    } else {
      // Admin / Clerk Login
      const user = await prisma.user.findUnique({ where: { email: data.email } });
      console.log(`[LOGIN DEBUG] Admin/Clerk user found: ${!!user}`);
      if (user) {
        console.log(`[LOGIN DEBUG] User role in DB: '${user.role}', requested role: '${data.role}'`);
      }

      if (!user || user.role !== data.role) {
        console.log(`[LOGIN DEBUG] REJECTED: user not found or role mismatch`);
        return res.status(401).json({ detail: "Invalid credentials or incorrect role selected" });
      }

      if (!user.is_active) {
        return res.status(403).json({ detail: "Account has been suspended by the administrator." });
      }

      const pwdMatch = verifyPassword(data.password, user.password_hash);
      console.log(`[LOGIN DEBUG] Password match: ${pwdMatch}`);
      if (!pwdMatch) {
        return res.status(401).json({ detail: "Invalid credentials" });
      }
      
      const token = createAccessToken({ sub: user.email, role: user.role, id: user.id });
      return res.json({
        access_token: token,
        token_type: "bearer",
        role: user.role,
        user: { name: user.full_name, id: user.id, avatar_url: user.avatar_url }
      });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ detail: "Internal Server Error" });
  }
};
