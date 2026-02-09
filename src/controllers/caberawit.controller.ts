import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

// ✅ Validasi input untuk tambah Caberawit
const caberawitAddDTO = Yup.object({
  nama: Yup.string().required("Nama wajib diisi"),
  daerahId: Yup.string().required("Daerah wajib diisi"),
  desaId: Yup.string().required("Desa wajib diisi"),
  kelompokId: Yup.string().required("Kelompok wajib diisi"),
  jenjangId: Yup.string().required("Jenjang wajib diisi"),
  kelasJenjangId: Yup.string().required("kelasJenjang wajib diisi"),
  tgl_lahir: Yup.date().required("Tanggal lahir wajib diisi"),
  jenis_kelamin: Yup.string()
    .oneOf(["Laki-laki", "Perempuan"])
    .required("Jenis kelamin wajib diisi"),
  gol_darah: Yup.string().nullable(),
  nama_ortu: Yup.string().required("Nama orang tua wajib diisi"),
});

function buildRapor(rapor: any[]) {
  const result: any[] = [];
  const mapelMap = new Map();

  for (const r of rapor) {
    const indikator = r.indikatorKelas;
    const kategori = indikator.kategoriIndikator;
    const mapel = kategori.mataPelajaran;

    // 1️⃣ Mata Pelajaran
    if (!mapelMap.has(mapel.id)) {
      mapelMap.set(mapel.id, {
        id: mapel.id,
        name: mapel.name,
        kategori: new Map(),
      });
    }

    const mapelItem = mapelMap.get(mapel.id);

    // 2️⃣ Kategori
    if (!mapelItem.kategori.has(kategori.id)) {
      mapelItem.kategori.set(kategori.id, {
        id: kategori.id,
        name: kategori.name,
        indikator: [],
      });
    }

    const kategoriItem = mapelItem.kategori.get(kategori.id);

    // 3️⃣ Indikator
    kategoriItem.indikator.push({
      id: indikator.id,
      indikator: indikator.indikator,
      semester: r.semester,
      status: r.status,
      nilaiPengetahuan: r.nilaiPengetahuan,
      nilaiKeterampilan: r.nilaiKeterampilan,
    });
  }

  // convert Map → Array
  for (const mapel of mapelMap.values()) {
    mapel.kategori = Array.from(mapel.kategori.values());
    result.push(mapel);
  }

  return result;
}

