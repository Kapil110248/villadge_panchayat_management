const { prisma } = require('../db');

exports.getSuggestions = async (req, res) => {
  try {
    const includeConfig = { 
      user_usersuggestion_citizen_idTouser: { include: { citizenprofile: true } }, 
      user_usersuggestion_processed_by_idTouser: true,
      suggestionvote: { include: { user: true } } 
    };
    const mapSuggestion = (s) => ({
      ...s,
      citizen: s.user_usersuggestion_citizen_idTouser ? {
        ...s.user_usersuggestion_citizen_idTouser,
        profile: s.user_usersuggestion_citizen_idTouser.citizenprofile
      } : null,
      processed_by: s.user_usersuggestion_processed_by_idTouser,
      votes: s.suggestionvote ? s.suggestionvote.map(v => ({ ...v, citizen: v.user })) : []
    });

    let suggs = await prisma.userSuggestion.findMany({ 
      include: includeConfig, 
      orderBy: { submitted_at: 'desc' } 
    });
    if (suggs.length === 0) {
      await prisma.userSuggestion.create({ data: { citizen_id: req.user.id, title: "Establish a Public Library", description: "We need a village study room with local books and newspaper support.", status: "under_consideration" } });
      suggs = await prisma.userSuggestion.findMany({ 
        include: includeConfig, 
        orderBy: { submitted_at: 'desc' } 
      });
    }
    res.json(suggs.map(mapSuggestion));
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.createSuggestion = async (req, res) => {
  try {
    const data = req.body;
    const sugg = await prisma.userSuggestion.create({ data: { citizen_id: req.user.id, title: data.title, description: data.description, status: "pending" } });
    await prisma.adminNotification.create({ data: { title: "New Suggestion/Grievance", message: `Title: ${data.title}`, type: "complaint", action_url: "/admin/suggestions", sender_id: req.user.id } });
    res.json({ message: "Idea submitted to suggestion box", suggestion: sugg });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.voteSuggestion = async (req, res) => {
  try {
    const suggestion = await prisma.userSuggestion.findUnique({ where: { id: req.params.id } });
    if (!suggestion) return res.status(404).json({ detail: "Suggestion not found" });
    if (suggestion.citizen_id === req.user.id) {
      return res.status(400).json({ detail: "You cannot vote on your own suggestion" });
    }
    const existingVote = await prisma.suggestionVote.findFirst({
      where: { suggestion_id: req.params.id, citizen_id: req.user.id }
    });
    if (existingVote) {
      return res.status(400).json({ detail: "You have already upvoted this suggestion" });
    }
    const vote = await prisma.suggestionVote.create({ data: { suggestion_id: req.params.id, citizen_id: req.user.id } });
    res.json({ message: "Suggestion upvoted!", vote });
  } catch (error) { 
    console.error("Vote error:", error);
    res.status(500).json({ detail: "Internal Server Error" }); 
  }
};

exports.updateSuggestionStatus = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Access denied" });
  try {
    const data = req.body;
    const valid_statuses = ["pending", "under_consideration", "accepted", "rejected"];
    if (!valid_statuses.includes(data.status)) return res.status(400).json({ detail: "Invalid status" });
    const sugg = await prisma.userSuggestion.update({ 
      where: { id: req.params.id }, 
      data: { status: data.status, processed_by_id: req.user.id } 
    });
    res.json({ message: `Suggestion marked as ${data.status}`, suggestion: sugg });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.deleteSuggestion = async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ detail: "Access denied" });
  try {
    const id = req.params.id;
    await prisma.suggestionVote.deleteMany({ where: { suggestion_id: id } });
    await prisma.userSuggestion.delete({ where: { id } });
    res.json({ message: "Suggestion deleted successfully" });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};
