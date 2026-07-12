const { prisma } = require('../db');

exports.getHealthCamps = async (req, res) => {
  try {
    const camps = await prisma.healthCamp.findMany({ 
      include: { 
        registrations: {
          include: {
            citizen: {
              select: {
                id: true,
                full_name: true,
                mobile: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(camps);
  } catch (error) { 
    console.error("Error in getHealthCamps:", error);
    res.status(500).json({ detail: "Internal Server Error" }); 
  }
};

exports.createHealthCamp = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const data = req.body;
    const camp = await prisma.healthCamp.create({ data: { camp_name: data.camp_name, camp_type: data.camp_type, date: new Date(data.date), location: data.location, description: data.description, timing: data.timing, organizing_team: data.organizing_team, target_audience: data.target_audience, required_docs: data.required_docs } });

    // Send notification to all citizens
    const citizens = await prisma.user.findMany({ where: { role: "citizen" } });
    if (citizens.length > 0) {
      const notificationsData = citizens.map(c => ({
        citizen_id: c.id,
        title: "New Health Camp Scheduled",
        message: `Health Camp: "${data.camp_name}" is scheduled on ${new Date(data.date).toLocaleDateString('en-IN')} at ${data.location}.`,
        type: "health_camp",
        action_url: "/citizen/health-camps"
      }));
      await prisma.citizenNotification.createMany({ data: notificationsData });
    }

    res.json({ message: "Health camp added successfully", camp });
  } catch (error) { 
    console.error("Error in createHealthCamp:", error);
    res.status(500).json({ detail: "Internal Server Error" }); 
  }
};

exports.deleteHealthCamp = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    await prisma.healthCamp.delete({ where: { id: req.params.id } });
    res.json({ message: "Health camp deleted successfully" });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.registerHealthCamp = async (req, res) => {
  try {
    const camp_id = parseInt(req.body.camp_id || req.query.camp_id);
    const reg = await prisma.campRegistration.create({ data: { camp_id, citizen_id: req.user.id } });

    // Send notifications to Admin/Clerk
    const citizen = await prisma.user.findUnique({ where: { id: req.user.id } });
    const camp = await prisma.healthCamp.findUnique({ where: { id: camp_id } });
    if (citizen && camp) {
      await prisma.adminNotification.create({
        data: {
          title: "New Camp Registration",
          message: `${citizen.full_name} has registered for Health Camp: "${camp.camp_name}".`,
          type: "health_camp",
          action_url: "/admin/health-camps"
        }
      });
    }

    res.json({ message: "Successfully registered for health camp!", registration: reg });
  } catch (error) { 
    console.error("Error in registerHealthCamp:", error);
    res.status(400).json({ detail: "Already registered for this camp" }); 
  }
};
