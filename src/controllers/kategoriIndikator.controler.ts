import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

// 🔍 Validasi input
const kelasKategoriDTO = Yup.object({
  mataPelajaranId: Yup.string().required("Kategori wajib dipilih"),
  name: Yup.string().required("Nama kelas wajib diisi"),
});

export default {
  // 🟢 Tambah Kelas Kategori
  async add(req: IReqUser, res: Response) {
    const { mataPelajaranId, name } = req.body;

    try {
      await kelasKategoriDTO.validate({ mataPelajaranId, name });

      // cek MataPelajaran ada atau tidak
      const existMataPelajaran = await prisma.mataPelajaran.findUnique({
        where: { id: mataPelajaranId },
      });

      if (!existMataPelajaran) {
        return response.notFound(res, "MataPelajaran tidak ditemukan");
      }

      // cek nama kelas yg sama dalam satu MataPelajaran
      const existClass = await prisma.kategoriIndikator.findFirst({
        where: {
          mataPelajaranId,
          name,
        },
      });

      if (existClass) {
        return response.conflict(
          res,
          "Nama kelas sudah terdaftar di MataPelajaran ini"
        );
      }

      const newClass = await prisma.kategoriIndikator.create({
        data: { mataPelajaranId, name },
        include: { mataPelajaran: true },
      });

      response.success(res, newClass, "Berhasil menambahkan kelas Kategori!");
    } catch (error) {
      response.error(res, error, "Gagal menambahkan kelas");
    }
  },

  // 🟡 Ambil semua kelas per MataPelajaran (optional by MataPelajaran)
  async findAll(req: IReqUser, res: Response) {
    const { mataPelajaranId } = req.query;

    try {
      const kelas = await prisma.kategoriIndikator.findMany({
        where: mataPelajaranId
          ? { mataPelajaranId: String(mataPelajaranId) }
          : undefined,
        orderBy: [{ mataPelajaranId: "asc" }, { name: "asc" }],
        include: {
          mataPelajaran: true,
          indikator: true, // nested indikatorKelas
        },
      });

      response.success(res, kelas, "Berhasil mengambil semua kelas Kategori");
    } catch (error) {
      response.error(res, error, "Gagal mengambil kelas Kategori");
    }
  },

  // 🟦 Ambil detail kelas
  async findOne(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      const kelas = await prisma.kategoriIndikator.findUnique({
        where: { id },
        include: {
          mataPelajaran: true,
          indikator: true, // nested indikatorKelas
        },
      });

      if (!kelas) {
        return response.notFound(res, "Kelas Kategori tidak ditemukan");
      }

      response.success(res, kelas, "Berhasil mengambil detail kelas");
    } catch (error) {
      response.error(res, error, "Gagal mengambil detail kelas");
    }
  },

  // 🟣 Update Kelas
  async update(req: IReqUser, res: Response) {
    const { id } = req.params;
    const { name } = req.body;

    try {
      await Yup.object({
        name: Yup.string().required(),
      }).validate({ name });

      const exist = await prisma.kategoriIndikator.findUnique({
        where: { id },
      });

      if (!exist) {
        return response.notFound(res, "Kelas tidak ditemukan");
      }

      const updated = await prisma.kategoriIndikator.update({
        where: { id },
        data: { name },
        include: { mataPelajaran: true },
      });

      response.success(res, updated, "Kelas Kategori berhasil diperbarui!");
    } catch (error) {
      response.error(res, error, "Gagal memperbarui kelas Kategori");
    }
  },

  // 🔴 Hapus kelas
  async remove(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      // cek dulu relasi indikator, hapus atau batalkan jika ada
      const exist = await prisma.kategoriIndikator.findUnique({
        where: { id },
        include: { indikator: true },
      });

      if (!exist) {
        return response.notFound(res, "Kelas Kategori tidak ditemukan");
      }

      if (exist.indikator.length > 0) {
        return response.conflict(
          res,
          "Kelas masih memiliki indikator, hapus indikator terlebih dahulu"
        );
      }

      await prisma.kategoriIndikator.delete({
        where: { id },
      });

      response.success(res, null, "Kelas Kategori berhasil dihapus");
    } catch (error) {
      response.error(res, error, "Gagal menghapus kelas Kategori");
    }
  },
};
