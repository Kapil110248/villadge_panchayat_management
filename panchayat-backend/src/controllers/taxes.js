const { prisma } = require('../db');
const fs = require('fs');
const path = require('path');

exports.getTaxes = async (req, res) => {
  try {
    if (['admin', 'clerk'].includes(req.user.role)) {
      const taxes = await prisma.taxRecord.findMany({ include: { citizen: { include: { profile: true } } } });
      return res.json(taxes);
    } else {
      let taxes = await prisma.taxRecord.findMany({ where: { citizen_id: req.user.id } });
      if (taxes.length === 0) {
        await prisma.taxRecord.create({ data: { citizen_id: req.user.id, tax_type: "house", amount: 450.0, due_date: new Date(2026, 8, 30), status: "unpaid" } });
        await prisma.taxRecord.create({ data: { citizen_id: req.user.id, tax_type: "water", amount: 180.0, due_date: new Date(2026, 8, 30), status: "unpaid" } });
        taxes = await prisma.taxRecord.findMany({ where: { citizen_id: req.user.id } });
      }
      return res.json(taxes);
    }
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.payTax = async (req, res) => {
  try {
    const data = req.body;
    const taxRecord = await prisma.taxRecord.findUnique({
      where: { id: data.tax_record_id },
      include: { citizen: true }
    });
    if (!taxRecord) return res.status(404).json({ detail: "Tax record not found" });

    const tax = await prisma.taxRecord.update({ where: { id: data.tax_record_id }, data: { status: "pending", payment_date: new Date(), transaction_id: String(data.transaction_id) } });
    
    // Create Admin notification
    await prisma.adminNotification.create({
      data: {
        title: "Tax Payment Submitted",
        message: `${taxRecord.citizen.full_name} has submitted a payment of ₹${taxRecord.amount} for ${taxRecord.tax_type} tax. Transaction ID: ${data.transaction_id}. Please verify.`,
        type: "tax",
        action_url: "/admin/taxes",
        sender_id: req.user.id
      }
    });

    res.json({ message: "Payment submitted for verification", tax });
  } catch (error) { 
    console.error("Pay Tax Error:", error);
    res.status(500).json({ detail: "Internal Server Error" }); 
  }
};

exports.approveTax = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const tax = await prisma.taxRecord.update({ where: { id: req.params.tax_id }, data: { status: "paid" } });
    res.json({ message: "Payment approved successfully", tax });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.levyTax = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const data = req.body;
    const tax = await prisma.taxRecord.create({ data: { citizen_id: data.citizen_id, tax_type: data.tax_type, amount: parseFloat(data.amount), due_date: new Date(data.due_date), status: "unpaid", penalty_rate: data.penalty_rate ? parseFloat(data.penalty_rate) : 0.0 } });
    
    // Create Citizen notification
    await prisma.citizenNotification.create({
      data: {
        citizen_id: data.citizen_id,
        title: "New Tax Levied",
        message: `A new ${data.tax_type} tax of ₹${parseFloat(data.amount)} has been levied. Due Date: ${new Date(data.due_date).toLocaleDateString("en-IN")}. Penalty: ${data.penalty_rate || 0}%/month if unpaid.`,
        type: "tax",
        action_url: "/citizen/taxes"
      }
    });

    res.json({ message: "Tax levied successfully", tax });
  } catch (error) { 
    console.error("Levy Tax Error:", error);
    res.status(500).json({ detail: "Internal Server Error" }); 
  }
};

exports.generateTaxes = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const data = req.body;
    const current_year = new Date().getFullYear();
    const config_path = path.join(__dirname, '../../tax_config.json');
    if (fs.existsSync(config_path)) {
      const config = JSON.parse(fs.readFileSync(config_path));
      if (config.last_generated_year === current_year) return res.status(400).json({ detail: "Yearly taxes already generated for this year." });
    }
    const allCitizens = await prisma.user.findMany({ 
      where: { role: "citizen" },
      include: { family_head: true }
    });
    const citizens = allCitizens.filter(c => c.family_head !== null || c.family_member_id === null);

    let count = 0;
    const due_date = new Date(data.due_date);
    const penalty_rate = data.penalty_rate ? parseFloat(data.penalty_rate) : 0.0;
    const notificationsData = [];
    
    for (const citizen of citizens) {
      await prisma.taxRecord.create({ data: { citizen_id: citizen.id, tax_type: "house", amount: data.house_tax_amount, due_date, status: "unpaid", penalty_rate } });
      await prisma.taxRecord.create({ data: { citizen_id: citizen.id, tax_type: "water", amount: data.water_tax_amount, due_date, status: "unpaid", penalty_rate } });
      
      notificationsData.push({
        citizen_id: citizen.id,
        title: "Yearly Taxes Generated",
        message: `Yearly house tax (₹${data.house_tax_amount}) and water tax (₹${data.water_tax_amount}) have been generated. Due Date: ${new Date(data.due_date).toLocaleDateString("en-IN")}. Penalty: ${penalty_rate}%/month if unpaid.`,
        type: "tax",
        action_url: "/citizen/taxes"
      });
      
      count += 2;
    }
    
    if (notificationsData.length > 0) {
      await prisma.citizenNotification.createMany({ data: notificationsData });
    }
    
    fs.writeFileSync(config_path, JSON.stringify({ last_generated_year: current_year }));
    res.json({ message: `Generated ${count} new tax records successfully` });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.getTaxAnalytics = async (req, res) => {
  try {
    const paid_house = await prisma.taxRecord.count({ where: { status: "paid", tax_type: "house" } });
    const paid_water = await prisma.taxRecord.count({ where: { status: "paid", tax_type: "water" } });
    const unpaid_house = await prisma.taxRecord.count({ where: { status: "unpaid", tax_type: "house" } });
    const unpaid_water = await prisma.taxRecord.count({ where: { status: "unpaid", tax_type: "water" } });
    const current_year = new Date().getFullYear();
    let has_generated = false;
    const config_path = path.join(__dirname, '../../tax_config.json');
    if (fs.existsSync(config_path)) {
      try { const config = JSON.parse(fs.readFileSync(config_path)); if (config.last_generated_year === current_year) has_generated = true; } catch (e) {}
    }
    res.json({ house_collection_pct: (paid_house + unpaid_house) > 0 ? Math.round((paid_house / (paid_house + unpaid_house)) * 100) : 0, water_collection_pct: (paid_water + unpaid_water) > 0 ? Math.round((paid_water / (paid_water + unpaid_water)) * 100) : 0, total_collected: (paid_house * 450.0) + (paid_water * 180.0), total_unpaid: (unpaid_house * 450.0) + (unpaid_water * 180.0), has_generated_yearly: has_generated });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
