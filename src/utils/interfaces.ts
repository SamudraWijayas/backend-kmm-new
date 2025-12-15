import { Request } from "express";
import { Role } from "@prisma/client"; // ambil tipe dari Prisma

// Tipe data token (tanpa field sensitif)
export interface IUserToken {
  id: number; // Prisma pakai number (bukan ObjectId)
  role: Role;
  username: string;
  fullName: string;
}

// Extend Express Request biar ada properti "user"
export interface IReqUser extends Request {
  user?: IUserToken;
}

export interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
}
