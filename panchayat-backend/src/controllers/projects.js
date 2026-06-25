const { prisma } = require('../db');

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
    const project = await prisma.developmentProject.create({ data: { name: data.name, category: data.category, budget: data.budget, start_date: new Date(data.start_date), expected_completion: new Date(data.expected_completion), progress: data.progress || 0, before_image: data.before_image, after_image: data.after_image, status: data.status || "planning" } });
    res.json({ message: "Development project registered successfully", project });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.updateProject = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const project_id = parseInt(req.params.project_id);
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
        updated_by: req.user.full_name 
      } 
    });
    res.json({ message: "Project progress updated", project });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
