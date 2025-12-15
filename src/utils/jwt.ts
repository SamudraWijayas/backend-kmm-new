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
  return jwt.sign(user, SECRET, {
    expiresIn: "1d",
  });
};

// ===== GET USER DATA =====
export const getUserData = (token: string): IUserToken => {
  return jwt.verify(token, SECRET) as IUserToken;
};
