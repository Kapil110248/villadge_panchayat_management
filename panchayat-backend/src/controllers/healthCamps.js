const { prisma } = require('../db');

exports.getHealthCamps = async (req, res) => {
  try {
    const camps = await prisma.healthCamp.findMany({ include: { registrations: true } });
    res.json(camps);
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.createHealthCamp = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const data = req.body;
    const camp = await prisma.healthCamp.create({ data: { camp_name: data.camp_name, camp_type: data.camp_type, date: new Date(data.date), location: data.location, description: data.description, timing: data.timing, organizing_team: data.organizing_team, target_audience: data.target_audience, required_docs: data.required_docs } });
    res.json({ message: "Health camp added successfully", camp });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.deleteHealthCamp = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    await prisma.healthCamp.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Health camp deleted successfully" });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.registerHealthCamp = async (req, res) => {
  try {
    const camp_id = parseInt(req.body.camp_id || req.query.camp_id);
    const reg = await prisma.campRegistration.create({ data: { camp_id, citizen_id: req.user.id } });
    res.json({ message: "Successfully registered for health camp!", registration: reg });
  } catch (error) { res.status(400).json({ detail: "Already registered for this camp" }); }
};
