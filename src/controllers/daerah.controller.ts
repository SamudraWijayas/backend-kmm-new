import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

const daerahAddDTO = Yup.object({
  name: Yup.string().required("Nama daerah wajib diisi"),
});

export default {
  // 🟢 Tambah daerah
  async addDaerah(req: IReqUser, res: Response) {
    const { name } = req.body;

    try {
      await daerahAddDTO.validate({ name });

      const existing = await prisma.daerah.findUnique({
        where: { name },
      });

      if (existing) {
        return response.conflict(res, "Nama daerah sudah terdaftar");
      }

      const newDaerah = await prisma.daerah.create({
        data: { name },
      });

      response.success(res, newDaerah, "✅ Berhasil menambahkan daerah!");
    } catch (error) {
      response.error(res, error, "❌ Gagal menambahkan daerah");
    }
  },

  // 🔍 Ambil semua daerah (dengan pagination)
  async findAll(req: IReqUser, res: Response) {
    try {
      const { limit = 10, page = 1, search } = req.query;

      const where: any = {};
      if (search) {
        where.name = { contains: String(search), mode: "insensitive" };
      }

      const daerahList = await prisma.daerah.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: +limit,
        skip: (+page - 1) * +limit,
      });

      const total = await prisma.daerah.count({ where });

      response.pagination(
        res,
        daerahList,
        {
          current: +page,
          total,
          totalPages: Math.ceil(total / +limit),
        },
        "✅ Berhasil mengambil semua daerah"
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar daerah");
    }
  },

  // 🔍 Ambil satu daerah berdasarkan ID
  async findOne(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      const daerah = await prisma.daerah.findUnique({
        where: { id: String(id) },
        include: {
          desa: true, // tampilkan desa yang ada di daerah ini
          kelompok: true, // tampilkan kelompok juga
        },
      });

      if (!daerah) {
        return response.notFound(res, "Daerah tidak ditemukan");
      }

      response.success(res, daerah, "✅ Berhasil mengambil detail daerah");
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil detail daerah");
    }
  },

  // ✏️ Update nama daerah
  async update(req: IReqUser, res: Response) {
    const { id } = req.params;
    const { name } = req.body;

    try {
      await daerahAddDTO.validate({ name });

      const daerah = await prisma.daerah.findUnique({
        where: { id: String(id) },
      });

      if (!daerah) {
        return response.notFound(res, "Daerah tidak ditemukan");
      }

      const updated = await prisma.daerah.update({
        where: { id: String(id) },
        data: { name },
      });

      response.success(res, updated, "✅ Daerah berhasil diperbarui!");
    } catch (error) {
      response.error(res, error, "❌ Gagal memperbarui daerah");
    }
  },

  // ❌ Hapus daerah
  async remove(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      await prisma.daerah.delete({
        where: { id: String(id) },
      });

      response.success(res, null, "✅ Daerah berhasil dihapus");
    } catch (error) {
      response.error(res, error, "❌ Gagal menghapus daerah");
    }
  },
  async countDaerah(req: IReqUser, res: Response) {
    try {
      const totalDaerah = await prisma.daerah.count();

      return response.success(
        res,
        { total: totalDaerah },
        `✅ Total semua daerah: ${totalDaerah}`
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal menghitung jumlah daerah");
    }
  },
};
