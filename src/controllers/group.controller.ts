import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

const groupDTO = Yup.object({
  name: Yup.string().required("Nama group wajib diisi"),
});

export default {
  // 🟢 Buat Group
  async create(req: IReqUser, res: Response) {
    try {
      const { name, members } = req.body;
      if (!req.user?.id) {
        return response.unauthorized(res, "User tidak terautentikasi");
      }
      const userId = req.user?.id;

      await groupDTO.validate({ name });

      const group = await prisma.group.create({
        data: {
          name,
          createdById: userId,
          members: {
            create: [
              {
                mumiId: userId, // creator otomatis join
              },
              ...(members || []).map((id: number) => ({
                mumiId: id,
              })),
            ],
          },
        },
        include: {
          members: true,
        },
      });

      response.success(res, group, "✅ Group berhasil dibuat");
    } catch (error) {
      response.error(res, error, "❌ Gagal membuat group");
    }
  },

  // 🔍 Ambil semua group user
  async myGroups(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;

      const groups = await prisma.groupMember.findMany({
        where: { mumiId: userId },
        include: {
          group: true,
        },
      });

      response.success(res, groups, "✅ Berhasil mengambil group");
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil group");
    }
  },

  // 🔍 Detail group
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      const group = await prisma.group.findUnique({
        where: { id: Number(id) },
        include: {
          members: {
            include: {
              mumi: true,
            },
          },
        },
      });

      if (!group) {
        return response.notFound(res, "Group tidak ditemukan");
      }

      response.success(res, group, "✅ Detail group berhasil diambil");
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil detail group");
    }
  },
};
