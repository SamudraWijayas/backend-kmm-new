import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqMumi, IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

const absenDTO = Yup.object({
  kegiatanId: Yup.string().required("ID kegiatan wajib diisi"),
  manualStatus: Yup.string()
    .oneOf(["HADIR", "TIDAK_HADIR", "TERLAMBAT"])
    .nullable(),
});

export default {
  // ✅ Absen dengan barcode
  async absen(req: IReqMumi, res: Response) {
    const { kegiatanId, manualStatus } = req.body;
    const mumiId = req.user?.id;

    if (!mumiId) {
      return response.unauthorized(res, "User MUMI tidak valid");
    }

    try {
      await absenDTO.validate({ kegiatanId, mumiId, manualStatus });

      const kegiatan = await prisma.kegiatan.findUnique({
        where: { id: kegiatanId },
      });

      if (!kegiatan) {
        return response.notFound(res, "Kegiatan tidak ditemukan");
      }

      const existing = await prisma.absenGenerus.findFirst({
        where: { kegiatanId, mumiId },
      });

      if (existing) {
        return response.notFound(
          res,
          `Kamu sudah melakukan absen`
        );
      }

      const now = new Date();
      const start = new Date(kegiatan.startDate);

      const toleransiMenit = 15;
      const batasTerlambat = new Date(start.getTime() + toleransiMenit * 60000);

      let statusFinal = manualStatus;

      if (!manualStatus) {
        statusFinal = now <= batasTerlambat ? "HADIR" : "TERLAMBAT";
      }

      const absen = await prisma.absenGenerus.create({
        data: {
          kegiatanId,
          mumiId,
          status: statusFinal,
          waktuAbsen: now,
        },
      });

      response.success(
        res,
        absen,
        `Absensi kamu berhasil! Status kehadiran: ${statusFinal}`
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
