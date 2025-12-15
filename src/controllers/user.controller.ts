import { Response } from "express";
import { prisma } from "../utils/prisma";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import { userAddDTO } from "../models/user.model";
import response from "../utils/response";
import { encrypt } from "../utils/encryption";

export default {
  // 🟢 CREATE USER
  async addUser(req: IReqUser, res: Response) {
    const {
      fullName,
      username,
      password,
      confirmPassword,
      role,
      daerahId,
      desaId,
      kelompokId,
    } = req.body;

    try {
      // ✅ Validasi basic fields
      await userAddDTO.validate({
        fullName,
        username,
        password,
        confirmPassword,
        role,
      });

      // ✅ Cek username duplikat
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return response.conflict(res, "❌ Username sudah terdaftar");
      }

      // ✅ Validasi role dan hubungannya
      const validatedData: {
        daerahId?: string;
        desaId?: string;
        kelompokId?: string;
      } = {};

      switch (role) {
        case "DAERAH":
        case "SUBDAERAH":
          if (!daerahId)
            return response.error(
              res,
              null,
              "❌ daerahId wajib untuk role DAERAH atau SUBDAERAH"
            );
          validatedData.daerahId = String(daerahId);
          break;

        case "DESA":
        case "SUBDESA":
          if (!desaId)
            return response.error(
              res,
              null,
              "❌ desaId wajib untuk role DESA atau SUBDESA"
            );
          validatedData.desaId = String(desaId);
          break;

        case "KELOMPOK":
        case "SUBKELOMPOK":
          if (!kelompokId)
            return response.error(
              res,
              null,
              "❌ kelompokId wajib untuk role KELOMPOK atau SUBKELOMPOK"
            );
          validatedData.kelompokId = String(kelompokId);
          break;

        case "SUPERADMIN":
        case "ADMIN":
          // Tidak butuh ID tambahan
          break;

        default:
          return response.error(
            res,
            null,
            "❌ Role tidak valid. Gunakan salah satu dari: SUPERADMIN, ADMIN, DAERAH, SUBDAERAH, DESA, SUBDESA, KELOMPOK, SUBKELOMPOK"
          );
      }

      // ✅ Siapkan data prisma
      const createData: any = {
        fullName,
        username,
        password: encrypt(password),
        role,
      };

      if (validatedData.daerahId) {
        createData.daerah = { connect: { id: validatedData.daerahId } };
      }
      if (validatedData.desaId) {
        createData.desa = { connect: { id: validatedData.desaId } };
      }
      if (validatedData.kelompokId) {
        createData.kelompok = { connect: { id: validatedData.kelompokId } };
      }

      // ✅ Simpan user baru ke DB
      const newUser = await prisma.user.create({ data: createData });

      return response.success(res, newUser, "✅ Successfully added user!");
    } catch (error: any) {
      console.error("❌ Add user error:", error);
      return response.error(res, error, "❌ Failed to add user");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    const {
      page = 1,
      limit = 10,
      search,
    } = req.query as unknown as IPaginationQuery;

    try {
      const skip = (Number(page) - 1) * Number(limit);

      // 🔍 Filter pencarian
      const where = search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      // Ambil semua user sesuai pagination
      const [users, count] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
      ]);

      // 🔄 Ambil semua referensi daerah/desa/kelompok yang diperlukan
      const [allDaerah, allDesa, allKelompok] = await Promise.all([
        prisma.daerah.findMany({ select: { id: true, name: true } }),
        prisma.desa.findMany({ select: { id: true, name: true } }),
        prisma.kelompok.findMany({ select: { id: true, name: true } }),
      ]);

      // 🧩 Gabungkan manual ID → nama
      const combinedUsers = users.map((user) => ({
        ...user,
        daerah: allDaerah.find((d) => d.id === user.daerahId) || null,
        desa: allDesa.find((d) => d.id === user.desaId) || null,
        kelompok: allKelompok.find((k) => k.id === user.kelompokId) || null,
      }));

      // 📤 Response dengan pagination
      response.pagination(
        res,
        combinedUsers,
        {
          total: count,
          totalPages: Math.ceil(count / Number(limit)),
          current: Number(page),
        },
        "✅ Successfully fetched all users"
      );
    } catch (error) {
      console.error("❌ findAll error:", error);
      response.error(res, error, "❌ Failed to find all users");
    }
  },
  // 🟢 READ - FIND ONE USER BY ID
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      const result = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!result) {
        return response.notFound(res, "user not found");
      }

      response.success(res, result, "success find one user");
    } catch (error) {
      response.error(res, error, "failed find one user");
    }
  },

  // 🟠 UPDATE USER
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const { fullName, username, role } = req.body;

      const user = await prisma.user.findUnique({ where: { id: Number(id) } });
      if (!user) return response.notFound(res, "user not found");

      const result = await prisma.user.update({
        where: { id: Number(id) },
        data: { fullName, username, role },
      });

      response.success(res, result, "success update user");
    } catch (error) {
      response.error(res, error, "failed to update user");
    }
  },

  // 🔴 DELETE USER
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({ where: { id: Number(id) } });
      if (!user) return response.notFound(res, "user not found");

      const result = await prisma.user.delete({ where: { id: Number(id) } });

      response.success(res, result, "success remove user");
    } catch (error) {
      response.error(res, error, "failed to remove user");
    }
  },
};
