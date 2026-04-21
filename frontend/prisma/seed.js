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

  // ─── Staff Users ──────────────────────────────────────────────────────────

  // Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      username: "super_admin",
      email: "superadmin@college.edu",
      mobNumber: "1000000001",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`Created super admin: ${superAdmin.username}`);

  // Admin
  const admin = await prisma.user.create({
    data: {
      username: "admin_user",
      email: "admin@college.edu",
      mobNumber: "1234567890",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Created admin: ${admin.username}`);

  // Timetable Setter
  const timetableSetter = await prisma.user.create({
    data: {
      username: "tt_setter",
      email: "timetable@college.edu",
      mobNumber: "1000000002",
      passwordHash,
      role: "TIMETABLE_SETTER",
    },
  });
  console.log(`Created timetable setter: ${timetableSetter.username}`);

  // Class Teachers (one per class)
  const classTeachers = [
    { username: "ct_fe", email: "ct.fe@college.edu", mobNumber: "2000000001", class: "FE" },
    { username: "ct_te", email: "ct.te@college.edu", mobNumber: "2000000002", class: "TE" },
  ];
  for (const ct of classTeachers) {
    const created = await prisma.user.create({
      data: {
        username: ct.username,
        email: ct.email,
        mobNumber: ct.mobNumber,
        passwordHash,
        role: "CLASS_TEACHER",
        assignedClass: ct.class,
      },
    });
    console.log(`Created class teacher for ${ct.class}: ${created.username}`);
  }

  // Normal Teacher
  const normalTeacher = await prisma.user.create({
    data: {
      username: "mr_sharma",
      email: "sharma@college.edu",
      mobNumber: "3000000001",
      passwordHash,
      role: "NORMAL_TEACHER",
    },
  });
  console.log(`Created normal teacher: ${normalTeacher.username}`);

  // ─── Students ─────────────────────────────────────────────────────────────
  const students = [
    { username: "fe_student", email: "fe@college.edu", mobNumber: "9876543210", class: "FE", isCR: true },
    { username: "fe_student2", email: "fe2@college.edu", mobNumber: "9876543215", class: "FE", isCR: false },
    { username: "se_student", email: "se@college.edu", mobNumber: "9876543211", class: "SE", isCR: false },
    { username: "te_student", email: "te@college.edu", mobNumber: "9876543212", class: "TE", isCR: true },
    { username: "be_student", email: "be@college.edu", mobNumber: "9876543213", class: "BE", isCR: false },
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
        isCR: stu.isCR,
      },
    });
    console.log(`Created student [${stu.class}]${stu.isCR ? " (CR)" : ""}: ${stu.username}`);
  }

  // ─── Lab Allocations ──────────────────────────────────────────────────────
  const allocations = [
    { targetClass: "FE", subject: "Programming in C",    labName: "601", day: "Monday",    timeRange: "08:45 AM - 10:45 AM" },
    { targetClass: "FE", subject: "Engineering Physics", labName: "708", day: "Tuesday",   timeRange: "11:00 AM - 01:00 PM" },

    { targetClass: "SE", subject: "Data Structures",     labName: "602", day: "Wednesday", timeRange: "11:00 AM - 01:00 PM" },
    { targetClass: "SE", subject: "Microprocessors",     labName: "603", day: "Friday",    timeRange: "01:30 PM - 03:30 PM" },

    { targetClass: "TE", subject: "Database Management", labName: "801", day: "Monday",    timeRange: "01:30 PM - 03:30 PM" },
    { targetClass: "TE", subject: "Operating Systems",   labName: "802", day: "Thursday",  timeRange: "08:45 AM - 10:45 AM" },

    { targetClass: "BE", subject: "Machine Learning",    labName: "809", day: "Tuesday",   timeRange: "01:30 PM - 03:30 PM" },
    { targetClass: "BE", subject: "Cloud Computing",     labName: "810", day: "Wednesday", timeRange: "08:45 AM - 10:45 AM" },
  ];

  for (const alloc of allocations) {
    await prisma.labAllocation.create({ data: alloc });
  }
  console.log(`Created ${allocations.length} lab allocations.`);

  console.log("\n✅ Seeding complete!");
  console.log("\nTest accounts (password: password123):");
  console.log("  super_admin   → SUPER_ADMIN");
  console.log("  admin_user    → ADMIN");
  console.log("  tt_setter     → TIMETABLE_SETTER");
  console.log("  ct_fe         → CLASS_TEACHER (FE)");
  console.log("  mr_sharma     → NORMAL_TEACHER");
  console.log("  fe_student    → STUDENT (FE, CR)");
  console.log("  te_student    → STUDENT (TE, CR)");
  console.log("  be_student    → STUDENT (BE)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
