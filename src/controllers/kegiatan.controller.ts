import { Response } from "express";
import { prisma } from "../utils/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

// ✅ Validasi input
const kegiatanAddDTO = Yup.object({
  name: Yup.string().required("Nama kegiatan wajib diisi"),
  startDate: Yup.date().required("Tanggal mulai wajib diisi"),
  endDate: Yup.date().required("Tanggal akhir wajib diisi"),
  tingkat: Yup.string()
    .oneOf(["DAERAH", "DESA", "KELOMPOK"])
    .required("Tingkat wajib diisi"),
  daerahId: Yup.string().nullable(),
  desaId: Yup.string().nullable(),
  kelompokId: Yup.string().nullable(),
  jenjangIds: Yup.array()
    .of(Yup.string())
    .min(1, "Minimal pilih satu jenjang sasaran"),
});

export default {
  // ✅ Tambah kegiatan baru
  async addKegiatan(req: IReqUser, res: Response) {
    const {
      name,
      startDate,
      endDate,
      tingkat,
      daerahId,
      desaId,
      kelompokId,
      jenjangIds,
    } = req.body;

    try {
      await kegiatanAddDTO.validate({
        name,
        startDate,
        endDate,
        tingkat,
        daerahId,
        desaId,
        kelompokId,
        jenjangIds,
      });

      // Validasi tingkat
      if (tingkat === "DAERAH" && !daerahId) {
        return response.error(
          res,
          null,
          "daerahId wajib diisi untuk kegiatan daerah"
        );
      }
      if (tingkat === "DESA" && !desaId) {
        return response.error(
          res,
          null,
          "desaId wajib diisi untuk kegiatan desa"
        );
      }
      if (tingkat === "KELOMPOK" && !kelompokId) {
        return response.error(
          res,
          null,
          "kelompokId wajib diisi untuk kegiatan kelompok"
        );
      }

      // Simpan ke database
      const kegiatan = await prisma.kegiatan.create({
        data: {
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          tingkat,
          daerahId: daerahId ?? null,
          desaId: desaId ?? null,
          kelompokId: kelompokId ?? null,
          sasaran: {
            create: jenjangIds.map((id: string) => ({ jenjangId: id })),
          },
        },
        include: {
          sasaran: { include: { jenjang: true } },
        },
      });

      response.success(res, kegiatan, "✅ Berhasil menambahkan kegiatan!");
    } catch (error) {
      response.error(res, error, "❌ Gagal menambahkan kegiatan");
    }
  },

  // ✅ Ambil semua kegiatan
  async findAll(req: IReqUser, res: Response) {
    try {
      const kegiatanList = await prisma.kegiatan.findMany({
        include: {
          daerah: { select: { id: true, name: true } },
          desa: { select: { id: true, name: true } },
          kelompok: { select: { id: true, name: true } },
          sasaran: {
            select: {
              jenjang: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      response.success(
        res,
        kegiatanList,
        "✅ Berhasil mengambil semua kegiatan"
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar kegiatan");
    }
  },

  // ✅ Ambil satu kegiatan berdasarkan ID
  async findOne(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      const kegiatan = await prisma.kegiatan.findUnique({
        where: { id: String(id) },
        include: {
          daerah: true,
          desa: true,
          kelompok: true,
          sasaran: { include: { jenjang: true } },
        },
      });

      if (!kegiatan) {
        return response.notFound(res, "Kegiatan tidak ditemukan");
      }

      const jenjangIds = kegiatan.sasaran.map((s) => s.jenjangId);
      let mumiList: Awaited<ReturnType<typeof prisma.mumi.findMany>> = [];

      // 🩵 Tentukan scope peserta sesuai tingkat kegiatan
      if (kegiatan.tingkat === "DAERAH") {
        mumiList = await prisma.mumi.findMany({
          where: {
            daerahId: kegiatan.daerahId!,
            jenjangId: { in: jenjangIds },
          },
          include: {
            jenjang: true,
            daerah: true,
            desa: true,
            kelompok: true,
          },
        });
      } else if (kegiatan.tingkat === "DESA") {
        mumiList = await prisma.mumi.findMany({
          where: {
            desaId: kegiatan.desaId!,
            jenjangId: { in: jenjangIds },
          },
          include: {
            jenjang: true,
            daerah: true,
            desa: true,
            kelompok: true,
          },
        });
      } else if (kegiatan.tingkat === "KELOMPOK") {
        mumiList = await prisma.mumi.findMany({
          where: {
            kelompokId: kegiatan.kelompokId!,
            jenjangId: { in: jenjangIds },
          },
          include: {
            jenjang: true,
            daerah: true,
            desa: true,
            kelompok: true,
          },
        });
      }

      // 🔍 Ambil data absensi semua peserta untuk kegiatan ini
      const absensi = await prisma.absenGenerus.findMany({
        where: { kegiatanId: kegiatan.id },
        select: {
          mumiId: true,
          status: true,
          waktuAbsen: true,
        },
      });

      // 🧠 Gabungkan peserta dengan status absensinya
      const pesertaDenganStatus = mumiList.map((m: any) => {
        const absen = absensi.find((a) => a.mumiId === m.id);
        return {
          ...m,
          status: absen ? absen.status : "BELUM HADIR",
          waktuAbsen: absen ? absen.waktuAbsen : null,
        };
      });

      response.success(
        res,
        { kegiatan, peserta: pesertaDenganStatus },
        "✅ Berhasil mengambil kegiatan & peserta wajib"
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil kegiatan");
    }
  },
  // ✅ Update kegiatan
  async update(req: IReqUser, res: Response) {
    const { id } = req.params;
    const {
      name,
      startDate,
      endDate,
      tingkat,
      daerahId,
      desaId,
      kelompokId,
      jenjangIds,
    } = req.body;

    try {
      await kegiatanAddDTO.validate({
        name,
        startDate,
        endDate,
        tingkat,
        daerahId,
        desaId,
        kelompokId,
        jenjangIds,
      });

      // Validasi tingkat
      if (tingkat === "DAERAH" && !daerahId) {
        return response.error(
          res,
          null,
          "daerahId wajib diisi untuk kegiatan daerah"
        );
      }
      if (tingkat === "DESA" && !desaId) {
        return response.error(
          res,
          null,
          "desaId wajib diisi untuk kegiatan desa"
        );
      }
      if (tingkat === "KELOMPOK" && !kelompokId) {
        return response.error(
          res,
          null,
          "kelompokId wajib diisi untuk kegiatan kelompok"
        );
      }

      // Update data kegiatan + hapus relasi lama dulu
      const updated = await prisma.kegiatan.update({
        where: { id: String(id) },
        data: {
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          tingkat,
          daerahId: daerahId ?? null,
          desaId: desaId ?? null,
          kelompokId: kelompokId ?? null,
          sasaran: {
            deleteMany: {}, // hapus relasi lama
            create: jenjangIds.map((id: string) => ({ jenjangId: id })),
          },
        },
        include: {
          sasaran: { include: { jenjang: true } },
        },
      });

      response.success(res, updated, "✅ Berhasil memperbarui kegiatan!");
    } catch (error) {
      response.error(res, error, "❌ Gagal memperbarui kegiatan");
    }
  },

  // ✅ Hapus kegiatan
  async remove(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      await prisma.kegiatanSasaran.deleteMany({
        where: { kegiatanId: String(id) },
      });

      await prisma.kegiatan.delete({
        where: { id: String(id) },
      });

      response.success(res, null, "✅ Kegiatan berhasil dihapus");
    } catch (error) {
      response.error(res, error, "❌ Gagal menghapus kegiatan");
    }
  },
};
