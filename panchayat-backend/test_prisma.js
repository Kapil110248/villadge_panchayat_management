const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const notices = await prisma.notice.findMany({ include: { user: true }, orderBy: { created_at: 'desc' } });
    const result = notices.map(n => ({
      id: n.id, title: n.title, content: n.content, notice_type: n.notice_type, is_published: n.is_published,
      created_at: n.created_at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      expiry_date: n.expiry_date ? n.expiry_date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
      created_by: n.user ? n.user.full_name : "Unknown"
    }));
    console.log("Notices mapping result:", JSON.stringify(result, null, 2));
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
