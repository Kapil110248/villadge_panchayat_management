const { prisma } = require('../db');

exports.getNotifications = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const notifications = await prisma.adminNotification.findMany({ 
      where: { sender_id: { not: req.user.id } },
      orderBy: { created_at: 'desc' }, 
      take: 20,
      include: {
        sender: {
          select: {
            full_name: true,
            avatar_url: true,
            mobile: true
          }
        }
      }
    });
    const unread_count = await prisma.adminNotification.count({ where: { is_read: false, sender_id: { not: req.user.id } } });
    res.json({ notifications, unread_count });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.readNotification = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    await prisma.adminNotification.update({ where: { id: parseInt(req.params.id) }, data: { is_read: true } });
    res.json({ message: "Notification marked as read" });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.readAllNotifications = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    await prisma.adminNotification.updateMany({ where: { is_read: false, sender_id: { not: req.user.id } }, data: { is_read: true } });
    res.json({ message: "All notifications marked as read" });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
