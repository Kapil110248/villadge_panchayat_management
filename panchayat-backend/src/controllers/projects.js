const { prisma } = require('../db');

const sendProjectNotification = async (req, project, title, message) => {
  try {
    // 1. Create global admin notification for other clerks/admins
    await prisma.adminNotification.create({
      data: {
        title,
        message,
        type: "project_update",
        action_url: "/admin/development",
        sender_id: req.user.id
      }
    });

    // 2. Fetch all citizens
    const citizens = await prisma.user.findMany({
      where: { role: 'citizen' },
      select: { id: true }
    });

    // 3. Create notifications for all citizens
    if (citizens.length > 0) {
      const citizenNotificationsData = citizens.map(c => ({
        citizen_id: c.id,
        title,
        message,
        type: "project_update",
        action_url: "/citizen/development"
      }));
      await prisma.citizenNotification.createMany({
        data: citizenNotificationsData
      });
    }
  } catch (error) {
    console.error("Failed to send project notifications:", error);
  }
};

exports.getProjects = async (req, res) => {
  try {
    let projects = await prisma.developmentProject.findMany({ orderBy: { created_at: 'desc' } });
    if (projects.length === 0) {
      await prisma.developmentProject.create({ data: { name: "Main Road Concrete Laying", category: "Road Construction", budget: 450000.0, start_date: new Date(2026, 3, 1), expected_completion: new Date(2026, 6, 30), progress: 70, status: "active" } });
      await prisma.developmentProject.create({ data: { name: "Panchayat Bhawan Solar Lighting", category: "Street Light Installation", budget: 120000.0, start_date: new Date(2026, 4, 10), expected_completion: new Date(2026, 5, 15), progress: 100, status: "completed" } });
      projects = await prisma.developmentProject.findMany({ orderBy: { created_at: 'desc' } });
    }
    res.json(projects);
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.createProject = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const data = req.body;
    const project = await prisma.developmentProject.create({ 
      data: { 
        name: data.name, 
        category: data.category, 
        budget: data.budget, 
        start_date: new Date(data.start_date), 
        expected_completion: new Date(data.expected_completion), 
        progress: data.progress || 0, 
        before_image: data.before_image, 
        after_image: data.after_image, 
        status: data.status || "planning",
        updated_by: data.updated_by || req.user.full_name
      } 
    });
    
    // Send notifications to all citizens and clerks/admins
    const match = data.name.match(/\[CONTRACTOR:(.*?)\]/);
    const contractor = match ? match[1] : 'N/A';
    const cleanName = data.name.replace(/\[CONTRACTOR:.*?\]/, '').trim();
    
    await sendProjectNotification(
      req, 
      project, 
      "Naya Vikas Karya (New Project)", 
      `Ek naya project "${cleanName}" (${data.category}) darj kiya gaya hai. Thekedar: ${contractor}, Adhikari: ${data.updated_by || req.user.full_name}.`
    );

    res.json({ message: "Development project registered successfully", project });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.updateProject = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const project_id = req.params.project_id;
    const data = req.body;
    const project = await prisma.developmentProject.update({ 
      where: { id: project_id }, 
      data: { 
        ...(data.name && { name: data.name }),
        ...(data.category && { category: data.category }),
        ...(data.budget !== undefined && { budget: data.budget }),
        ...(data.start_date && { start_date: new Date(data.start_date) }),
        ...(data.expected_completion && { expected_completion: new Date(data.expected_completion) }),
        ...(data.progress !== undefined && { progress: data.progress }), 
        ...(data.status && { status: data.status }), 
        ...(data.after_image && { after_image: data.after_image }),
        updated_by: data.updated_by || req.user.full_name 
      } 
    });

    // Send notifications to all citizens and clerks/admins
    const match = project.name.match(/\[CONTRACTOR:(.*?)\]/);
    const contractor = match ? match[1] : 'N/A';
    const cleanName = project.name.replace(/\[CONTRACTOR:.*?\]/, '').trim();
    
    let message = `Project "${cleanName}" (Thekedar: ${contractor}) ki pragati (progress) ${project.progress}% ho gayi hai (Officer: ${project.updated_by || req.user.full_name}).`;
    if (project.status === "completed") {
      message = `Project "${cleanName}" (Thekedar: ${contractor}) ka kaam safaltapoorvak poora (100% Completed) ho gaya hai! (Officer: ${project.updated_by || req.user.full_name})`;
    }
    await sendProjectNotification(
      req, 
      project, 
      project.status === "completed" ? "Karya Poora Hua (Project Completed)" : "Pragati Patra (Progress Update)", 
      message
    );

    res.json({ message: "Project progress updated", project });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
