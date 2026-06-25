const { prisma } = require('../db');

exports.getRation = async (req, res) => {
  try {
    const schedules = await prisma.rationSchedule.findMany();
    res.json(schedules);
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.createRation = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const data = req.body;
    const schedule = await prisma.rationSchedule.create({ data: { distribution_date: new Date(data.distribution_date), timing_description: data.timing_description, items_available: data.items_available, shop_name: data.shop_name, card_type: data.card_type, ward_area: data.ward_area, special_instructions: data.special_instructions } });
    res.json({ message: "Ration schedule added successfully", schedule });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.deleteRation = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    await prisma.rationSchedule.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Ration schedule deleted successfully" });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
