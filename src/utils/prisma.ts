import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Opsional: helper untuk connect/disconnect
export const connect = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

export const disconnect = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected!");
  } catch (error) {
    console.error("❌ Database disconnection failed:", error);
  }
};
