import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

// 🧩 Validasi input untuk tambah Desa
const desaAddDTO = Yup.object({
  name: Yup.string().required("Nama desa wajib diisi"),
  daerahId: Yup.string().required("Daerah wajib diisi"),
});

export default {
  // 🟢 Tambah Desa
  async addDesa(req: IReqUser, res: Response) {
    try {
      const payload = await desaAddDTO.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const { name, daerahId } = payload;

      // ✅ Pastikan daerah ada
      const daerah = await prisma.daerah.findUnique({
        where: { id: daerahId },
      });

      if (!daerah) {
        return response.notFound(res, "Daerah tidak ditemukan");
      }

      // ✅ Cek duplikat nama desa dalam daerah yang sama
      const existing = await prisma.desa.findFirst({
        where: {
          name,
          daerahId,
        },
      });

      if (existing) {
        return response.conflict(
          res,
          "Nama desa sudah terdaftar di daerah ini",
        );
      }

      // ✅ Simpan data
      const newDesa = await prisma.desa.create({
        data: {
          name,
          daerahId,
        },
        include: {
          daerah: true,
        },
      });

      return response.success(res, newDesa, "✅ Berhasil menambahkan desa!");
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return response.error(res, error, "❌ Validasi gagal");
      }

      response.error(res, error, "❌ Gagal menambahkan desa");
    }
  },

  // 🟡 Ambil daftar Desa (dengan pagination & filter)
  async findAll(req: IReqUser, res: Response) {
    try {
      const { limit = 15, page = 1, search, daerahId } = req.query;

      const where: any = {};

      if (search) {
        where.name = { contains: search };
      }

      // Filter berdasarkan daerahId
      if (daerahId) {
        where.daerahId = String(daerahId);
      }

      // Ambil data desa dengan urutan paling lama di atas (ascending)
      const desaList = await prisma.desa.findMany({
        where,
        include: {
          daerah: true,
        },
        orderBy: { createdAt: "asc" }, // ⬅️ dari yang paling lama ke terbaru
        take: +limit,
        skip: (+page - 1) * +limit,
      });

      // Hitung total data
      const total = await prisma.desa.count({ where });

      return response.pagination(
        res,
        desaList,
        {
          current: +page,
          total,
          totalPages: Math.ceil(total / +limit),
        },
        "✅ Berhasil mengambil daftar desa",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar desa");
    }
  },

  async findByDaerah(req: IReqUser, res: Response) {
    try {
      const { daerahId } = req.params;
      const { limit = 15, page = 1, search } = req.query;

      if (!daerahId) {
        return response.error(res, null, "❌ daerahId wajib diisi");
      }

      // ✅ Pastikan daerah ada
      const daerah = await prisma.daerah.findUnique({
        where: { id: String(daerahId) },
      });

      if (!daerah) {
        return response.notFound(res, "Daerah tidak ditemukan");
      }

      const where: any = {
        daerahId: String(daerahId),
      };

      if (search) {
        where.name = { contains: String(search) };
      }

      const desaList = await prisma.desa.findMany({
        where,
        orderBy: { createdAt: "asc" },
        take: +limit,
        skip: (+page - 1) * +limit,
      });

      const total = await prisma.desa.count({ where });

      return response.pagination(
        res,
        desaList,
        {
          current: +page,
          total,
          totalPages: Math.ceil(total / +limit),
        },
        `✅ Berhasil mengambil desa di daerah ${daerah.name}`,
      );
    } catch (error) {
      response.error(
        res,
        error,
        "❌ Gagal mengambil desa berdasarkan daerah",
      );
    }
  },
  // 🔵 Detail desa
  async findOne(req: IReqUser, res: Response) {
    const { id } = req.params;
    try {
      const desa = await prisma.desa.findUnique({
        where: { id: String(id) },
        include: { daerah: true },
      });

      if (!desa) {
        return response.notFound(res, "Desa tidak ditemukan");
      }

      response.success(res, desa, "✅ Detail desa ditemukan");
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil detail desa");
    }
  },
  // 🟣 Update Desa
  async update(req: IReqUser, res: Response) {
    const { id } = req.params;
    try {
      const payload = await desaAddDTO.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const { name, daerahId } = payload;

      // ✅ Pastikan desa ada
      const desa = await prisma.desa.findUnique({
        where: { id: String(id) },
      });
      if (!desa) return response.notFound(res, "Desa tidak ditemukan");

      // ✅ Pastikan daerah tujuan valid
      const daerah = await prisma.daerah.findUnique({
        where: { id: daerahId },
      });
      if (!daerah) return response.notFound(res, "Daerah tidak ditemukan");

      // ✅ Cek duplikat nama di daerah yang sama (kecuali dirinya sendiri)
      const existing = await prisma.desa.findFirst({
        where: {
          name,
          daerahId,
          NOT: { id: String(id) },
        },
      });
      if (existing)
        return response.conflict(
          res,
          "Nama desa sudah terdaftar di daerah ini",
        );

      // ✅ Update data
      const updated = await prisma.desa.update({
        where: { id: String(id) },
        data: { name, daerahId },
        include: { daerah: true },
      });

      response.success(res, updated, "✅ Desa berhasil diperbarui!");
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return response.error(res, error, "❌ Validasi gagal");
      }
      response.error(res, error, "❌ Gagal memperbarui desa");
    }
  },
  // 🟠 Hapus desa
  async remove(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      const existing = await prisma.desa.findUnique({
        where: { id: String(id) },
      });

      if (!existing) {
        return response.notFound(res, "Desa tidak ditemukan");
      }

      await prisma.desa.delete({
        where: { id: String(id) },
      });

      response.success(res, null, "✅ Desa berhasil dihapus");
    } catch (error) {
      response.error(res, error, "❌ Gagal menghapus desa");
    }
  },
  // 🧮 Hitung semua desa (tanpa filter)
  async countDesa(req: IReqUser, res: Response) {
    try {
      const totalDesa = await prisma.desa.count();

      return response.success(
        res,
        { total: totalDesa },
        `✅ Total semua desa: ${totalDesa}`,
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal menghitung jumlah desa");
    }
  },
  // 🧮 Hitung desa berdasarkan daerahId
  async countDesaByDaerah(req: IReqUser, res: Response) {
    try {
      const { daerahId } = req.params;

      if (!daerahId) {
        return response.error(res, null, "❌ daerahId wajib diisi");
      }

      // ✅ Pastikan daerah ada
      const daerah = await prisma.daerah.findUnique({
        where: { id: String(daerahId) },
      });

      if (!daerah) {
        return response.notFound(res, "Daerah tidak ditemukan");
      }

      const totalDesa = await prisma.desa.count({
        where: {
          daerahId: String(daerahId),
        },
      });

      return response.success(
        res,
        {
          daerahId,
          daerahNama: daerah.name,
          total: totalDesa,
        },
        `Total desa di daerah ${daerah.name}: ${totalDesa}`,
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal menghitung desa berdasarkan daerah");
    }
  },
};
