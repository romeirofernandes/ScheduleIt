import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to initialize Prisma.");
}

const needsSsl = /sslmode=require/i.test(connectionString);

const poolConfig = {
  connectionString,
};

if (needsSsl) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = globalForPrisma.prismaPool ?? new Pool(poolConfig);

const cachedClient = globalForPrisma.prisma;

const prismaClient =
  cachedClient && 
  typeof cachedClient.classroomAccessRequest !== "undefined" &&
  typeof cachedClient.timetablePlan !== "undefined"
    ? cachedClient
    : new PrismaClient({
        adapter: new PrismaPg(pool),
      });

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaPool = pool;
  globalForPrisma.prisma = prisma;
}

// Invalidate turbopack cache 2
