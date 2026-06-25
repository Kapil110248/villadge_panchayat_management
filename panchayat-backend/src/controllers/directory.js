const { prisma } = require('../db');

exports.getDirectory = async (req, res) => {
  try {
    if (['admin', 'clerk'].includes(req.user.role)) {
      const users = await prisma.user.findMany({ where: { role: "citizen" }, include: { profile: true, family: true, family_head: { include: { members: true } } } });
      return res.json(users);
    } else {
      const me = await prisma.user.findUnique({ where: { id: req.user.id }, include: { profile: true, family: { include: { members: true } }, family_head: { include: { members: true } } } });
      return res.json([me]);
    }
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
