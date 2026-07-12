const { prisma } = require('../db');

exports.getWaterSupply = async (req, res) => {
  try {
    let schedules = await prisma.waterSupplySchedule.findMany();
    if (schedules.length === 0) {
      await prisma.waterSupplySchedule.create({ data: { area: "Ward 01, Ward 02", timing: "06:00 AM - 07:30 AM", status: "active" } });
      await prisma.waterSupplySchedule.create({ data: { area: "Ward 03, Ward 04", timing: "07:30 AM - 09:00 AM", status: "active" } });
      await prisma.waterSupplySchedule.create({ data: { area: "Ward 05", timing: "05:00 PM - 06:30 PM", status: "interrupted", notes: "Pipeline repair near community center" } });
      schedules = await prisma.waterSupplySchedule.findMany();
    }
    res.json(schedules);
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.createWaterSupply = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const data = req.body;
    const sched = await prisma.waterSupplySchedule.create({ data: { area: data.area, timing: data.timing, status: data.status || "active", notes: data.notes } });
    res.json({ message: "Water schedule created successfully", schedule: sched });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.updateWaterSupply = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const data = req.body;
    const sched = await prisma.waterSupplySchedule.update({ where: { id: req.params.schedule_id }, data: { area: data.area, timing: data.timing, status: data.status, notes: data.notes } });
    res.json({ message: "Water schedule updated successfully", schedule: sched });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.deleteWaterSupply = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    await prisma.waterSupplySchedule.delete({ where: { id: req.params.schedule_id } });
    res.json({ message: "Water schedule deleted successfully" });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.getWaterTanks = async (req, res) => {
  try {
    let tanks = await prisma.waterTank.findMany();
    if (tanks.length === 0) {
      await prisma.waterTank.create({ data: { location: "North Corner Ground", capacity: 15000.0, condition: "Good" } });
      await prisma.waterTank.create({ data: { location: "School Campus", capacity: 10000.0, condition: "Good" } });
      tanks = await prisma.waterTank.findMany();
    }
    res.json(tanks);
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.createWaterTank = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const data = req.body;
    const tank = await prisma.waterTank.create({ data: { location: data.location, capacity: data.capacity, condition: data.condition || "Good" } });
    res.json({ message: "Water tank added successfully", tank });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.deleteWaterTank = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    await prisma.waterTank.delete({ where: { id: req.params.tank_id } });
    res.json({ message: "Water tank deleted successfully" });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
