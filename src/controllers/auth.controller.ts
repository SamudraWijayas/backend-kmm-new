import { Request, Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";
import {
  userDTO,
  userLoginDTO,
  userUpdatePasswordDTO,
} from "../models/user.model";

export default {
  async register(req: IReqUser, res: Response) {
    const { fullName, username, email, password, confirmPassword } = req.body;

    try {
      await userDTO.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      const result = await prisma.user.create({
        data: {
          fullName,
          username,
          password: encrypt(password), // Prisma tidak punya hooks, enkripsi manual
        },
      });

      response.success(res, result, "success registration!");
    } catch (error) {
      response.error(res, error, "failed registration");
    }
  },

  async login(req: IReqUser, res: Response) {
    try {
      const { identifier, password } = req.body;
      await userLoginDTO.validate({ identifier, password });

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ fullName: identifier }, { username: identifier }],
        },
      });

      if (!user) return response.unauthorized(res, "Akun tidak terdaftar");

      if (user.password !== encrypt(password))
        return response.unauthorized(res, "Password Salah");

      const token = generateToken({
        id: user.id,
        role: user.role,
        username: user.username,
        fullName: user.fullName,
      });

      response.success(res, token, "Login success");
    } catch (error) {
      response.error(res, error, "Login failed");
    }
  },
  async updateProfile(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;
      const { fullName, avatar } = req.body;

      if (!userId) {
        return response.unauthorized(res, "Unauthorized");
      }

      const result = await prisma.user.update({
        where: { id: userId },
        data: {
          fullName,
          avatar,
        },
      });

      response.success(res, result, "success to update profile");
    } catch (error: any) {
      // prisma error: record not found
      if (error.code === "P2025") {
        return response.notFound(res, "user not found");
      }

      response.error(res, error, "failed to update profile");
    }
  },
  async updatePassword(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;
      const { oldPassword, password, confirmPassword } = req.body;

      await userUpdatePasswordDTO.validate({
        oldPassword,
        password,
        confirmPassword,
      });

      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.password !== encrypt(oldPassword))
        return response.notFound(res, "User not found");

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { password: encrypt(password) },
      });

      response.success(res, updatedUser, "success to update password");
    } catch (error) {
      response.error(res, error, "failed to update password");
    }
  },

  async me(req: IReqUser, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
      });
      response.success(res, user, "success get user profile");
    } catch (error) {
      response.error(res, error, "failed get user profile");
    }
  },
};
