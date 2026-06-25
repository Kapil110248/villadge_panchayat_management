const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const schemes = [
  {
    scheme_name: "PM Awas Yojana (Rural)",
    description: "Kachhe ghar ko pakka banane ke liye sarkar ki taraf se arthik sahayata.",
    benefit: "Up to ₹1.2 Lakh",
    category: "Housing",
    icon: "Home",
    color_theme: "bg-blue-100 text-blue-600",
  },
  {
    scheme_name: "PM Kisan Samman Nidhi",
    description: "Khisano ke liye saalana ₹6,000 ki seedhi arthik madad.",
    benefit: "₹2,000 every 4 months",
    category: "Agriculture",
    icon: "Tractor",
    color_theme: "bg-emerald-100 text-emerald-600",
  },
  {
    scheme_name: "Vasantrao Naik Shiksha Yojna",
    description: "Rural area ke students ke liye higher education scholarship.",
    benefit: "Full Tuition Fee",
    category: "Education",
    icon: "GraduationCap",
    color_theme: "bg-purple-100 text-purple-600",
  },
  {
    scheme_name: "MGNREGA - 100 Days Work",
    description: "Gaav ke har ek parivar ko saal me 100 din ka guaranteed rojgar.",
    benefit: "Daily Wages",
    category: "Employment",
    icon: "IndianRupee",
    color_theme: "bg-amber-100 text-amber-600",
  },
];

async function main() {
  console.log('Seeding schemes...');
  
  // Try to find an admin user to set as creator
  let adminUser = await prisma.user.findFirst({
    where: { role: 'admin' }
  });
  
  // If no admin, find any user
  if (!adminUser) {
    adminUser = await prisma.user.findFirst();
  }
  
  if (!adminUser) {
    console.log("No users found. Creating a dummy admin user.");
    adminUser = await prisma.user.create({
      data: {
        email: "dummyadmin@example.com",
        password_hash: "dummypass",
        role: "admin",
        full_name: "Dummy Admin"
      }
    });
  }

  for (const s of schemes) {
    const existing = await prisma.scheme.findFirst({
      where: { scheme_name: s.scheme_name }
    });
    
    if (!existing) {
      await prisma.scheme.create({
        data: {
          ...s,
          created_by_id: adminUser.id
        }
      });
      console.log(`Created scheme: ${s.scheme_name}`);
    } else {
      console.log(`Scheme already exists: ${s.scheme_name}`);
    }
  }
  
  console.log('Seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
