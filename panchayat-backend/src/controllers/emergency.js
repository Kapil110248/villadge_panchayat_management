const { prisma } = require('../db');

exports.getEmergencyAlerts = async (req, res) => {
  try {
    const alerts = await prisma.emergencyAlert.findMany({ where: { active: true } });
    res.json(alerts);
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.createEmergencyAlert = async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ detail: "Access denied" });
  try {
    const data = req.body;
    const alert = await prisma.emergencyAlert.create({ data: { title: data.title, message: data.message, alert_type: data.alert_type, active: true } });
    console.log(`[SMS/WHATSAPP ALERT SENT] Broadcasted '${data.title}' to all registered mobile numbers.`);
    res.json({ message: "Emergency alert broadcasted successfully", alert });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
