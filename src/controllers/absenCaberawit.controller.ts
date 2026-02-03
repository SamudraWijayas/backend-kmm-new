import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

/* =========================
   🔒 HELPER VALIDASI HARI
========================= */
function validateTanggal(tanggal: Date) {
  const day = tanggal.getDay(); // 0 = Minggu
  if (day === 0) {
    throw new Error("Absensi caberawit tidak boleh hari Minggu");
  }
}

/* =========================
   ✅ DTO
========================= */
const absenDTO = Yup.object({
  caberawitId: Yup.number().required(),
  tanggal: Yup.date().required(),
  status: Yup.string().oneOf(["HADIR", "IZIN", "SAKIT", "ALPA"]).required(),
});

export default {
  /* =========================
     🟢 ABSEN 1 ANAK (SEHARI)
  ========================= */
  async absen(req: IReqUser, res: Response) {
    const { caberawitId, tanggal, status } = req.body;

    try {
      await absenDTO.validate({ caberawitId, tanggal, status });

      const tanggalAbsen = new Date(tanggal);
      validateTanggal(tanggalAbsen);

      // pastikan caberawit ada
      const caberawit = await prisma.caberawit.findUnique({
        where: { id: caberawitId },
      });
      if (!caberawit)
        return response.notFound(res, "Caberawit tidak ditemukan");

      // upsert = bisa create / edit
      const data = await prisma.absenCaberawit.upsert({
        where: {
          caberawit_tanggal_unique: {
            caberawitId,
            tanggal: tanggalAbsen,
          },
        },

        create: {
          caberawitId,
          tanggal: tanggalAbsen,
          status,
        },
        update: {
          status,
        },
        include: {
          caberawit: true,
        },
      });

      response.success(res, data, "✅ Absensi caberawit berhasil disimpan");
    } catch (error) {
      response.error(res, error, "❌ Gagal menyimpan absensi caberawit");
    }
  },

  /* =========================
     🟢 ABSEN MASSAL (1 TANGGAL)
  ========================= */
  async absenMassal(req: IReqUser, res: Response) {
    const { tanggal, list } = req.body;
    // list = [{ caberawitId, status }]

    try {
      const tanggalAbsen = new Date(tanggal);
      validateTanggal(tanggalAbsen);

      if (!Array.isArray(list) || list.length === 0) {
        return response.notFound(res, "Data absensi kosong");
      }

      const ops = list.map((item) =>
        prisma.absenCaberawit.upsert({
          where: {
            caberawit_tanggal_unique: {
              caberawitId: item.caberawitId,
              tanggal: tanggalAbsen,
            },
          },
          create: {
            caberawitId: item.caberawitId,
            tanggal: tanggalAbsen,
            status: item.status || "ALPA",
          },
          update: {
            status: item.status || "ALPA",
          },
        }),
      );

      await prisma.$transaction(ops);

      response.success(
        res,
        null,
        "✅ Absensi caberawit massal berhasil disimpan",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal menyimpan absensi massal");
    }
  },

  /* =========================
     🔵 GET ABSENSI PER TANGGAL
  ========================= */
  async findByTanggal(req: IReqUser, res: Response) {
    const { tanggal, kelompokId } = req.query;

    try {
      if (!tanggal) return response.notFound(res, "Tanggal wajib diisi");

      const data = await prisma.absenCaberawit.findMany({
        where: {
          tanggal: new Date(String(tanggal)),
          caberawit: kelompokId
            ? { kelompokId: String(kelompokId) }
            : undefined,
        },
        include: {
          caberawit: {
            include: {
              kelompok: true,
            },
          },
        },
        orderBy: {
          caberawit: { nama: "asc" },
        },
      });

      response.success(res, data, "✅ Data absensi berhasil diambil");
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil data absensi");
    }
  },

  /* =========================
     🔴 DELETE ABSENSI
  ========================= */
  async remove(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      await prisma.absenCaberawit.delete({
        where: { id },
      });

      response.success(res, null, "✅ Absensi berhasil dihapus");
    } catch (error) {
      response.error(res, error, "❌ Gagal menghapus absensi");
    }
  },

  async findByCaberawitBulanan(req: IReqUser, res: Response) {
    try {
      const { caberawitId } = req.params; // wajib
      let { bulan, tahun } = req.query; // optional

      if (!caberawitId)
        return response.notFound(res, "caberawitId wajib diisi");

      // default bulan & tahun = sekarang
      const now = new Date();
      const month = bulan ? Number(bulan) : now.getMonth() + 1; // 1–12
      const year = tahun ? Number(tahun) : now.getFullYear();

      if (month < 1 || month > 12)
        return response.error(res, null, "Bulan tidak valid");

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const data = await prisma.absenCaberawit.findMany({
        where: {
          caberawitId: Number(caberawitId),
          tanggal: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { tanggal: "asc" },
      });

      response.success(
        res,
        data,
        "✅ Data absensi caberawit bulanan berhasil diambil",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil absensi bulanan");
    }
  },

  /* =========================
   🔵 GET REKAP ABSENSI CABERAWIT
========================= */
  async getRekapByCaberawit(req: IReqUser, res: Response) {
    try {
      const { caberawitId } = req.params;

      if (!caberawitId) {
        return response.notFound(res, "caberawitId wajib diisi");
      }

      const data = await prisma.absenCaberawit.groupBy({
        by: ["status"],
        where: {
          caberawitId: Number(caberawitId),
        },
        _count: {
          status: true,
        },
      });

      // default value biar ga undefined
      const result = {
        HADIR: 0,
        IZIN: 0,
        SAKIT: 0,
        ALPA: 0,
        TOTAL: 0,
      };

      data.forEach((item) => {
        result[item.status as keyof typeof result] = item._count.status;
        result.TOTAL += item._count.status;
      });

      response.success(
        res,
        result,
        "✅ Rekap absensi caberawit berhasil diambil",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil rekap absensi caberawit");
    }
  },
};
