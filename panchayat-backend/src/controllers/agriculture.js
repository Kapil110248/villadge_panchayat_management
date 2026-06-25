const { prisma } = require('../db');

exports.getAgriculture = async (req, res) => {
  try {
    let schemes = await prisma.agriScheme.findMany();
    let advisories = await prisma.seasonalAdvisory.findMany();
    if (schemes.length === 0) {
      await prisma.agriScheme.create({ data: { title: "PM Kisan Kalyan", description: "Financial support for crop sowing.", benefit: "₹2000 every quarter" } });
      await prisma.seasonalAdvisory.create({ data: { crop_name: "Paddy", advisory_message: "Sowing starts. Keep water levels at 2 inches.", month: "June" } });
      schemes = await prisma.agriScheme.findMany();
      advisories = await prisma.seasonalAdvisory.findMany();
    }
    res.json({ schemes, advisories });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
