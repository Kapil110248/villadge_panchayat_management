const { prisma } = require('../db');

exports.getAssets = async (req, res) => {
  try {
    const assets = await prisma.villageAsset.findMany();
    res.json(assets);
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.createAsset = async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ detail: "Access denied" });
  try {
    const data = req.body;
    const asset = await prisma.villageAsset.create({ data: { name: data.name, asset_type: data.asset_type, location: data.location, condition: data.condition, image_url: data.image_url } });
    res.json({ message: "Village asset added successfully", asset });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.deleteAsset = async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ detail: "Access denied" });
  try {
    await prisma.villageAsset.delete({ where: { id: req.params.id } });
    res.json({ message: "Asset deleted successfully" });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
