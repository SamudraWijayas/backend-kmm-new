import { Response } from "express";
import { prisma } from "../utils/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

const absenDTO = Yup.object({
  generusId: Yup.number().required("ID generus wajib diisi"),
  kegiatanId: Yup.string().required("ID kegiatan wajib diisi"),
  manualStatus: Yup.string()
    .oneOf(["HADIR", "TIDAK_HADIR", "TERLAMBAT"])
    .nullable(),
});

export default {
  // ✅ Absen dengan barcode
  async absen(req: IReqUser, res: Response) {
    const { kegiatanId, mumiId, manualStatus } = req.body;

    try {
      await absenDTO.validate({ kegiatanId, mumiId, manualStatus });

      // Ambil kegiatan untuk lihat jam mulai
      const kegiatan = await prisma.kegiatan.findUnique({
        where: { id: kegiatanId },
      });

      if (!kegiatan) {
        return response.notFound(res, "Kegiatan tidak ditemukan");
      }

      const waktuSekarang = new Date();
      const waktuMulai = new Date(kegiatan.startDate);
      const toleransiMenit = 15; // ⏱️ bisa kamu ubah sesuai kebijakan
      const batasTerlambat = new Date(
        waktuMulai.getTime() + toleransiMenit * 60000
      );

      let statusFinal = manualStatus;

      // Jika status tidak ditentukan manual → hitung otomatis
      if (!manualStatus) {
        if (waktuSekarang <= batasTerlambat) {
          statusFinal = "HADIR";
        } else {
          statusFinal = "TERLAMBAT";
        }
      }

      const existing = await prisma.absenGenerus.findFirst({
        where: { kegiatanId, mumiId },
      });

      let absen;
      if (existing) {
        absen = await prisma.absenGenerus.update({
          where: { id: existing.id },
          data: { status: statusFinal, waktuAbsen: waktuSekarang },
        });
      } else {
        absen = await prisma.absenGenerus.create({
          data: {
            kegiatanId,
            mumiId,
            status: statusFinal,
            waktuAbsen: waktuSekarang,
          },
        });
      }

      response.success(
        res,
        absen,
        `✅ Absensi berhasil — status: ${statusFinal}`
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal menyimpan absensi");
    }
  },

  // ✅ Daftar absen per kegiatan
  async findByKegiatan(req: IReqUser, res: Response) {
    const { kegiatanId } = req.params;

    try {
      const list = await prisma.absenGenerus.findMany({
        where: { kegiatanId: String(kegiatanId) },
        include: {
          mumi: {
            select: { id: true, nama: true, jenjang: true },
          },
        },
        orderBy: { waktuAbsen: "desc" },
      });

      response.success(res, list, "✅ Daftar absensi berhasil diambil");
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar absensi");
    }
  },

  // ✅ Riwayat absen per generus
  async findByGenerus(req: IReqUser, res: Response) {
    const { mumiId } = req.params;

    try {
      const riwayat = await prisma.absenGenerus.findMany({
        where: { mumiId: Number(mumiId) },
        include: {
          kegiatan: { select: { id: true, name: true, startDate: true } },
        },
        orderBy: { waktuAbsen: "desc" },
      });

      response.success(res, riwayat, "✅ Riwayat absensi berhasil diambil");
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil riwayat absensi");
    }
  },

  // ✅ Hapus absen (opsional)
  async remove(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      await prisma.absenGenerus.delete({
        where: { id: String(id) },
      });

      response.success(res, null, "✅ Absensi berhasil dihapus");
    } catch (error) {
      response.error(res, error, "❌ Gagal menghapus absensi");
    }
  },
};
