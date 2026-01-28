import { Request, Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";

export default {
  async create(req: Request, res: Response) {
    try {
      const {
        kelasJenjangId,
        kategoriIndikatorId,
        indikator,
        semester,
        jenisPenilaian,
      } = req.body;

      if (!kelasJenjangId)
        return res.status(400).json({ message: "kelasJenjangId wajib diisi" });

      if (!kategoriIndikatorId)
        return res
          .status(400)
          .json({ message: "kategoriIndikatorId wajib diisi" });

      if (!indikator)
        return res.status(400).json({ message: "indikator wajib diisi" });

      const data = await prisma.indikatorKelas.create({
        data: {
          kelasJenjangId,
          kategoriIndikatorId,
          indikator,
          semester,
          jenisPenilaian,
        },
        include: {
          kategoriIndikator: { include: { mataPelajaran: true } },
        },
      });

      response.success(res, data, "Berhasil menambah indikator");
    } catch (error) {
      response.error(res, error, "Gagal menambah indikator");
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const { kelasJenjangId, kategoriIndikatorId } = req.query;

      const where: any = {};
      if (kelasJenjangId) where.kelasJenjangId = kelasJenjangId as string;
      if (kategoriIndikatorId)
        where.kategoriIndikatorId = kategoriIndikatorId as string;

      const data = await prisma.indikatorKelas.findMany({
        where,
        include: {
          rapor: true,
          kategoriIndikator: { include: { mataPelajaran: true } },
          kelasJenjang: { include: { jenjang: true } },
        },
      });

      response.success(res, data, "Berhasil get Indikator");
    } catch (error) {
      response.error(res, error, "Gagal get Indikator");
    }
  },

  async getByJenjang(req: Request, res: Response) {
    try {
      const { jenjangId } = req.params;

      if (!jenjangId) {
        return res.status(400).json({
          meta: { status: 400, message: "jenjangId diperlukan" },
        });
      }

      const indikator = await prisma.indikatorKelas.findMany({
        where: { kelasJenjangId: jenjangId },
        include: {
          kategoriIndikator: { include: { mataPelajaran: true } },
        },
      });

      response.success(res, indikator, "Berhasil mengambil data");
    } catch (error) {
      response.error(res, error, "Gagal mengambil data");
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await prisma.indikatorKelas.findUnique({
        where: { id },
        include: {
          rapor: true,
          kategoriIndikator: { include: { mataPelajaran: true } },
        },
      });

      if (!data)
        return res.status(404).json({ message: "Indikator tidak ditemukan" });

      response.success(res, data, "Berhasil mengambil data indikator");
    } catch (error) {
      response.error(res, error, "Gagal mengambil data indikator");
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { indikator, kategoriIndikatorId, semester, jenisPenilaian } =
        req.body;

      const cek = await prisma.indikatorKelas.findUnique({ where: { id } });
      if (!cek)
        return res.status(404).json({ message: "Indikator tidak ditemukan" });

      const data = await prisma.indikatorKelas.update({
        where: { id },
        data: {
          indikator,
          kategoriIndikatorId,
          semester,
          jenisPenilaian,
        },
        include: {
          kategoriIndikator: { include: { mataPelajaran: true } },
        },
      });

      response.success(res, data, "Berhasil update indikator");
    } catch (error) {
      response.error(res, error, "Gagal update indikator");
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const cek = await prisma.indikatorKelas.findUnique({ where: { id } });
      if (!cek)
        return res.status(404).json({ message: "Indikator tidak ditemukan" });

      await prisma.indikatorKelas.delete({ where: { id } });

      response.success(res, null, "Berhasil menghapus indikator");
    } catch (error) {
      response.error(res, error, "Gagal menghapus indikator");
    }
  },
  async getByKelasJenjang(req: Request, res: Response) {
    try {
      const { kelasJenjangId } = req.params;

      if (!kelasJenjangId) {
        return response.errors(res, null, "kelasJenjangId wajib diisi", 400);
      }

      const indikator = await prisma.indikatorKelas.findMany({
        where: {
          kelasJenjangId,
        },
        include: {
          kategoriIndikator: {
            include: {
              mataPelajaran: true,
            },
          },
        },
        orderBy: [
          {
            kategoriIndikator: {
              mataPelajaran: {
                name: "asc",
              },
            },
          },
          {
            indikator: "asc",
          },
        ],
      });

      return response.success(
        res,
        indikator,
        "Berhasil mengambil indikator berdasarkan kelas jenjang",
      );
    } catch (error) {
      return response.error(
        res,
        error,
        "Gagal mengambil indikator berdasarkan kelas jenjang",
      );
    }
  },
};
