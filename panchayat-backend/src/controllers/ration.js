const { prisma } = require('../db');

exports.getRation = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let whereClause = {};
    if (req.user && req.user.role === 'citizen') {
      whereClause = { distribution_date: { gte: today } };
    }

    const schedules = await prisma.rationSchedule.findMany({
      where: whereClause,
      orderBy: { distribution_date: 'asc' }
    });

    let quota = {
      family_size: 1,
      card_type: "APL",
      card_number: "RC-DEFAULT",
      wheat: 5,
      rice: 2.5,
      sugar: 1
    };

    if (req.user) {
      const profile = await prisma.citizenProfile.findUnique({
        where: { user_id: req.user.id }
      });
      const familyMembersCount = 1; // Family model not available, default to 1
      const cardType = (profile && profile.ration_card_type) ? profile.ration_card_type : "APL";
      const cardNumber = (profile && profile.ration_card_number) ? profile.ration_card_number : `RC-${String(req.user.id).slice(-6)}`;

      let wheatPerMember = 5;
      let ricePerMember = 2.5;
      let sugarPerHousehold = 1;

      if (cardType === "BPL") {
        wheatPerMember = 10;
        ricePerMember = 5;
        sugarPerHousehold = 2;
      } else if (cardType === "AAY") {
        wheatPerMember = 15;
        ricePerMember = 8;
        sugarPerHousehold = 3;
      }

      quota = {
        family_size: familyMembersCount,
        card_type: cardType,
        card_number: cardNumber,
        wheat: wheatPerMember * familyMembersCount,
        rice: ricePerMember * familyMembersCount,
        sugar: sugarPerHousehold
      };
    }

    res.json({ schedules, quota });
  } catch (error) { 
    console.error("Error in getRation:", error);
    res.status(500).json({ detail: "Internal Server Error" }); 
  }
};

exports.createRation = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const data = req.body;
    const schedule = await prisma.rationSchedule.create({ data: { distribution_date: new Date(data.distribution_date), timing_description: data.timing_description, items_available: data.items_available, shop_name: data.shop_name, contact_number: data.contact_number, card_type: data.card_type, ward_area: data.ward_area, special_instructions: data.special_instructions } });

    // Send notifications to all citizens
    const citizens = await prisma.user.findMany({ where: { role: "citizen" } });
    if (citizens.length > 0) {
      const notificationsData = citizens.map(c => ({
        citizen_id: c.id,
        title: "New Ration Schedule",
        message: `Ration distribution scheduled for ${new Date(data.distribution_date).toLocaleDateString('en-IN')} at ${data.shop_name || 'Designated Shop'}.`,
        type: "ration",
        action_url: "/citizen/ration"
      }));
      await prisma.citizenNotification.createMany({ data: notificationsData });
    }

    res.json({ message: "Ration schedule added successfully", schedule });
  } catch (error) { 
    console.error("Error in createRation:", error);
    res.status(500).json({ detail: "Internal Server Error" }); 
  }
};

exports.deleteRation = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const id = req.params.id;
    await prisma.rationSchedule.delete({ where: { id } });
    res.json({ message: "Schedule deleted successfully" });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.updateRation = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const id = req.params.id;
    const data = req.body;
    const schedule = await prisma.rationSchedule.update({ 
      where: { id },
      data: { 
        distribution_date: new Date(data.distribution_date), 
        timing_description: data.timing_description, 
        items_available: data.items_available, 
        shop_name: data.shop_name, 
        contact_number: data.contact_number, 
        card_type: data.card_type, 
        ward_area: data.ward_area, 
        special_instructions: data.special_instructions 
      } 
    });
    res.json({ message: "Schedule updated successfully", schedule });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
