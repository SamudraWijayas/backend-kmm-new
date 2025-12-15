import dotenv from "dotenv";
dotenv.config();

export const DATABASE_HOST = process.env.DATABASE_HOST || "";
export const DATABASE_USER = process.env.DATABASE_USER || "";
export const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || "";
export const DATABASE_NAME = process.env.DATABASE_NAME || "";
export const SECRET: string = process.env.SECRET || "";
export const CLIENT_HOST: string =
  process.env.CLIENT_HOST || "http://localhost:3001";
