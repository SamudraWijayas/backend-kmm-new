import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqMumi, IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

// ✅ Validasi input
const kegiatanAddDTO = Yup.object({
  name: Yup.string().required("Nama kegiatan wajib diisi"),
  startDate: Yup.date().required("Tanggal mulai wajib diisi"),
  endDate: Yup.date().required("Tanggal akhir wajib diisi"),

  tingkat: Yup.string()
    .oneOf(["DAERAH", "DESA", "KELOMPOK"])
    .required("Tingkat wajib diisi"),

  targetType: Yup.string()
    .oneOf(["JENJANG", "MAHASISWA", "USIA"])
    .required("Target kegiatan wajib diisi"),

  jenisKelamin: Yup.string()
    .oneOf(["LAKI_LAKI", "PEREMPUAN", "SEMUA"])
    .default("SEMUA"),

  daerahId: Yup.string().nullable(),
  desaId: Yup.string().nullable(),
  kelompokId: Yup.string().nullable(),

  jenjangIds: Yup.array().of(Yup.string()),
  minUsia: Yup.number().nullable(),
  maxUsia: Yup.number().nullable(),
});

export default {
  // ✅ Tambah kegiatan baru
  async addKegiatan(req: IReqUser, res: Response) {
    const {
      name,
      startDate,
      endDate,
      tingkat,
      targetType,
      jenisKelamin = "SEMUA",
      daerahId,
      desaId,
      kelompokId,
      jenjangIds = [],
      minUsia,
      maxUsia,
    } = req.body;

    try {
      await kegiatanAddDTO.validate(req.body);

      // 🔒 Validasi wilayah
      if (tingkat === "DAERAH" && !daerahId)
        return response.error(res, null, "daerahId wajib diisi");
      if (tingkat === "DESA" && !desaId)
        return response.error(res, null, "desaId wajib diisi");
      if (tingkat === "KELOMPOK" && !kelompokId)
        return response.error(res, null, "kelompokId wajib diisi");

      // 🔒 Validasi target
      if (targetType === "JENJANG" && jenjangIds.length === 0)
        return response.error(res, null, "Jenjang wajib dipilih");

      if (targetType === "USIA" && (minUsia == null || maxUsia == null))
        return response.error(res, null, "Range usia wajib diisi");

      const kegiatan = await prisma.kegiatan.create({
        data: {
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          tingkat,
          targetType,
          jenisKelamin,
          daerahId: daerahId ?? null,
          desaId: desaId ?? null,
          kelompokId: kelompokId ?? null,
          minUsia: targetType === "USIA" ? minUsia : null,
          maxUsia: targetType === "USIA" ? maxUsia : null,

          sasaran:
            targetType === "JENJANG"
              ? { create: jenjangIds.map((id: string) => ({ jenjangId: id })) }
              : undefined,
        },
        include: {
          sasaran: { include: { jenjang: true } },
        },
      });

      response.success(res, kegiatan, "✅ Berhasil menambahkan kegiatan");
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
        "✅ Berhasil mengambil semua kegiatan",
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

      // 🔹 Ambil jenjang jika target = JENJANG
      const jenjangIds =
        kegiatan.targetType === "JENJANG"
          ? kegiatan.sasaran.map((s) => s.jenjangId)
          : [];

      const whereMumi: any = {};

      if (kegiatan.jenisKelamin && kegiatan.jenisKelamin !== "SEMUA") {
        whereMumi.jenis_kelamin = kegiatan.jenisKelamin;
      }

      // 📍 Scope wilayah sesuai tingkat
      if (kegiatan.tingkat === "DAERAH") {
        whereMumi.daerahId = kegiatan.daerahId!;
      } else if (kegiatan.tingkat === "DESA") {
        whereMumi.desaId = kegiatan.desaId!;
      } else if (kegiatan.tingkat === "KELOMPOK") {
        whereMumi.kelompokId = kegiatan.kelompokId!;
      }

      // 🎯 TARGET FILTER
      if (kegiatan.targetType === "JENJANG") {
        whereMumi.jenjangId = { in: jenjangIds };
      }

      if (kegiatan.targetType === "MAHASISWA") {
        whereMumi.mahasiswa = true;
      }

      if (kegiatan.targetType === "USIA") {
        const today = new Date();

        const tglLahirFilter: any = {};

        // batas usia tertua (maxUsia)
        if (kegiatan.maxUsia !== null && kegiatan.maxUsia !== undefined) {
          const tanggalLahirMin = new Date(today);
          tanggalLahirMin.setFullYear(today.getFullYear() - kegiatan.maxUsia);
          tglLahirFilter.gte = tanggalLahirMin;
        }

        // batas usia termuda (minUsia)
        if (kegiatan.minUsia !== null && kegiatan.minUsia !== undefined) {
          const tanggalLahirMax = new Date(today);
          tanggalLahirMax.setFullYear(today.getFullYear() - kegiatan.minUsia);
          tglLahirFilter.lte = tanggalLahirMax;
        }

        whereMumi.tgl_lahir = tglLahirFilter;
      }

      // 📦 Ambil peserta
      const mumiList = await prisma.mumi.findMany({
        where: whereMumi,
        include: {
          jenjang: true,
          daerah: true,
          desa: true,
          kelompok: true,
        },
      });

      // 🔍 Ambil absensi
      const absensi = await prisma.absenGenerus.findMany({
        where: { kegiatanId: kegiatan.id },
        select: {
          mumiId: true,
          status: true,
          waktuAbsen: true,
        },
      });

      // 🧠 Gabungkan absensi
      const pesertaDenganStatus = mumiList.map((m) => {
        const absen = absensi.find((a) => a.mumiId === m.id);
        return {
          ...m,
          status: absen ? absen.status : "TIDAK_HADIR",
          waktuAbsen: absen ? absen.waktuAbsen : null,
        };
      });

      response.success(
        res,
        { kegiatan, peserta: pesertaDenganStatus },
        "✅ Berhasil mengambil kegiatan & peserta wajib",
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
          "daerahId wajib diisi untuk kegiatan daerah",
        );
      }
      if (tingkat === "DESA" && !desaId) {
        return response.error(
          res,
          null,
          "desaId wajib diisi untuk kegiatan desa",
        );
      }
      if (tingkat === "KELOMPOK" && !kelompokId) {
        return response.error(
          res,
          null,
          "kelompokId wajib diisi untuk kegiatan kelompok",
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
      // await prisma.kegiatanSasaran.deleteMany({
      //   where: { kegiatanId: String(id) },
      // });

      await prisma.kegiatan.delete({
        where: { id: String(id) },
      });

      response.success(res, null, "✅ Kegiatan berhasil dihapus");
    } catch (error) {
      response.error(res, error, "❌ Gagal menghapus kegiatan");
    }
  },

  // login generus

  async findByDaerah(req: IReqMumi, res: Response) {
    try {
      const daerahId = req.user?.daerahId;
      const userJenjangId = req.user?.jenjangId;
      const { tanggal } = req.query; // ambil dari query params, misal ?tanggal=2025-12-24T00:31:00.000Z

      if (!daerahId) {
        return response.notFound(res, "User tidak memiliki daerah terkait");
      }
      if (!userJenjangId) {
        return response.notFound(res, "User tidak memiliki jenjang terkait");
      }

      const whereClause: any = {
        daerahId: daerahId,
        sasaran: {
          some: {
            jenjangId: userJenjangId,
          },
        },
      };

      if (tanggal) {
        const tgl = new Date(tanggal as string);
        const startOfDay = new Date(tgl);
        startOfDay.setHours(0, 0, 0, 0); // 00:00:00
        const endOfDay = new Date(tgl);
        endOfDay.setHours(23, 59, 59, 999); // 23:59:59

        whereClause.startDate = { gte: startOfDay, lte: endOfDay }; // ambil semua kegiatan di tanggal itu
      }

      const kegiatanList = await prisma.kegiatan.findMany({
        where: whereClause,
        include: {
          daerah: { select: { id: true, name: true } },
          desa: { select: { id: true, name: true } },
          kelompok: { select: { id: true, name: true } },
        },
        orderBy: {
          startDate: "desc",
        },
      });

      response.success(
        res,
        kegiatanList,
        "✅ Berhasil mengambil kegiatan desa sesuai jenjang user",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil kegiatan desa");
    }
  },
  async findByDesa(req: IReqMumi, res: Response) {
    try {
      const desaId = req.user?.desaId;
      const userJenjangId = req.user?.jenjangId;
      const { tanggal } = req.query; // misal ?tanggal=2025-12-24T00:31:00.000Z

      if (!desaId) {
        return response.notFound(res, "User tidak memiliki desa terkait");
      }
      if (!userJenjangId) {
        return response.notFound(res, "User tidak memiliki jenjang terkait");
      }

      const whereClause: any = {
        desaId: desaId,
        sasaran: {
          some: {
            jenjangId: userJenjangId,
          },
        },
      };

      if (tanggal) {
        const tgl = new Date(tanggal as string);
        const startOfDay = new Date(tgl);
        startOfDay.setHours(0, 0, 0, 0); // 00:00:00
        const endOfDay = new Date(tgl);
        endOfDay.setHours(23, 59, 59, 999); // 23:59:59

        whereClause.startDate = { gte: startOfDay, lte: endOfDay }; // ambil semua kegiatan di tanggal itu
      }

      const kegiatanList = await prisma.kegiatan.findMany({
        where: whereClause,
        include: {
          daerah: { select: { id: true, name: true } },
          desa: { select: { id: true, name: true } },
          kelompok: { select: { id: true, name: true } },
          sasaran: {
            include: {
              jenjang: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { startDate: "asc" },
      });

      response.success(
        res,
        kegiatanList,
        "✅ Berhasil mengambil kegiatan desa sesuai jenjang user",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil kegiatan desa");
    }
  },

  async findAllByFilter(req: IReqUser, res: Response) {
    try {
      const { daerahId, desaId, kelompokId } = req.query;
      const where: any = {};

      if (daerahId) {
        where.daerahId = String(daerahId);
      }

      if (desaId) {
        where.desaId = String(desaId);
      }

      if (kelompokId) {
        where.kelompokId = String(kelompokId);
      }

      const kegiatanList = await prisma.kegiatan.findMany({
        where,
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
        "✅ Berhasil mengambil semua kegiatan",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar kegiatan");
    }
  },
};
