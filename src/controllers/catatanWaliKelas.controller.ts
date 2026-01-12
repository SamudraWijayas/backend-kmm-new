import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

/* =========================
   VALIDASI
========================= */
const catatanWaliDTO = Yup.object({
  caberawitId: Yup.number().required("Caberawit wajib dipilih"),
  tahunAjaranId: Yup.string().required("Tahun ajaran wajib diisi"),
  semester: Yup.string()
    .oneOf(["GANJIL", "GENAP"])
    .required("Semester wajib diisi"),
  catatan: Yup.string().required("Catatan wajib diisi"),
});

export default {
  /* =========================
     CREATE / UPDATE
     (1 CABERAWIT = 1 CATATAN / TA / SEMESTER)
  ========================= */
  async upsert(req: IReqUser, res: Response) {
    const { caberawitId, tahunAjaranId, semester, catatan } = req.body;

    try {
      await catatanWaliDTO.validate({
        caberawitId,
        tahunAjaranId,
        semester,
        catatan,
      });

      // cek caberawit
      const caberawit = await prisma.caberawit.findUnique({
        where: { id: Number(caberawitId) },
      });
      if (!caberawit)
        return response.notFound(res, "Caberawit tidak ditemukan");

      // cek tahun ajaran
      const tahunAjaran = await prisma.tahunAjaran.findUnique({
        where: { id: tahunAjaranId },
      });
      if (!tahunAjaran)
        return response.notFound(res, "Tahun ajaran tidak ditemukan");

      const data = await prisma.catatanWaliKelas.upsert({
        where: {
          caberawitId_tahunAjaranId_semester: {
            caberawitId: Number(caberawitId),
            tahunAjaranId,
            semester,
          },
        },
        update: {
          catatan,
        },
        create: {
          caberawitId: Number(caberawitId),
          tahunAjaranId,
          semester,
          catatan,
        },
        include: {
          tahunAjaran: true,
          caberawit: {
            select: {
              id: true,
              nama: true,
              wali: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
      });

      response.success(
        res,
        data,
        "✅ Catatan wali kelas berhasil disimpan"
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal menyimpan catatan wali kelas");
    }
  },

  /* =========================
     GET SATU CATATAN
     (BUKAN ARRAY)
  ========================= */
  async get(req: IReqUser, res: Response) {
    const { caberawitId } = req.params;
    const { tahunAjaranId, semester } = req.query;

    try {
      if (!tahunAjaranId || !semester) {
        return response.errors(
          res,
          null,
          "tahunAjaranId dan semester wajib diisi",
          400
        );
      }

      const data = await prisma.catatanWaliKelas.findUnique({
        where: {
          caberawitId_tahunAjaranId_semester: {
            caberawitId: Number(caberawitId),
            tahunAjaranId: String(tahunAjaranId),
            semester: semester as any,
          },
        },
        include: {
          tahunAjaran: true,
          caberawit: {
            select: {
              id: true,
              nama: true,
              wali: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
      });

      if (!data)
        return response.notFound(
          res,
          "Catatan wali kelas belum dibuat"
        );

      response.success(
        res,
        data,
        "✅ Berhasil mengambil catatan wali kelas"
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil catatan wali kelas");
    }
  },

  /* =========================
     DELETE (OPTIONAL)
  ========================= */
  async remove(req: IReqUser, res: Response) {
    const { caberawitId } = req.params;
    const { tahunAjaranId, semester } = req.query;

    try {
      if (!tahunAjaranId || !semester) {
        return response.errors(
          res,
          null,
          "tahunAjaranId dan semester wajib diisi",
          400
        );
      }

      await prisma.catatanWaliKelas.delete({
        where: {
          caberawitId_tahunAjaranId_semester: {
            caberawitId: Number(caberawitId),
            tahunAjaranId: String(tahunAjaranId),
            semester: semester as any,
          },
        },
      });

      response.success(
        res,
        null,
        "✅ Catatan wali kelas berhasil dihapus"
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal menghapus catatan wali kelas");
    }
  },
};