export default {
  // 🟢 Tambah Generus
  async addCaberawit(req: IReqUser, res: Response) {
    const {
      nama,
      daerahId,
      desaId,
      kelompokId,
      jenjangId,
      kelasJenjangId,
      tgl_lahir,
      jenis_kelamin,
      gol_darah,
      nama_ortu,
      foto,
      waliId,
    } = req.body;

    try {
      await caberawitAddDTO.validate({
        nama,
        daerahId,
        desaId,
        kelompokId,
        jenjangId,
        kelasJenjangId,
        tgl_lahir,
        jenis_kelamin,
        gol_darah,
        nama_ortu,
        foto,
      });

      // ✅ Pastikan semua foreign key valid
      const [daerah, desa, kelompok, jenjang, wali] = await Promise.all([
        prisma.daerah.findUnique({ where: { id: daerahId } }),
        prisma.desa.findUnique({ where: { id: desaId } }),
        prisma.kelompok.findUnique({ where: { id: kelompokId } }),
        prisma.jenjang.findUnique({ where: { id: jenjangId } }),
        waliId
          ? prisma.user.findUnique({ where: { id: Number(waliId) } })
          : null,
      ]);

      if (!daerah) return response.notFound(res, "Daerah tidak ditemukan");
      if (!desa) return response.notFound(res, "Desa tidak ditemukan");
      if (!kelompok) return response.notFound(res, "Kelompok tidak ditemukan");
      if (!jenjang) return response.notFound(res, "Jenjang tidak ditemukan");
      if (waliId && !wali)
        return response.notFound(res, "Wali tidak ditemukan");

      // ✅ Simpan data
      const newCaberawit = await prisma.caberawit.create({
        data: {
          nama,
          daerahId,
          desaId,
          kelompokId,
          jenjangId,
          kelasJenjangId,
          tgl_lahir: new Date(tgl_lahir),
          jenis_kelamin,
          gol_darah,
          nama_ortu,

          foto,
          ...(waliId ? { waliId: Number(waliId) } : {}),
        },
        include: {
          daerah: true,
          desa: true,
          kelompok: true,
          jenjang: true,
          wali: true,
        },
      });

      response.success(res, newCaberawit, "✅ Caberawit berhasil ditambahkan!");
    } catch (error) {
      response.error(res, error, "❌ Gagal menambahkan Caberawit");
    }
  },

  // 🟡 Ambil semua Caberawit
  async findAll(req: IReqUser, res: Response) {
    try {
      const {
        limit = 10,
        page = 1,
        search,
        jenis_kelamin,
        minUsia,
        maxUsia,
        kelasjenjang,
        daerah,
        desa,
        kelompok,
      } = req.query;

      const where: any = {};

      // 🔍 Filter nama (search)
      if (search) {
        where.nama = { contains: search };
      }

      // 🚻 Filter jenis kelamin
      if (jenis_kelamin) {
        where.jenis_kelamin = jenis_kelamin;
      }

      // filter jenjang
      if (kelasjenjang) {
        where.kelasJenjangId = kelasjenjang;
      }

      if (daerah) {
        where.daerahId = daerah;
      }
      if (desa) {
        where.desaId = desa;
      }
      if (kelompok) {
        where.kelompokId = kelompok;
      }

      // 🎂 Filter usia (dihitung dari tgl_lahir)
      if (minUsia || maxUsia) {
        const today = new Date();

        // minUsia = usia paling muda
        // maxUsia = usia paling tua
        let tanggalLahirMin: Date | undefined; // lahir setelah (lebih muda)
        let tanggalLahirMax: Date | undefined; // lahir sebelum (lebih tua)

        if (maxUsia) {
          // contoh: maxUsia=40 → lahir setelah (hari ini - 40 tahun)
          tanggalLahirMin = new Date(today);
          tanggalLahirMin.setFullYear(today.getFullYear() - Number(maxUsia));
        }

        if (minUsia) {
          // contoh: minUsia=20 → lahir sebelum (hari ini - 20 tahun)
          tanggalLahirMax = new Date(today);
          tanggalLahirMax.setFullYear(today.getFullYear() - Number(minUsia));
        }

        where.tgl_lahir = {};
        if (tanggalLahirMin) where.tgl_lahir.gte = tanggalLahirMin;
        if (tanggalLahirMax) where.tgl_lahir.lte = tanggalLahirMax;
      }
      // console.log("Filter usia:", {
      //   minUsia,
      //   maxUsia,
      //   where_tgl_lahir: where.tgl_lahir,
      // });

      // 📦 Ambil data dari Prisma
      const list = await prisma.caberawit.findMany({
        where,
        include: {
          daerah: true,
          desa: true,
          kelompok: true,
          jenjang: true,
          kelasJenjang: true,
          wali: true,
        },
        orderBy: { createdAt: "desc" },
        take: +limit,
        skip: (+page - 1) * +limit,
      });

      const total = await prisma.caberawit.count({ where });

      return response.pagination(
        res,
        list,
        {
          current: +page,
          total,
          totalPages: Math.ceil(total / +limit),
        },
        "✅ Berhasil mengambil daftar Caberawit",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar Caberawit");
    }
  },
  async findAllByKelompok(req: IReqUser, res: Response) {
    try {
      const { kelompokId } = req.params;

      const {
        limit = 10,
        page = 1,
        search,
        jenis_kelamin,
        minUsia,
        maxUsia,
        kelasjenjang,
      } = req.query;

      // ✅ Filter utama: kelompok
      const where: any = {
        kelompokId: String(kelompokId),
      };

      // 🔍 Filter nama
      if (search) {
        where.nama = {
          contains: String(search),
          mode: "insensitive",
        };
      }

      // 🚻 Filter jenis kelamin
      if (jenis_kelamin) {
        where.jenis_kelamin = String(jenis_kelamin);
      }

      // 🎓 Filter jenjang
      if (kelasjenjang) {
        where.kelasJenjangId = String(kelasjenjang);
      }

      // 🎂 Filter usia
      if (minUsia || maxUsia) {
        const today = new Date();

        let tanggalLahirMin: Date | undefined;
        let tanggalLahirMax: Date | undefined;

        if (maxUsia) {
          tanggalLahirMin = new Date(today);
          tanggalLahirMin.setFullYear(today.getFullYear() - Number(maxUsia));
        }

        if (minUsia) {
          tanggalLahirMax = new Date(today);
          tanggalLahirMax.setFullYear(today.getFullYear() - Number(minUsia));
        }

        where.tgl_lahir = {};
        if (tanggalLahirMin) where.tgl_lahir.gte = tanggalLahirMin;
        if (tanggalLahirMax) where.tgl_lahir.lte = tanggalLahirMax;
      }

      const list = await prisma.caberawit.findMany({
        where,
        include: {
          daerah: true,
          desa: true,
          kelompok: true,
          jenjang: true,
          kelasJenjang: true,
          wali: true,
        },
        orderBy: { createdAt: "desc" },
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
      });

      const total = await prisma.caberawit.count({ where });

      return response.pagination(
        res,
        list,
        {
          current: Number(page),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
        "✅ Berhasil mengambil daftar Caberawit",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar Caberawit");
    }
  },
  async findAllByDaerah(req: IReqUser, res: Response) {
    try {
      const { daerahId } = req.params;

      // ✅ validasi daerah
      const daerah = await prisma.daerah.findUnique({
        where: { id: String(daerahId) },
      });

      if (!daerah) {
        return response.notFound(res, "Daerah tidak ditemukan");
      }

      const {
        limit = 10,
        page = 1,
        search,
        jenis_kelamin,
        minUsia,
        maxUsia,
        kelasjenjang,
      } = req.query;

      // ✅ filter utama: DAERAH
      const where: any = {
        daerahId: String(daerahId),
      };

      // 🔍 Filter nama
      if (search) {
        where.nama = {
          contains: String(search),
          mode: "insensitive",
        };
      }

      // 🚻 Filter jenis kelamin
      if (jenis_kelamin) {
        where.jenis_kelamin = String(jenis_kelamin);
      }

      // 🎓 Filter kelas jenjang
      if (kelasjenjang) {
        where.kelasJenjangId = String(kelasjenjang);
      }

      // 🎂 Filter usia
      if (minUsia || maxUsia) {
        const today = new Date();
        where.tgl_lahir = {};

        if (maxUsia) {
          const minDate = new Date(today);
          minDate.setFullYear(today.getFullYear() - Number(maxUsia));
          where.tgl_lahir.gte = minDate;
        }

        if (minUsia) {
          const maxDate = new Date(today);
          maxDate.setFullYear(today.getFullYear() - Number(minUsia));
          where.tgl_lahir.lte = maxDate;
        }
      }

      const list = await prisma.caberawit.findMany({
        where,
        include: {
          daerah: true,
          desa: true,
          kelompok: true,
          jenjang: true,
          kelasJenjang: true,
          wali: true,
        },
        orderBy: { createdAt: "desc" },
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
      });

      const total = await prisma.caberawit.count({ where });

      return response.pagination(
        res,
        list,
        {
          current: Number(page),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
        `✅ Berhasil mengambil Caberawit di daerah ${daerah.name}`,
      );
    } catch (error) {
      response.error(
        res,
        error,
        "❌ Gagal mengambil Caberawit berdasarkan daerah",
      );
    }
  },

  async findAllByDesa(req: IReqUser, res: Response) {
    try {
      const { desaId } = req.params;

      const {
        limit = 10,
        page = 1,
        search,
        jenis_kelamin,
        minUsia,
        maxUsia,
        jenjang,
      } = req.query;

      // ✅ Filter utama: DESA
      const where: any = {
        desaId: String(desaId),
      };

      // 🔍 Filter nama
      if (search) {
        where.nama = {
          contains: String(search),
          mode: "insensitive",
        };
      }

      // 🚻 Filter jenis kelamin
      if (jenis_kelamin) {
        where.jenis_kelamin = String(jenis_kelamin);
      }

      // 🎓 Filter jenjang
      if (jenjang) {
        where.jenjangId = String(jenjang);
      }

      // 🎂 Filter usia
      if (minUsia || maxUsia) {
        const today = new Date();

        let tanggalLahirMin: Date | undefined;
        let tanggalLahirMax: Date | undefined;

        if (maxUsia) {
          tanggalLahirMin = new Date(today);
          tanggalLahirMin.setFullYear(today.getFullYear() - Number(maxUsia));
        }

        if (minUsia) {
          tanggalLahirMax = new Date(today);
          tanggalLahirMax.setFullYear(today.getFullYear() - Number(minUsia));
        }

        where.tgl_lahir = {};
        if (tanggalLahirMin) where.tgl_lahir.gte = tanggalLahirMin;
        if (tanggalLahirMax) where.tgl_lahir.lte = tanggalLahirMax;
      }

      const list = await prisma.caberawit.findMany({
        where,
        include: {
          daerah: true,
          desa: true,
          kelompok: true,
          jenjang: true,
        },
        orderBy: { createdAt: "desc" },
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
      });

      const total = await prisma.caberawit.count({ where });

      return response.pagination(
        res,
        list,
        {
          current: Number(page),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
        "✅ Berhasil mengambil daftar Caberawit",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar Caberawit");
    }
  },
  // 🟠 Ambil Caberawit by ID
  async findOne(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      const data = await prisma.caberawit.findUnique({
        where: { id: Number(id) },
        include: {
          daerah: true,
          desa: true,
          kelompok: true,
          jenjang: true,
          wali: true,
          kelasJenjang: true,
        },
      });

      if (!data) return response.notFound(res, "Caberawit tidak ditemukan");

      response.success(res, data, "✅ Berhasil mengambil data Caberawit");
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil data Caberawit");
    }
  },

  // 🔵 Update Caberawit
  async update(req: IReqUser, res: Response) {
    const { id } = req.params;
    const {
      nama,
      daerahId,
      desaId,
      kelompokId,
      jenjangId,
      kelasJenjangId,
      tgl_lahir,
      jenis_kelamin,
      gol_darah,
      nama_ortu,
      waliId,
      foto,
    } = req.body;

    try {
      const updated = await prisma.caberawit.update({
        where: { id: Number(id) },
        data: {
          nama,
          daerah: { connect: { id: daerahId } },
          desa: { connect: { id: desaId } },
          kelompok: { connect: { id: kelompokId } },
          jenjang: { connect: { id: jenjangId } },
          kelasJenjang: { connect: { id: kelasJenjangId } },

          ...(waliId ? { wali: { connect: { id: Number(waliId) } } } : {}),

          ...(tgl_lahir && { tgl_lahir: new Date(tgl_lahir) }),

          jenis_kelamin,
          gol_darah,
          nama_ortu,
          foto,
        },
        include: {
          daerah: true,
          desa: true,
          kelompok: true,
          jenjang: true,
          kelasJenjang: true,
          wali: true,
        },
      });

      response.success(res, updated, "✅ Caberawit berhasil diperbarui");
    } catch (error) {
      response.error(res, error, "❌ Gagal memperbarui Caberawit");
    }
  },
  // 🔴 Hapus Caberawit
  async remove(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      await prisma.caberawit.delete({
        where: { id: Number(id) },
      });

      response.success(res, null, "✅ Caberawit berhasil dihapus");
    } catch (error) {
      response.error(res, error, "❌ Gagal menghapus Caberawit");
    }
  },
  async countCaberawit(req: IReqUser, res: Response) {
    try {
      const { daerahId, desaId, search, kelompokId } = req.query;

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

      if (search) {
        where.name = {
          contains: String(search),
          mode: "insensitive",
        };
      }

      const totalCaberawit = await prisma.caberawit.count({
        where,
      });

      return response.success(
        res,
        {
          total: totalCaberawit,
          filter: {
            daerahId: daerahId ?? null,
            desaId: desaId ?? null,
            kelompokId: kelompokId ?? null,
            search: search ?? null,
          },
        },
        "✅ Berhasil menghitung jumlah mumi",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal menghitung jumlah mumi");
    }
  },
  async assignWali(req: IReqUser, res: Response) {
    try {
      const waliId = req.user?.id;
      const { caberawitIds } = req.body;

      if (!waliId) {
        return response.unauthorized(res, "User tidak valid");
      }

      if (!Array.isArray(caberawitIds) || caberawitIds.length === 0) {
        return response.notFound(res, "Pilih minimal satu Caberawit");
      }

      const result = await prisma.caberawit.updateMany({
        where: {
          id: { in: caberawitIds },
        },
        data: {
          waliId,
        },
      });

      return response.success(
        res,
        {
          updatedCount: result.count,
        },
        "✅ Wali berhasil ditetapkan ke Caberawit terpilih",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal menetapkan wali Caberawit");
    }
  },

  // async toggleWali(req: IReqUser, res: Response) {
  //   try {
  //     const waliId = req.user?.id;
  //     const { caberawitIds } = req.body;

  //     if (!waliId) {
  //       return response.unauthorized(res, "User tidak valid");
  //     }

  //     if (!Array.isArray(caberawitIds) || caberawitIds.length === 0) {
  //       return response.notFound(res, "Pilih minimal satu Caberawit");
  //     }

  //     // Ambil data dulu
  //     const caberawits = await prisma.caberawit.findMany({
  //       where: { id: { in: caberawitIds } },
  //       select: { id: true, waliId: true },
  //     });

  //     const toAssign: number[] = [];
  //     const toUnassign: number[] = [];

  //     for (const c of caberawits) {
  //       if (!c.waliId) {
  //         toAssign.push(c.id); // belum ada wali → assign
  //       } else if (c.waliId === waliId) {
  //         toUnassign.push(c.id); // wali sama → lepas
  //       } else {
  //         return response.unauthorized(
  //           res,
  //           "Ada Caberawit yang bukan tanggung jawab kamu",
  //         );
  //       }
  //     }

  //     if (toAssign.length) {
  //       await prisma.caberawit.updateMany({
  //         where: { id: { in: toAssign } },
  //         data: { waliId },
  //       });
  //     }

  //     if (toUnassign.length) {
  //       await prisma.caberawit.updateMany({
  //         where: { id: { in: toUnassign } },
  //         data: { waliId: null },
  //       });
  //     }

  //     return response.success(
  //       res,
  //       {
  //         assigned: toAssign.length,
  //         unassigned: toUnassign.length,
  //       },
  //       "✅ Data wali berhasil diperbarui",
  //     );
  //   } catch (error) {
  //     response.error(res, error, "❌ Gagal update wali Caberawit");
  //   }
  // },

  async unassignWali(req: IReqUser, res: Response) {
    try {
      const waliId = req.user?.id;
      const { caberawitIds } = req.body;

      if (!waliId) {
        return response.unauthorized(res, "User tidak valid");
      }

      if (!Array.isArray(caberawitIds) || caberawitIds.length === 0) {
        return response.notFound(res, "Pilih minimal satu Caberawit");
      }

      const result = await prisma.caberawit.updateMany({
        where: {
          id: { in: caberawitIds },
          waliId, // 🔒 pastikan hanya wali tsb
        },
        data: {
          waliId: null, // 🔥 lepas wali
        },
      });

      return response.success(
        res,
        { updatedCount: result.count },
        "✅ Wali berhasil dilepas dari Caberawit terpilih",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal melepas wali Caberawit");
    }
  },

  async findAllByWali(req: IReqUser, res: Response) {
    try {
      const waliId = req.user?.id;

      const {
        limit = 999,
        page = 1,
        search,
        jenis_kelamin,
        minUsia,
        maxUsia,
        kelasjenjang,
        daerah,
        desa,
        kelompok,
      } = req.query;

      const where: any = {
        waliId,
      };

      // 🔍 Filter nama
      if (search) {
        where.nama = {
          contains: String(search),
          mode: "insensitive",
        };
      }

      // 🚻 Jenis kelamin
      if (jenis_kelamin) {
        where.jenis_kelamin = String(jenis_kelamin);
      }

      // 🎓 Kelas / jenjang
      if (kelasjenjang) {
        where.kelasJenjangId = String(kelasjenjang);
      }

      // 🌍 Lokasi (opsional, kalau wali lintas wilayah)
      if (daerah) where.daerahId = String(daerah);
      if (desa) where.desaId = String(desa);
      if (kelompok) where.kelompokId = String(kelompok);

      // 🎂 Filter usia
      if (minUsia || maxUsia) {
        const today = new Date();
        where.tgl_lahir = {};

        if (maxUsia) {
          const minDate = new Date(today);
          minDate.setFullYear(today.getFullYear() - Number(maxUsia));
          where.tgl_lahir.gte = minDate;
        }

        if (minUsia) {
          const maxDate = new Date(today);
          maxDate.setFullYear(today.getFullYear() - Number(minUsia));
          where.tgl_lahir.lte = maxDate;
        }
      }

      const list = await prisma.caberawit.findMany({
        where,
        include: {
          daerah: true,
          desa: true,
          kelompok: true,
          jenjang: true,
          kelasJenjang: true,
        },
        orderBy: { createdAt: "desc" },
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
      });

      const total = await prisma.caberawit.count({ where });

      return response.pagination(
        res,
        list,
        {
          current: Number(page),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
        "✅ Berhasil mengambil daftar Caberawit wali",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil Caberawit wali");
    }
  },
};
