import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

// ✅ Schema validasi Yup
const jenjangAddDTO = Yup.object({
  name: Yup.string().required("Nama jenjang wajib diisi"),
});

export default {
  // 🟢 Tambah Jenjang
  async addJenjang(req: IReqUser, res: Response) {
    const { name } = req.body;

    try {
      await jenjangAddDTO.validate({ name });

      const existing = await prisma.jenjang.findUnique({
        where: { name },
      });

      if (existing) {
        return response.conflict(res, "Nama jenjang sudah terdaftar");
      }

      const newJenjang = await prisma.jenjang.create({
        data: { name },
      });

      response.success(res, newJenjang, "Berhasil menambahkan jenjang!");
    } catch (error) {
      response.error(res, error, "Gagal menambahkan jenjang");
    }
  },

  // 🟡 Ambil semua Jenjang
  async findAll(req: IReqUser, res: Response) {
    try {
      const jenjangList = await prisma.jenjang.findMany({
        orderBy: { createdAt: "desc" },
      });

      response.success(res, jenjangList, "✅ Berhasil mengambil semua jenjang");
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar jenjang");
    }
  },
  async update(req: IReqUser, res: Response) {
    const { id } = req.params;
    const { name } = req.body;

    try {
      await jenjangAddDTO.validate({ name });

      const existing = await prisma.jenjang.findUnique({
        where: { id: String(id) },
      });

      if (!existing) {
        return response.notFound(res, "Jenjang tidak ditemukan");
      }

      const updated = await prisma.jenjang.update({
        where: { id: String(id) },
        data: { name },
      });

      response.success(res, updated, "✅ Jenjang berhasil diperbarui!");
    } catch (error) {
      response.error(res, error, "❌ Gagal memperbarui jenjang");
    }
  },
  // 🔴 Hapus Jenjang
  async remove(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      await prisma.jenjang.delete({
        where: { id: String(id) },
      });

      response.success(res, null, "✅ Jenjang berhasil dihapus");
    } catch (error) {
      response.error(res, error, "❌ Gagal menghapus jenjang");
    }
  },
};
