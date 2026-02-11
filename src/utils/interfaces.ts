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

export interface IMumiToken {
  id: number;
  nama: string;
  kelompokId: string;
  desaId: string;
  daerahId: string;
  jenjangId: string;
  mahasiswa: boolean;
  tgl_lahir: string;
}

export interface IReqMumi extends Request {
  user?: IMumiToken;
}

export interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
}
