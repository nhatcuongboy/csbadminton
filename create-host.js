// Script to create a default host user
import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function createDefaultHost() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: "nhatcuong@example.com"
      }
    });

    if (existingUser) {
      console.log("✅ Default host already exists:", existingUser.id);
      console.log("Use this ID:", existingUser.id);
      return existingUser;
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        name: "Nhat Cuong",
        email: "nhatcuong@example.com",
      },
    });

    console.log("✅ Created default host:", user.id);
    console.log("Add this to your environment variables:");
    console.log(`DEFAULT_HOST_ID="${user.id}"`);
    
    return user;
  } catch (error) {
    console.error("❌ Error creating default host:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultHost();
