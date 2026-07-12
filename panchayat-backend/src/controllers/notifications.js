const { prisma } = require('../db');

exports.getNotifications = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const notifications = await prisma.adminNotification.findMany({ 
      where: { sender_id: { not: req.user.id } },
      orderBy: { created_at: 'desc' }, 
      take: 20,
      include: {
        user: {
          select: {
            full_name: true,
            avatar_url: true,
            mobile: true
          }
        }
      }
    });
    const mappedNotifications = notifications.map(notif => {
      const { user, ...rest } = notif;
      return { ...rest, sender: user };
    });
    const unread_count = await prisma.adminNotification.count({ where: { is_read: false, sender_id: { not: req.user.id } } });
    res.json({ notifications: mappedNotifications, unread_count });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.readNotification = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    await prisma.adminNotification.delete({ where: { id: req.params.id } });
    res.json({ message: "Notification deleted successfully" });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.readAllNotifications = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    await prisma.adminNotification.deleteMany({ where: { sender_id: { not: req.user.id } } });
    res.json({ message: "All notifications deleted successfully" });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

