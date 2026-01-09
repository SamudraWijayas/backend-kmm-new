import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

// 🔍 Validasi input
const kelasJenjangDTO = Yup.object({
  jenjangId: Yup.string().required("Jenjang wajib dipilih"),
  name: Yup.string().required("Nama kelas wajib diisi"),
  urutan: Yup.number().nullable(),
});

export default {
  // 🟢 Tambah Kelas Jenjang
  async add(req: IReqUser, res: Response) {
    const { jenjangId, name, urutan } = req.body;

    try {
      await kelasJenjangDTO.validate({ jenjangId, name, urutan });

      // cek jenjang ada atau tidak
      const existJenjang = await prisma.jenjang.findUnique({
        where: { id: jenjangId },
      });

      if (!existJenjang) {
        return response.notFound(res, "Jenjang tidak ditemukan");
      }

      // cek nama kelas yg sama dalam satu jenjang
      const existClass = await prisma.kelasJenjang.findFirst({
        where: {
          jenjangId,
          name,
        },
      });

      if (existClass) {
        return response.conflict(
          res,
          "Nama kelas sudah terdaftar di jenjang ini"
        );
      }

      const newClass = await prisma.kelasJenjang.create({
        data: { jenjangId, name, urutan },
      });

      response.success(res, newClass, "Berhasil menambahkan kelas jenjang!");
    } catch (error) {
      response.error(res, error, "Gagal menambahkan kelas");
    }
  },

  // 🟡 Ambil semua kelas per jenjang (optional by jenjang)
  async findAll(req: IReqUser, res: Response) {
    const { jenjangId } = req.query;

    try {
      const kelas = await prisma.kelasJenjang.findMany({
        where: jenjangId ? { jenjangId: String(jenjangId) } : undefined,
        orderBy: [{ jenjangId: "asc" }, { urutan: "asc" }],
        include: {
          jenjang: true,
        },
      });

      response.success(res, kelas, "Berhasil mengambil semua kelas jenjang");
    } catch (error) {
      response.error(res, error, "Gagal mengambil kelas jenjang");
    }
  },

  // 🟦 Ambil detail kelas
  async findOne(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      const kelas = await prisma.kelasJenjang.findUnique({
        where: { id },
        include: {
          jenjang: true,
        },
      });

      if (!kelas) {
        return response.notFound(res, "Kelas jenjang tidak ditemukan");
      }

      response.success(res, kelas, "Berhasil mengambil detail kelas");
    } catch (error) {
      response.error(res, error, "Gagal mengambil detail kelas");
    }
  },

  // 🟣 Update Kelas
  async update(req: IReqUser, res: Response) {
    const { id } = req.params;
    const { name, urutan } = req.body;

    try {
      await Yup.object({
        name: Yup.string().required(),
        urutan: Yup.number().nullable(),
      }).validate({ name, urutan });

      const exist = await prisma.kelasJenjang.findUnique({
        where: { id },
      });

      if (!exist) {
        return response.notFound(res, "Kelas tidak ditemukan");
      }

      const updated = await prisma.kelasJenjang.update({
        where: { id },
        data: { name, urutan },
      });

      response.success(res, updated, "Kelas jenjang berhasil diperbarui!");
    } catch (error) {
      response.error(res, error, "Gagal memperbarui kelas jenjang");
    }
  },

  // 🔴 Hapus kelas
  async remove(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      await prisma.kelasJenjang.delete({
        where: { id },
      });

      response.success(res, null, "Kelas jenjang berhasil dihapus");
    } catch (error) {
      response.error(res, error, "Gagal menghapus kelas jenjang");
    }
  },
};
