import { Request, Response } from "express";
import { prisma } from "../libs/prisma";
import { Semester, StatusRapor } from "@prisma/client";
import response from "../utils/response";
import * as Yup from "yup";

// DTO validasi input
const raporCreateDTO = Yup.object({
  caberawitId: Yup.number().required("caberawitId wajib diisi"),
  kelasJenjangId: Yup.string().required("kelasJenjangId wajib diisi"),
  tahunAjaran: Yup.string().required("tahunAjaran wajib diisi"),
  semester: Yup.mixed()
    .oneOf(["GANJIL", "GENAP"])
    .required("semester wajib diisi"),
  rapor: Yup.array()
    .of(
      Yup.object({
        indikatorKelasId: Yup.string().required("indikatorKelasId wajib"),
        status: Yup.string().nullable(),
        nilaiPengetahuan: Yup.number().nullable(),
        nilaiKeterampilan: Yup.number().nullable(),
      })
    )
    .required("rapor wajib diisi"),
});

export default {
  // CREATE rapor (bulk)
  async createRapor(req: Request, res: Response) {
    try {
      const payload = await raporCreateDTO.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const { caberawitId, kelasJenjangId, tahunAjaran, semester, rapor } =
        payload;

      const tahun = await prisma.tahunAjaran.findFirst({
        where: { id: tahunAjaran },
      });
      if (!tahun) return response.notFound(res, "Tahun ajaran tidak ditemukan");

      const existing = await prisma.raporGenerus.findFirst({
        where: {
          caberawitId,
          kelasJenjangId,
          tahunAjaranId: tahun.id,
          semester,
        },
      });
      if (existing)
        return response.error(res, null, "Rapor untuk kombinasi ini sudah ada");

      const createData = rapor.map((item) => {
        // tentukan status otomatis jika belum diberikan
        let status: StatusRapor;
        const nilai = item.nilaiPengetahuan ?? item.nilaiKeterampilan ?? 0;

        if (item.status) {
          status = item.status as StatusRapor; // pakai status dari payload kalau ada
        } else {
          status = nilai > 74 ? "TUNTAS" : "TIDAK_TUNTAS";
        }

        return {
          caberawitId,
          kelasJenjangId,
          indikatorKelasId: item.indikatorKelasId,
          status,
          nilaiPengetahuan: item.nilaiPengetahuan ?? null,
          nilaiKeterampilan: item.nilaiKeterampilan ?? null,
          tahunAjaranId: tahun.id,
          semester: semester as Semester,
        };
      });

      const result = await prisma.raporGenerus.createMany({ data: createData });
      return response.success(res, result, "Berhasil menambah rapor");
    } catch (error) {
      return response.error(res, error, "Gagal membuat rapor");
    }
  },
  // GET indikator by kelasJenjangId
  async getIndikatorByKelas(req: Request, res: Response) {
    try {
      const { kelasJenjangId } = req.query;
      if (!kelasJenjangId)
        return response.errors(res, null, "kelasJenjangId wajib diisi", 400);

      const indikator = await prisma.indikatorKelas.findMany({
        where: { kelasJenjangId: String(kelasJenjangId) },
        include: { rapor: true, kategoriIndikator: true },
      });

      return response.success(res, indikator, "Berhasil mengambil indikator");
    } catch (error) {
      return response.error(res, error, "Gagal mengambil indikator");
    }
  },

  // GET rapor by caberawitId + optional semester/tahunAjaranId
  async getRaporByCaberawit(req: Request, res: Response) {
    try {
      const { caberawitId, tahunAjaranId, semester } = req.query;
      if (!caberawitId)
        return response.errors(res, null, "caberawitId wajib diisi", 400);

      const rapor = await prisma.raporGenerus.findMany({
        where: {
          caberawitId: Number(caberawitId),
          ...(semester ? { semester: semester as Semester } : {}),
          ...(tahunAjaranId ? { tahunAjaranId: String(tahunAjaranId) } : {}),
        },
        include: {
          indikatorKelas: { include: { kategoriIndikator: true } },
          kelasJenjang: true,
          tahunAjaran: true,
        },
        orderBy: { createdAt: "asc" },
      });

      return response.success(res, rapor, "Berhasil mengambil rapor");
    } catch (error) {
      return response.error(res, error, "Gagal mengambil rapor");
    }
  },

  // UPDATE satu indikator
  async updateRapor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, nilaiPengetahuan, nilaiKeterampilan } = req.body;

      const existing = await prisma.raporGenerus.findUnique({ where: { id } });
      if (!existing) return response.notFound(res, "Rapor tidak ditemukan");

      const updated = await prisma.raporGenerus.update({
        where: { id },
        data: {
          status: status ?? existing.status,
          nilaiPengetahuan: nilaiPengetahuan ?? existing.nilaiPengetahuan,
          nilaiKeterampilan: nilaiKeterampilan ?? existing.nilaiKeterampilan,
        },
      });

      return response.success(res, updated, "Rapor berhasil diupdate");
    } catch (error) {
      return response.error(res, error, "Gagal update rapor");
    }
  },

  // DELETE rapor
  async deleteRapor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await prisma.raporGenerus.findUnique({ where: { id } });
      if (!existing) return response.notFound(res, "Rapor tidak ditemukan");

      await prisma.raporGenerus.delete({ where: { id } });
      return response.success(res, null, "Rapor berhasil dihapus");
    } catch (error) {
      return response.error(res, error, "Gagal menghapus rapor");
    }
  },

  async getRaporByCaberawitId(req: Request, res: Response) {
    try {
      const { caberawitId } = req.params;
      const { tahunAjaranId, semester } = req.query;

      if (!caberawitId) {
        return response.errors(res, null, "caberawitId wajib diisi", 400);
      }

      const rapor = await prisma.raporGenerus.findMany({
        where: {
          caberawitId: Number(caberawitId),
          ...(tahunAjaranId ? { tahunAjaranId: String(tahunAjaranId) } : {}),
          ...(semester ? { semester: semester as Semester } : {}),
        },
        include: {
          kelasJenjang: true,
          tahunAjaran: true,
          indikatorKelas: {
            include: {
              kategoriIndikator: {
                include: {
                  mataPelajaran: true,
                },
              },
            },
          },
        },
        orderBy: {
          indikatorKelas: {
            kategoriIndikator: {
              mataPelajaran: {
                name: "asc",
              },
            },
          },
        },
      });

      if (!rapor.length) {
        return response.success(res, [], "Rapor caberawit belum tersedia");
      }

      return response.success(res, rapor, "Berhasil mengambil rapor caberawit");
    } catch (error) {
      return response.error(res, error, "Gagal mengambil rapor caberawit");
    }
  },

  // GET rapor lengkap merge indikator (Caberawit)
  async getRaporLengkapByCaberawit(req: Request, res: Response) {
    try {
      const { caberawitId } = req.params;
      const { semester, tahunAjaranId } = req.query;

      if (!caberawitId || isNaN(Number(caberawitId)))
        return response.errors(res, null, "caberawitId harus angka valid", 400);

      const id = Number(caberawitId);

      const caberawit = await prisma.caberawit.findUnique({
        where: { id },
        include: {
          kelasJenjang: true,
          jenjang: true,
          daerah: true,
          desa: true,
          kelompok: true,
        },
      });

      if (!caberawit)
        return response.notFound(res, "Caberawit tidak ditemukan");
      if (!caberawit.kelasJenjangId)
        return response.errors(
          res,
          null,
          "Caberawit belum memiliki kelas jenjang",
          400
        );

      // Ambil indikator sesuai kelas jenjang
      const indikator = await prisma.indikatorKelas.findMany({
        where: { kelasJenjangId: caberawit.kelasJenjangId },
        include: {
          kategoriIndikator: { include: { mataPelajaran: true } },
        },
      });

      // Ambil data rapor
      const rapor = await prisma.raporGenerus.findMany({
        where: {
          caberawitId: id,
          ...(semester ? { semester: semester as Semester } : {}),
          ...(tahunAjaranId ? { tahunAjaranId: String(tahunAjaranId) } : {}),
        },
      });

      // Gabungkan indikator dengan nilai rapor
      const result = indikator.map((item) => {
        const find = rapor.find((r) => r.indikatorKelasId === item.id);
        return {
          indikatorId: item.id,
          indikator: item.indikator,
          mataPelajaran: item.kategoriIndikator.mataPelajaran?.name ?? null,
          mataPelajaranId: item.kategoriIndikator.mataPelajaran?.id ?? null,
          kategoriIndikator: item.kategoriIndikator.name,
          kategoriIndikatorId: item.kategoriIndikator.id,
          status: find?.status ?? null,
          nilaiPengetahuan: find?.nilaiPengetahuan ?? null,
          nilaiKeterampilan: find?.nilaiKeterampilan ?? null,
          raporId: find?.id ?? null,
          jenisPenilaian: item.jenisPenilaian,
          semester: item.semester,
        };
      });

      // 🔹 Group indikator berdasarkan kategoriIndikatorId
      const groupedByKategori = result.reduce((acc, curr) => {
        const key = curr.kategoriIndikatorId;
        if (!acc[key]) {
          acc[key] = {
            mataPelajaran: curr.mataPelajaran,
            mataPelajaranId: curr.mataPelajaranId,
            kategoriIndikator: curr.kategoriIndikator,
            kategoriIndikatorId: key,
            indikator: [],
          };
        }
        acc[key].indikator.push({
          indikatorId: curr.indikatorId,
          indikator: curr.indikator,
          status: curr.status,
          nilaiPengetahuan: curr.nilaiPengetahuan,
          nilaiKeterampilan: curr.nilaiKeterampilan,
          raporId: curr.raporId,
          jenisPenilaian: curr.jenisPenilaian,
          semester: curr.semester,
        });
        return acc;
      }, {} as Record<string, any>);

      const indikatorGrouped = Object.values(groupedByKategori);

      return response.success(
        res,
        { caberawit, indikator: indikatorGrouped },
        "Berhasil mengambil rapor lengkap"
      );
    } catch (error) {
      console.error(error);
      return response.error(res, error, "Gagal mengambil detail rapor");
    }
  },
};
