const { prisma } = require('../db');

exports.getRation = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedules = await prisma.rationSchedule.findMany({
      where: {
        distribution_date: {
          gte: today
        }
      },
      orderBy: { distribution_date: 'asc' }
    });

    let quota = {
      family_size: 1,
      card_type: "APL",
      card_number: "RC-DEFAULT",
      wheat: 10,
      rice: 5,
      sugar: 1
    };

    if (req.user) {
      const profile = await prisma.citizenProfile.findUnique({
        where: { user_id: req.user.id }
      });
      
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      let familyMembersCount = 1;
      let familyId = user ? user.family_member_id : null;

      if (!familyId && user) {
        const famAsHead = await prisma.family.findFirst({
          where: { head_id: user.id },
          include: { members: true }
        });
        if (famAsHead) {
          familyMembersCount = 1 + (famAsHead.members ? famAsHead.members.length : 0);
        }
      } else if (familyId) {
        const famAsMember = await prisma.family.findUnique({
          where: { id: familyId },
          include: { members: true }
        });
        if (famAsMember) {
          familyMembersCount = 1 + (famAsMember.members ? famAsMember.members.length : 0);
        }
      }

      const cardType = (profile && profile.ration_card_type) ? profile.ration_card_type : "APL";
      const cardNumber = (profile && profile.ration_card_number) ? profile.ration_card_number : `RC-${100000 + req.user.id}`;

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
    await prisma.rationSchedule.delete({ where: { id: req.params.id } });
    res.json({ message: "Ration schedule deleted successfully" });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
