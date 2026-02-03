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
  semester: Yup.string()
    .oneOf(["GANJIL", "GENAP"])
    .required("Semester wajib diisi"),
  catatan: Yup.string().required("Catatan wajib diisi"),
});

export default {
  /* =========================
     CREATE / UPDATE
     (1 CABERAWIT = 1 CATATAN / SEMESTER)
  ========================= */
  async upsert(req: IReqUser, res: Response) {
    const { caberawitId, semester, catatan } = req.body;

    try {
      await catatanWaliDTO.validate(
        { caberawitId, semester, catatan },
        { abortEarly: false },
      );

      // cek caberawit
      const caberawit = await prisma.caberawit.findUnique({
        where: { id: Number(caberawitId) },
      });
      if (!caberawit)
        return response.notFound(res, "Caberawit tidak ditemukan");

      const data = await prisma.catatanWaliKelas.upsert({
        where: {
          caberawitId_semester: {
            caberawitId: Number(caberawitId),
            semester,
          },
        },
        update: {
          catatan,
        },
        create: {
          caberawitId: Number(caberawitId),
          semester,
          catatan,
        },
        include: {
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

      return response.success(
        res,
        data,
        "✅ Catatan wali kelas berhasil disimpan",
      );
    } catch (error) {
      return response.error(
        res,
        error,
        "❌ Gagal menyimpan catatan wali kelas",
      );
    }
  },

  /* =========================
     GET SATU CATATAN
  ========================= */
  async get(req: IReqUser, res: Response) {
    const { caberawitId } = req.params;

    try {
      const data = await prisma.catatanWaliKelas.findFirst({
        where: {
          caberawitId: Number(caberawitId),
        },
        include: {
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
        orderBy: {
          createdAt: "desc", // ambil yang terbaru (opsional tapi recommended)
        },
      });

      if (!data) {
        return response.notFound(res, "Catatan wali kelas belum dibuat");
      }

      return response.success(
        res,
        data,
        "✅ Berhasil mengambil catatan wali kelas",
      );
    } catch (error) {
      return response.error(
        res,
        error,
        "❌ Gagal mengambil catatan wali kelas",
      );
    }
  },
  /* =========================
     DELETE
  ========================= */
  async remove(req: IReqUser, res: Response) {
    const { caberawitId } = req.params;
    const { semester } = req.query;

    try {
      if (!semester) {
        return response.errors(res, null, "semester wajib diisi", 400);
      }

      await prisma.catatanWaliKelas.delete({
        where: {
          caberawitId_semester: {
            caberawitId: Number(caberawitId),
            semester: semester as any,
          },
        },
      });

      return response.success(
        res,
        null,
        "✅ Catatan wali kelas berhasil dihapus",
      );
    } catch (error) {
      return response.error(
        res,
        error,
        "❌ Gagal menghapus catatan wali kelas",
      );
    }
  },
};
