const { prisma } = require('../db');

exports.getGramSabha = async (req, res) => {
  try {
    let meetings = await prisma.gramSabhaMeeting.findMany({ include: { suggestions: { include: { citizen: true, replies: { include: { citizen: true }, orderBy: { created_at: 'asc' } } } }, attendance: { include: { citizen: true } } }, orderBy: { date_time: 'desc' } });
    if (meetings.length === 0) {
      await prisma.gramSabhaMeeting.create({ data: { date_time: new Date(2026, 5, 25, 10, 30), agenda: "Road repair discussion...", location: "Gram Panchayat Bhawan Ground", notice_published: true } });
      await prisma.gramSabhaMeeting.create({ data: { date_time: new Date(2026, 4, 10, 11, 00), agenda: "Annual budget planning...", location: "Panchayat Hall", status: "completed", notice_published: true, minutes_url: "https://grampanchayat-sarahi.mp.gov.in/minutes/may-2026.pdf" } });
      meetings = await prisma.gramSabhaMeeting.findMany({ include: { suggestions: { include: { citizen: true, replies: { include: { citizen: true }, orderBy: { created_at: 'asc' } } } }, attendance: { include: { citizen: true } } }, orderBy: { date_time: 'desc' } });
    }
    res.json(meetings);
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.createGramSabha = async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ detail: "Only Admin can schedule Gram Sabha meetings" });
  try {
    const data = req.body;
    const meeting = await prisma.gramSabhaMeeting.create({ data: { date_time: new Date(data.date_time), agenda: data.agenda, location: data.location, notice_published: true } });
    res.json({ message: "Gram Sabha meeting scheduled successfully", meeting });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.addGramSabhaSuggestion = async (req, res) => {
  try {
    const meeting_id = req.params.meeting_id;
    const data = req.body;
    const suggestion = await prisma.sabhaSuggestion.create({ data: { meeting_id, citizen_id: req.user.id, suggestion_text: data.suggestion_text } });
    const citizen = await prisma.user.findFirst({ where: { id: req.user.id } });
    const cit_name = citizen ? citizen.full_name : "Citizen";
    await prisma.adminNotification.create({ data: { title: "New Suggestion Received", message: `${cit_name} submitted a new suggestion for meeting ${meeting_id}.`, type: "suggestion", action_url: `/admin/gram-sabha/${meeting_id}`, sender_id: req.user.id } });
    res.json({ message: "Suggestion submitted successfully", suggestion });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.addGramSabhaAttendance = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Only Admin or Clerk can mark meeting attendance" });
  try {
    const meeting_id = req.params.meeting_id;
    const citizen_id = parseInt(req.body.citizen_id || req.query.citizen_id);
    const attendance = await prisma.sabhaAttendance.create({ data: { meeting_id, citizen_id } });
    res.json({ message: "Attendance marked successfully", attendance });
  } catch (error) { res.status(400).json({ detail: "Attendance already marked or invalid details" }); }
};

exports.updateGramSabhaMinutes = async (req, res) => {
  if (!['admin', 'clerk'].includes(req.user.role)) return res.status(403).json({ detail: "Only Admin or Clerk can update meeting minutes and resolutions" });
  try {
    const meeting_id = req.params.meeting_id;
    const minutes_url = req.body.minutes_url || req.query.minutes_url;
    const resolutions = req.body.resolutions;
    
    const updateData = { status: "completed" };
    if (minutes_url !== undefined) updateData.minutes_url = minutes_url;
    if (resolutions !== undefined) updateData.resolutions = resolutions;

    const meeting = await prisma.gramSabhaMeeting.update({ where: { id: meeting_id }, data: updateData });
    res.json({ message: "Meeting updated and marked completed", meeting });
  } catch (error) { res.status(500).json({ detail: "Internal Server Error" }); }
};

exports.addGramSabhaSuggestionReply = async (req, res) => {
  try {
    const suggestion_id = req.params.suggestion_id;
    const { reply_text } = req.body;
    if (!reply_text) return res.status(400).json({ detail: "Reply text is required" });
    const reply = await prisma.sabhaSuggestionReply.create({
      data: {
        suggestion_id,
        citizen_id: req.user.id,
        reply_text
      }
    });
    
    // Create admin notification
    const citizen = await prisma.user.findFirst({ where: { id: req.user.id } });
    const cit_name = citizen ? citizen.full_name : "Citizen";
    await prisma.adminNotification.create({
      data: {
        title: "New Suggestion Reply",
        message: `${cit_name} replied to a suggestion: "${reply_text.substring(0, 50)}..."`,
        type: "suggestion_reply",
        sender_id: req.user.id
      }
    });

    res.json({ message: "Reply submitted successfully", reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};
