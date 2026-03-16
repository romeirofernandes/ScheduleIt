const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

require("dotenv").config({ path: ".env" });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: /sslmode=require/i.test(connectionString || "") ? { rejectUnauthorized: false } : undefined
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Delete all existing data
  await prisma.labAllocation.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash default password
  const defaultPassword = "password123";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 3. Create Admin
  const admin = await prisma.user.create({
    data: {
      username: "admin_user",
      email: "admin@college.edu",
      mobNumber: "1234567890",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Created admin user: ${admin.username}`);

  // 4. Create Students (FE, SE, TE, BE)
  const students = [
    { username: "fe_student", email: "fe@college.edu", mobNumber: "9876543210", class: "FE" },
    { username: "se_student", email: "se@college.edu", mobNumber: "9876543211", class: "SE" },
    { username: "te_student", email: "te@college.edu", mobNumber: "9876543212", class: "TE" },
    { username: "be_student", email: "be@college.edu", mobNumber: "9876543213", class: "BE" },
  ];

  for (const stu of students) {
    await prisma.user.create({
      data: {
        username: stu.username,
        email: stu.email,
        mobNumber: stu.mobNumber,
        passwordHash,
        role: "STUDENT",
        studentClass: stu.class,
      },
    });
    console.log(`Created student user for class ${stu.class}: ${stu.username}`);
  }

  // 5. Create Dummy Lab Allocations
  const allocations = [
    { targetClass: "FE", subject: "Programming in C", labName: "601", day: "Monday", timeRange: "08:45 AM - 10:45 AM" },
    { targetClass: "FE", subject: "Engineering Physics", labName: "708", day: "Tuesday", timeRange: "11:00 AM - 01:00 PM" },
    
    { targetClass: "SE", subject: "Data Structures", labName: "602", day: "Wednesday", timeRange: "11:00 AM - 01:00 PM" },
    { targetClass: "SE", subject: "Microprocessors", labName: "603", day: "Friday", timeRange: "01:30 PM - 03:30 PM" },
    
    { targetClass: "TE", subject: "Database Management", labName: "801", day: "Monday", timeRange: "01:30 PM - 03:30 PM" },
    { targetClass: "TE", subject: "Operating Systems", labName: "802", day: "Thursday", timeRange: "08:45 AM - 10:45 AM" },
    
    { targetClass: "BE", subject: "Machine Learning", labName: "809", day: "Tuesday", timeRange: "01:30 PM - 03:30 PM" },
    { targetClass: "BE", subject: "Cloud Computing", labName: "810", day: "Wednesday", timeRange: "08:45 AM - 10:45 AM" },
  ];

  for (const alloc of allocations) {
    await prisma.labAllocation.create({
      data: alloc,
    });
  }
  console.log(`Created ${allocations.length} lab allocations.`);

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
