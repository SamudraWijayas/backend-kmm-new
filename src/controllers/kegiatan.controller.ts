import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqMumi, IReqUser } from "../utils/interfaces";
import * as Yup from "yup";
import uploadeDok from "../utils/uploader-dok";

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

function hitungUmur(tglLahir: Date) {
  const today = new Date();
  let umur = today.getFullYear() - tglLahir.getFullYear();
  const m = today.getMonth() - tglLahir.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < tglLahir.getDate())) {
    umur--;
  }
  return umur;
}

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
          dokumentasi: true,
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
          dokumentasi: true,
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

      function mapJenisKelaminKegiatanToMumi(value: string) {
        const map: Record<string, string> = {
          LAKI_LAKI: "Laki-laki",
          PEREMPUAN: "Perempuan",
        };

        return map[value];
      }

      if (kegiatan.jenisKelamin && kegiatan.jenisKelamin !== "SEMUA") {
        whereMumi.jenis_kelamin = mapJenisKelaminKegiatanToMumi(
          kegiatan.jenisKelamin,
        );
      }

      // if (kegiatan.jenisKelamin && kegiatan.jenisKelamin !== "SEMUA") {
      //   whereMumi.jenis_kelamin = kegiatan.jenisKelamin;
      // }

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
        if (jenjangIds.length === 0) {
          return response.success(
            res,
            { kegiatan, peserta: [] },
            "⚠️ Kegiatan ini tidak memiliki sasaran jenjang",
          );
        }

        whereMumi.jenjangId = {
          in: jenjangIds,
        };
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
      targetType,
      jenisKelamin = "SEMUA",
      daerahId,
      desaId,
      kelompokId,
      jenjangIds = [],
      minUsia,
      maxUsia,
      dokumentasi = [],
    } = req.body;

    try {
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

      // Update kegiatan
      const updated = await prisma.kegiatan.update({
        where: { id: String(id) },
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

          // Update sasaran jenjang
          sasaran: {
            deleteMany: {}, // hapus relasi lama
            create:
              targetType === "JENJANG"
                ? jenjangIds.map((id: string) => ({ jenjangId: id }))
                : [],
          },

          // Update dokumentasi langsung dari URL yang dikirim frontend
          dokumentasi: {
            deleteMany: {}, // hapus dokumentasi lama
            create: dokumentasi.map((d: { url: string }) => ({
              url: d.url,
            })),
          },
        },
        include: {
          sasaran: { include: { jenjang: true } },
          dokumentasi: true,
        },
      });

      response.success(res, updated, "✅ Berhasil memperbarui kegiatan!");
    } catch (error) {
      response.error(res, error, "❌ Gagal memperbarui kegiatan");
    }
  },

  async updateDokumentasi(req: IReqUser, res: Response) {
    const { id } = req.params;
    const { dokumentasi = [] } = req.body;

    try {
      if (!Array.isArray(dokumentasi)) {
        return response.error(res, null, "dokumentasi harus berupa array");
      }

      // 1️⃣ Ambil dokumentasi lama
      const existing = await prisma.kegiatan.findUnique({
        where: { id: String(id) },
        include: { dokumentasi: true },
      });

      if (!existing) {
        return response.error(res, null, "Data tidak ditemukan");
      }

      // 2️⃣ Hapus file lama dari storage
      for (const doc of existing.dokumentasi) {
        try {
          await uploadeDok.remove(doc.url);
        } catch (err) {
          console.warn("Gagal hapus file:", doc.url);
        }
      }

      // 3️⃣ Update DB
      const updated = await prisma.kegiatan.update({
        where: { id: String(id) },
        data: {
          dokumentasi: {
            deleteMany: {},
            create: dokumentasi.map((d: string | { url: string }) =>
              typeof d === "string" ? { url: d } : { url: d.url },
            ),
          },
        },
        include: { dokumentasi: true },
      });

      response.success(res, updated, "✅ Berhasil memperbarui dokumentasi!");
    } catch (error) {
      console.error(error);
      response.error(res, error, "❌ Gagal memperbarui dokumentasi");
    }
  },
  // ✅ Update dokumentasi kegiatan saja
  // async updateDokumentasi(req: IReqUser, res: Response) {
  //   const { id } = req.params;
  //   const { dokumentasi = [] } = req.body; // array string URL dari frontend

  //   try {
  //     if (!Array.isArray(dokumentasi)) {
  //       return response.error(res, null, "dokumentasi harus berupa array");
  //     }

  //     const updated = await prisma.kegiatan.update({
  //       where: { id: String(id) },
  //       data: {
  //         dokumentasi: {
  //           deleteMany: {}, // hapus dokumentasi lama
  //           create: dokumentasi.map((d: string | { url: string }) =>
  //             typeof d === "string" ? { url: d } : { url: d.url },
  //           ),
  //         },
  //       },
  //       include: {
  //         dokumentasi: true,
  //       },
  //     });

  //     response.success(res, updated, "✅ Berhasil memperbarui dokumentasi!");
  //   } catch (error) {
  //     console.error(error);
  //     response.error(res, error, "❌ Gagal memperbarui dokumentasi");
  //   }
  // },
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

  async findAuthMumiByDaerah(req: IReqMumi, res: Response) {
    try {
      const mumi = req.user;
      const { tanggal } = req.query;

      if (!mumi?.daerahId) {
        return response.notFound(res, "User tidak memiliki daerah terkait");
      }

      const whereKegiatan: any = {
        daerahId: mumi.daerahId,
      };

      // 📅 Filter tanggal (opsional)
      if (tanggal) {
        const tgl = new Date(tanggal as string);
        const start = new Date(tgl.setHours(0, 0, 0, 0));
        const end = new Date(tgl.setHours(23, 59, 59, 999));

        whereKegiatan.startDate = { gte: start, lte: end };
      }

      // 📦 Ambil semua kegiatan di daerah
      const kegiatanList = await prisma.kegiatan.findMany({
        where: whereKegiatan,
        include: {
          sasaran: true,
        },
        orderBy: { startDate: "desc" },
      });

      // 🧠 Filter berdasarkan TARGET
      const hasil = kegiatanList.filter((kegiatan) => {
        // 1️⃣ JENJANG
        if (kegiatan.targetType === "JENJANG") {
          return kegiatan.sasaran.some((s) => s.jenjangId === mumi.jenjangId);
        }

        // 2️⃣ MAHASISWA
        if (kegiatan.targetType === "MAHASISWA") {
          return mumi.mahasiswa === true;
        }

        // 3️⃣ USIA
        if (kegiatan.targetType === "USIA" && mumi.tgl_lahir) {
          const umur = hitungUmur(new Date(mumi.tgl_lahir));
          return (
            umur >= (kegiatan.minUsia ?? 0) && umur <= (kegiatan.maxUsia ?? 200)
          );
        }

        return false;
      });

      response.success(
        res,
        hasil,
        "✅ Berhasil mengambil kegiatan sesuai target MUMI",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil kegiatan");
    }
  },

  async findAuthMumiByDesa(req: IReqMumi, res: Response) {
    try {
      const mumi = req.user;
      const { tanggal } = req.query;

      if (!mumi?.daerahId) {
        return response.notFound(res, "User tidak memiliki daerah terkait");
      }

      const whereKegiatan: any = {
        desaId: mumi.desaId,
      };

      // 📅 Filter tanggal (opsional)
      if (tanggal) {
        const tgl = new Date(tanggal as string);
        const start = new Date(tgl.setHours(0, 0, 0, 0));
        const end = new Date(tgl.setHours(23, 59, 59, 999));

        whereKegiatan.startDate = { gte: start, lte: end };
      }

      // 📦 Ambil semua kegiatan di daerah
      const kegiatanList = await prisma.kegiatan.findMany({
        where: whereKegiatan,
        include: {
          sasaran: true,
        },
        orderBy: { startDate: "desc" },
      });

      // 🧠 Filter berdasarkan TARGET
      const hasil = kegiatanList.filter((kegiatan) => {
        // 1️⃣ JENJANG
        if (kegiatan.targetType === "JENJANG") {
          return kegiatan.sasaran.some((s) => s.jenjangId === mumi.jenjangId);
        }

        // 2️⃣ MAHASISWA
        if (kegiatan.targetType === "MAHASISWA") {
          return mumi.mahasiswa === true;
        }

        // 3️⃣ USIA
        if (kegiatan.targetType === "USIA" && mumi.tgl_lahir) {
          const umur = hitungUmur(new Date(mumi.tgl_lahir));
          return (
            umur >= (kegiatan.minUsia ?? 0) && umur <= (kegiatan.maxUsia ?? 200)
          );
        }

        return false;
      });

      response.success(
        res,
        hasil,
        "✅ Berhasil mengambil kegiatan sesuai target MUMI",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil kegiatan");
    }
  },

  async findAllByFilter(req: IReqUser, res: Response) {
    try {
      const { daerahId, desaId, kelompokId } = req.query;

      const where: any = {};

      if (daerahId) {
        where.OR = [
          // 1️⃣ Kegiatan level daerah
          {
            daerahId: String(daerahId),
          },

          // 2️⃣ Kegiatan level desa di daerah tsb
          {
            desa: {
              daerahId: String(daerahId),
            },
          },

          // 3️⃣ Kegiatan level kelompok di daerah tsb
          {
            kelompok: {
              daerahId: String(daerahId),
            },
          },
        ];
      }

      // 🔹 Filter spesifik (opsional & override)
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
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      response.success(
        res,
        kegiatanList,
        "✅ Berhasil mengambil semua kegiatan berdasarkan daerah",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar kegiatan");
    }
  },

  // async findAllByFilter(req: IReqUser, res: Response) {
  //   try {
  //     const { daerahId, desaId, kelompokId } = req.query;
  //     const where: any = {};

  //     if (daerahId) {
  //       where.daerahId = String(daerahId);
  //     }

  //     if (desaId) {
  //       where.desaId = String(desaId);
  //     }

  //     if (kelompokId) {
  //       where.kelompokId = String(kelompokId);
  //     }

  //     const kegiatanList = await prisma.kegiatan.findMany({
  //       where,
  //       include: {
  //         daerah: { select: { id: true, name: true } },
  //         desa: { select: { id: true, name: true } },
  //         kelompok: { select: { id: true, name: true } },
  //         sasaran: {
  //           select: {
  //             jenjang: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //       orderBy: { createdAt: "desc" },
  //     });

  //     response.success(
  //       res,
  //       kegiatanList,
  //       "✅ Berhasil mengambil semua kegiatan",
  //     );
  //   } catch (error) {
  //     response.error(res, error, "❌ Gagal mengambil daftar kegiatan");
  //   }
  // },
};
