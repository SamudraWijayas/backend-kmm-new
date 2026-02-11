import jwt from "jsonwebtoken";
import { SECRET } from "./env";
import { Role } from "@prisma/client";

// Sesuaikan tipe token dengan kolom User dari Sequelize
export interface IUserToken {
  id: number;
  username: string;
  fullName: string;
  role: Role;
}

// ===== GENERATE TOKEN =====
export const generateToken = (user: IUserToken): string => {
  const token = jwt.sign(user, SECRET, {
    expiresIn: "7d",
  });
  return token;
};

// ===== GET USER DATA =====
export const getUserData = (token: string): IUserToken => {
  return jwt.verify(token, SECRET) as IUserToken;
};

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

export const generateMumiToken = (user: IMumiToken): string => {
  const token = jwt.sign(user, SECRET, {
    expiresIn: "7d",
  });
  return token;
};

export const getMumiData = (token: string): IMumiToken => {
  return jwt.verify(token, SECRET) as IMumiToken;
};
