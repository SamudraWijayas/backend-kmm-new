import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

// ✅ Schema validasi Yup
const mapelAddDTO = Yup.object({
  name: Yup.string().required("Nama mapel wajib diisi"),
});

export default {
  // 🟢 Tambah mapel
  async addmapel(req: IReqUser, res: Response) {
    const { name } = req.body;

    try {
      await mapelAddDTO.validate({ name });

      const existing = await prisma.mataPelajaran.findUnique({
        where: { name },
      });

      if (existing) {
        return response.conflict(res, "Nama mapel sudah terdaftar");
      }

      const newMapel = await prisma.mataPelajaran.create({
        data: { name },
      });

      response.success(res, newMapel, "Berhasil menambahkan Mapel!");
    } catch (error) {
      response.error(res, error, "Gagal menambahkan Mapel");
    }
  },

  // 🟡 Ambil semua Mapel
  async findAll(req: IReqUser, res: Response) {
    try {
      const mapelList = await prisma.mataPelajaran.findMany({
        orderBy: { createdAt: "desc" },
      });

      response.success(res, mapelList, "✅ Berhasil mengambil semua mapel");
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar mapel");
    }
  },
  async update(req: IReqUser, res: Response) {
    const { id } = req.params;
    const { name } = req.body;

    try {
      await mapelAddDTO.validate({ name });

      const existing = await prisma.mataPelajaran.findUnique({
        where: { id: String(id) },
      });

      if (!existing) {
        return response.notFound(res, "mapel tidak ditemukan");
      }

      const updated = await prisma.mataPelajaran.update({
        where: { id: String(id) },
        data: { name },
      });

      response.success(res, updated, "✅ mapel berhasil diperbarui!");
    } catch (error) {
      response.error(res, error, "❌ Gagal memperbarui mapel");
    }
  },
  // 🔴 Hapus mapel
  async remove(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      await prisma.mataPelajaran.delete({
        where: { id: String(id) },
      });

      response.success(res, null, "✅ mapel berhasil dihapus");
    } catch (error) {
      response.error(res, error, "❌ Gagal menghapus mapel");
    }
  },
};
