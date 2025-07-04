import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connection successful!");

    // Test simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);

    const sessionCount = await prisma.session.count();
    console.log(`📊 Sessions in database: ${sessionCount}`);

    console.log("🎯 Database schema is working correctly!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
