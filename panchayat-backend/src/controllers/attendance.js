const { prisma } = require('../db');

exports.getStaffAttendance = async (req, res) => {
  try {
    const staff = await prisma.employee.findMany({ include: { attendance: true, leave_requests: true } });
    res.json(staff);
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.markAttendance = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const data = req.body;
    const now = new Date();
    const start_of_day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end_of_day = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const existing = await prisma.attendance.findFirst({ where: { employee_id: data.employee_id, date: { gte: start_of_day, lte: end_of_day } } });
    let att;
    if (existing) { att = await prisma.attendance.update({ where: { id: existing.id }, data: { status: data.status, check_in: data.check_in, check_out: data.check_out, date: start_of_day } }); }
    else { att = await prisma.attendance.create({ data: { employee_id: data.employee_id, date: start_of_day, status: data.status, check_in: data.check_in, check_out: data.check_out } }); }
    res.json({ message: "Attendance registered", attendance: att });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.requestLeave = async (req, res) => {
  try {
    const data = req.body;
    const reqLeave = await prisma.leaveRequest.create({ data: { employee_id: data.employee_id, start_date: new Date(data.start_date), end_date: new Date(data.end_date), reason: data.reason, status: "pending" } });
    const employee = await prisma.employee.findFirst({ where: { id: data.employee_id } });
    const emp_name = employee ? employee.name : "Staff Member";
    await prisma.adminNotification.create({ data: { title: "New Leave Request", message: `${emp_name} requested leave from ${new Date(data.start_date).toLocaleDateString()} to ${new Date(data.end_date).toLocaleDateString()}.`, type: "leave", action_url: "/admin/attendance", sender_id: req.user.id } });
    res.json({ message: "Leave request submitted", request: reqLeave });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
