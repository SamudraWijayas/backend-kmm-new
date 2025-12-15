import { Response } from "express";
import { prisma } from "../utils/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

// 🧩 Validasi input untuk tambah Kelompok
const kelompokAddDTO = Yup.object({
  name: Yup.string().required("Nama kelompok wajib diisi"),
  daerahId: Yup.string().required("Daerah wajib diisi"),
  desaId: Yup.string().required("Desa wajib diisi"),
});

export default {
  // 🟢 Tambah kelompok
  async addKelompok(req: IReqUser, res: Response) {
    try {
      const payload = await kelompokAddDTO.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const { name, daerahId, desaId } = payload;

      // ✅ Pastikan daerah ada
      const daerah = await prisma.daerah.findUnique({
        where: { id: daerahId },
      });

      if (!daerah) {
        return response.notFound(res, "Daerah tidak ditemukan");
      }

      // pastikan desa ada
      const desa = await prisma.desa.findUnique({
        where: { id: desaId },
      });
      if (!desa) {
        return response.notFound(res, "Desa tidak ditemukan");
      }

      // ✅ Cek duplikat nama kelompok dalam daerah yang sama
      const existing = await prisma.kelompok.findFirst({
        where: {
          name,
          daerahId,
          desaId,
        },
      });

      if (existing) {
        return response.conflict(
          res,
          "Nama kelompok sudah terdaftar di daerah ini"
        );
      }

      // ✅ Simpan data
      const newKelompok = await prisma.kelompok.create({
        data: {
          name,
          daerahId,
          desaId,
        },
        include: {
          daerah: true,
          desa: true,
        },
      });

      return response.success(
        res,
        newKelompok,
        "✅ Berhasil menambahkan kelompok!"
      );
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return response.error(res, error, "❌ Validasi gagal");
      }

      response.error(res, error, "❌ Gagal menambahkan kelompok");
    }
  },

  // 🟡 Ambil daftar kelompok (dengan pagination & filter)
  async findAll(req: IReqUser, res: Response) {
    try {
      const { limit = 100, page = 1, search, daerahId, desaId } = req.query;

      const where: any = {};

      if (search) {
        where.name = { contains: String(search), mode: "insensitive" };
      }

      if (daerahId) {
        where.daerahId = String(daerahId);
      }

      if (desaId) {
        where.desaId = String(desaId);
      }

      const kelompokList = await prisma.kelompok.findMany({
        where,
        include: {
          daerah: {
            select: {
              id: true,
              name: true,
            },
          },
          desa: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: +limit,
        skip: (+page - 1) * +limit,
      });

      const total = await prisma.kelompok.count({ where });

      return response.pagination(
        res,
        kelompokList,
        {
          current: +page,
          total,
          totalPages: Math.ceil(total / +limit),
        },
        "✅ Berhasil mengambil daftar kelompok"
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar kelompok");
    }
  },

  // 🔵 Detail kelompok
  async findOne(req: IReqUser, res: Response) {
    const { id } = req.params;
    try {
      const kelompok = await prisma.kelompok.findUnique({
        where: { id: String(id) },
        include: { daerah: true, desa: true },
      });

      if (!kelompok) {
        return response.notFound(res, "kelompok tidak ditemukan");
      }

      response.success(res, kelompok, "✅ Detail kelompok ditemukan");
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil detail kelompok");
    }
  },
  // 🟣 Update kelompok
  async update(req: IReqUser, res: Response) {
    const { id } = req.params;
    try {
      const payload = await kelompokAddDTO.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const { name, daerahId, desaId } = payload;

      // ✅ Pastikan kelompok ada
      const kelompok = await prisma.kelompok.findUnique({
        where: { id: String(id) },
      });
      if (!kelompok) return response.notFound(res, "kelompok tidak ditemukan");

      // ✅ Pastikan daerah tujuan valid
      const daerah = await prisma.daerah.findUnique({
        where: { id: daerahId },
      });
      if (!daerah) return response.notFound(res, "Daerah tidak ditemukan");

      // ✅ Pastikan desa tujuan valid
      const desa = await prisma.desa.findUnique({
        where: { id: desaId },
      });
      if (!desa) return response.notFound(res, "Desa tidak ditemukan");

      // ✅ Cek duplikat nama di daerah yang sama (kecuali dirinya sendiri)
      const existing = await prisma.kelompok.findFirst({
        where: {
          name,
          daerahId,
          desaId,
          NOT: { id: String(id) },
        },
      });
      if (existing)
        return response.conflict(
          res,
          "Nama kelompok sudah terdaftar di daerah ini"
        );

      // ✅ Update data
      const updated = await prisma.kelompok.update({
        where: { id: String(id) },
        data: { name, daerahId, desaId },
        include: { daerah: true, desa: true },
      });

      response.success(res, updated, "✅ kelompok berhasil diperbarui!");
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return response.error(res, error, "❌ Validasi gagal");
      }
      response.error(res, error, "❌ Gagal memperbarui kelompok");
    }
  },
  // 🟠 Hapus kelompok
  async remove(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      const existing = await prisma.kelompok.findUnique({
        where: { id: String(id) },
      });

      if (!existing) {
        return response.notFound(res, "kelompok tidak ditemukan");
      }

      await prisma.kelompok.delete({
        where: { id: String(id) },
      });

      response.success(res, null, "✅ kelompok berhasil dihapus");
    } catch (error) {
      response.error(res, error, "❌ Gagal menghapus kelompok");
    }
  },
  async countKelompok(req: IReqUser, res: Response) {
    try {
      const totalKelompok = await prisma.kelompok.count();

      return response.success(
        res,
        { total: totalKelompok },
        `✅ Total semua kelompok: ${totalKelompok}`
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal menghitung jumlah kelompok");
    }
  },
};
