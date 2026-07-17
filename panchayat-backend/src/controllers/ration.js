const { prisma } = require('../db');

// Helper to get default configs
const getDefaultConfigs = () => ([
  { card_type: 'APL', wheat: 5, rice: 2.5, sugar: 1 },
  { card_type: 'BPL', wheat: 10, rice: 5, sugar: 2 },
  { card_type: 'AAY', wheat: 15, rice: 8, sugar: 3 },
]);

exports.getRationConfig = async (req, res) => {
  try {
    let configs = await prisma.rationConfig.findMany();
    if (!configs || configs.length === 0) {
      // Seed default configs if empty
      await prisma.rationConfig.createMany({
        data: getDefaultConfigs()
      });
      configs = await prisma.rationConfig.findMany();
    }
    res.json(configs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch ration config' });
  }
};

exports.updateRationConfig = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'clerk') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { configs } = req.body;
    
    for (const conf of configs) {
      await prisma.rationConfig.upsert({
        where: { card_type: conf.card_type },
        update: {
          wheat: parseFloat(conf.wheat),
          rice: parseFloat(conf.rice),
          sugar: parseFloat(conf.sugar)
        },
        create: {
          card_type: conf.card_type,
          wheat: parseFloat(conf.wheat),
          rice: parseFloat(conf.rice),
          sugar: parseFloat(conf.sugar)
        }
      });
    }
    
    res.json({ success: true, message: 'Configuration updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update config' });
  }
};

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

      // Fetch configs from DB
      let configs = await prisma.rationConfig.findMany();
      if (!configs || configs.length === 0) {
        // Fallback if not configured
        configs = getDefaultConfigs();
      }

      const activeConfig = configs.find(c => c.card_type === cardType) || configs.find(c => c.card_type === 'APL');

      let wheatPerMember = activeConfig ? activeConfig.wheat : 5;
      let ricePerMember = activeConfig ? activeConfig.rice : 2.5;
      let sugarPerHousehold = activeConfig ? activeConfig.sugar : 1;

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
    const schedule = await prisma.rationSchedule.create({ 
      data: { 
        distribution_date: new Date(data.distribution_date), 
        timing_description: data.timing_description, 
        items_available: data.items_available, 
        shop_name: data.shop_name, 
        contact_number: data.contact_number, 
        card_type: data.card_type, 
        ward_area: data.ward_area, 
        special_instructions: data.special_instructions,
        last_date: data.last_date ? new Date(data.last_date) : null
      } 
    });

    // Send notifications to all citizens
    const citizens = await prisma.user.findMany({ where: { role: "citizen" } });
    if (citizens.length > 0) {
      const notificationsData = citizens.map(c => ({
        citizen_id: c.id,
        title: data.last_date ? "Important: Ration Distribution Deadline" : "New Ration Schedule",
        message: data.last_date 
          ? `Last date for ration distribution is ${new Date(data.last_date).toLocaleDateString('en-IN')}. Please collect your ration before it ends.` 
          : `Ration distribution scheduled for ${new Date(data.distribution_date).toLocaleDateString('en-IN')} at ${data.shop_name || 'Designated Shop'}.`,
        type: data.last_date ? "alert" : "ration",
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
        special_instructions: data.special_instructions,
        last_date: data.last_date ? new Date(data.last_date) : null
      } 
    });
    res.json({ message: "Schedule updated successfully", schedule });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
