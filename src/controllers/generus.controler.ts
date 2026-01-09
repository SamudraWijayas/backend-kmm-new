import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

// ✅ Validasi input untuk tambah Generus
const generusAddDTO = Yup.object({
  nama: Yup.string().required("Nama wajib diisi"),
  daerahId: Yup.string().required("Daerah wajib diisi"),
  desaId: Yup.string().required("Desa wajib diisi"),
  kelompokId: Yup.string().required("Kelompok wajib diisi"),
  jenjangId: Yup.string().required("Jenjang wajib diisi"),
  kelasJenjangId: Yup.string().required("Jenjang wajib diisi"),
  tgl_lahir: Yup.date().required("Tanggal lahir wajib diisi"),
  jenis_kelamin: Yup.string()
    .oneOf(["Laki-laki", "Perempuan"])
    .required("Jenis kelamin wajib diisi"),
  gol_darah: Yup.string().nullable(),
  nama_ortu: Yup.string().required("Nama orang tua wajib diisi"),
  mahasiswa: Yup.boolean().default(false),
});

export default {
  // 🟢 Tambah Generus
  async addGenerus(req: IReqUser, res: Response) {
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
      mahasiswa,
      foto,
    } = req.body;

    try {
      await generusAddDTO.validate({
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
        mahasiswa,
        foto,
      });

      // ✅ Pastikan semua foreign key valid
      const [daerah, desa, kelompok, jenjang] = await Promise.all([
        prisma.daerah.findUnique({ where: { id: daerahId } }),
        prisma.desa.findUnique({ where: { id: desaId } }),
        prisma.kelompok.findUnique({ where: { id: kelompokId } }),
        prisma.jenjang.findUnique({ where: { id: jenjangId } }),
      ]);

      if (!daerah) return response.notFound(res, "Daerah tidak ditemukan");
      if (!desa) return response.notFound(res, "Desa tidak ditemukan");
      if (!kelompok) return response.notFound(res, "Kelompok tidak ditemukan");
      if (!jenjang) return response.notFound(res, "Jenjang tidak ditemukan");

      // ✅ Simpan data
      const newGenerus = await prisma.mumi.create({
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
          mahasiswa,
          foto,
        },
        include: {
          daerah: true,
          desa: true,
          kelompok: true,
          jenjang: true,
        },
      });

      response.success(res, newGenerus, "✅ Generus berhasil ditambahkan!");
    } catch (error) {
      response.error(res, error, "❌ Gagal menambahkan generus");
    }
  },

  // 🟡 Ambil semua Generus
  async findAll(req: IReqUser, res: Response) {
    try {
      const {
        limit = 10,
        page = 1,
        search,
        jenis_kelamin,
        minUsia,
        maxUsia,
        jenjang,
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
      if (jenjang) {
        where.jenjangId = jenjang;
      }

      // 🎂 Filter usia (dihitung dari tgl_lahir)
      if (minUsia || maxUsia) {
        const today = new Date();

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
      console.log("Filter usia:", {
        minUsia,
        maxUsia,
        where_tgl_lahir: where.tgl_lahir,
      });

      // 📦 Ambil data dari Prisma
      const list = await prisma.mumi.findMany({
        where,
        include: {
          daerah: true,
          desa: true,
          kelompok: true,
          jenjang: true,
        },
        orderBy: { createdAt: "desc" },
        take: +limit,
        skip: (+page - 1) * +limit,
      });

      const total = await prisma.mumi.count({ where });

      return response.pagination(
        res,
        list,
        {
          current: +page,
          total,
          totalPages: Math.ceil(total / +limit),
        },
        "✅ Berhasil mengambil daftar generus"
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar generus");
    }
  },
  async findAllByKelompok(req: IReqUser, res: Response) {
    try {
      const { kelompokId } = req.params;

      const kelompok = await prisma.kelompok.findUnique({
        where: { id: String(kelompokId) },
      });

      if (!kelompok) {
        return response.notFound(res, "kelompok tidak ditemukan");
      }

      const {
        limit = 10,
        page = 1,
        search,
        jenis_kelamin,
        minUsia,
        maxUsia,
        jenjang,
      } = req.query;

      // ✅ WAJIB: filter kelompok
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

      const list = await prisma.mumi.findMany({
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

      const total = await prisma.mumi.count({ where });

      return response.pagination(
        res,
        list,
        {
          current: Number(page),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
        "✅ Berhasil mengambil daftar generus"
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar generus");
    }
  },
  async findAllByDesa(req: IReqUser, res: Response) {
    try {
      const { desaId } = req.params;

      const desa = await prisma.desa.findUnique({
        where: { id: String(desaId) },
      });

      if (!desa) {
        return response.notFound(res, "Desa tidak ditemukan");
      }

      const {
        limit = 10,
        page = 1,
        search,
        jenis_kelamin,
        minUsia,
        maxUsia,
        jenjang,
      } = req.query;

      // ✅ WAJIB: filter desa
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

      const list = await prisma.mumi.findMany({
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

      const total = await prisma.mumi.count({ where });

      return response.pagination(
        res,
        list,
        {
          current: Number(page),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
        "✅ Berhasil mengambil daftar generus"
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar generus");
    }
  },
  async findAllByMahasiswaDesa(req: IReqUser, res: Response) {
    try {
      const { desaId } = req.params;

      const desa = await prisma.desa.findUnique({
        where: { id: String(desaId) },
      });

      if (!desa) {
        return response.notFound(res, "Desa tidak ditemukan");
      }

      const {
        limit = 10,
        page = 1,
        search,
        jenis_kelamin,
        minUsia,
        maxUsia,
        jenjang,
      } = req.query;

      // ✅ WAJIB: filter desa
      const where: any = {
        desaId: String(desaId),
        mahasiswa: true,
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

      const list = await prisma.mumi.findMany({
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

      const total = await prisma.mumi.count({ where });

      return response.pagination(
        res,
        list,
        {
          current: Number(page),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
        "✅ Berhasil mengambil daftar generus"
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar generus");
    }
  },
  async findAllByMahasiswaKelompok(req: IReqUser, res: Response) {
    try {
      const { kelompokId } = req.params;

      const kelompok = await prisma.kelompok.findUnique({
        where: { id: String(kelompokId) },
      });

      if (!kelompok) {
        return response.notFound(res, "kelompok tidak ditemukan");
      }

      const {
        limit = 10,
        page = 1,
        search,
        jenis_kelamin,
        minUsia,
        maxUsia,
        jenjang,
      } = req.query;

      // ✅ WAJIB: filter kelompok
      const where: any = {
        kelompokId: String(kelompokId),
        mahasiswa: true,
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

      const list = await prisma.mumi.findMany({
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

      const total = await prisma.mumi.count({ where });

      return response.pagination(
        res,
        list,
        {
          current: Number(page),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
        "✅ Berhasil mengambil daftar generus"
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar generus");
    }
  },
  // 🟠 Ambil Generus by ID
  async findOne(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      const data = await prisma.mumi.findUnique({
        where: { id: Number(id) },
        include: {
          daerah: true,
          desa: true,
          kelompok: true,
          jenjang: true,
        },
      });

      if (!data) return response.notFound(res, "Generus tidak ditemukan");

      response.success(res, data, "✅ Berhasil mengambil data generus");
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil data generus");
    }
  },

  // 🔵 Update Generus
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
      mahasiswa,
      foto,
    } = req.body;

    try {
      const updated = await prisma.mumi.update({
        where: { id: Number(id) },
        data: {
          nama,
          daerah: { connect: { id: daerahId } },
          desa: { connect: { id: desaId } },
          kelompok: { connect: { id: kelompokId } },
          jenjang: { connect: { id: jenjangId } },
          kelasJenjang: { connect: { id: kelasJenjangId } },
          tgl_lahir: new Date(tgl_lahir),
          jenis_kelamin,
          gol_darah,
          nama_ortu,
          mahasiswa,
          foto,
        },
        include: {
          daerah: true,
          desa: true,
          kelompok: true,
          jenjang: true,
          kelasJenjang: true,
        },
      });

      response.success(res, updated, "✅ Generus berhasil diperbarui");
    } catch (error) {
      response.error(res, error, "❌ Gagal memperbarui generus");
    }
  },
  // 🔴 Hapus Generus
  async remove(req: IReqUser, res: Response) {
    const { id } = req.params;

    try {
      await prisma.mumi.delete({
        where: { id: Number(id) },
      });

      response.success(res, null, "✅ Generus berhasil dihapus");
    } catch (error) {
      response.error(res, error, "❌ Gagal menghapus generus");
    }
  },
  // 📊 Jumlah Generus per Jenjang
  async countByJenjang(req: IReqUser, res: Response) {
    try {
      const data = await prisma.mumi.groupBy({
        by: ["jenjangId"],
        _count: {
          _all: true,
        },
      });

      // ambil detail jenjang
      const jenjangIds = data.map((item) => item.jenjangId);

      const jenjangList = await prisma.jenjang.findMany({
        where: {
          id: { in: jenjangIds },
        },
      });

      // gabungkan hasil
      const result = data.map((item) => {
        const jenjang = jenjangList.find((j) => j.id === item.jenjangId);

        return {
          jenjangId: item.jenjangId,
          jenjangNama: jenjang?.name || "-",
          total: item._count._all,
        };
      });

      return response.success(
        res,
        result,
        "✅ Berhasil mengambil jumlah generus per jenjang"
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil data statistik jenjang");
    }
  },
  // 📊 Jumlah Generus per Jenjang per Kelompok (by Desa)
  async countByJenjangKelompokDesa(req: IReqUser, res: Response) {
    try {
      const { desaId } = req.params;

      const desa = await prisma.desa.findUnique({
        where: { id: String(desaId) },
      });

      if (!desa) {
        return response.notFound(res, "Desa tidak ditemukan");
      }

      const data = await prisma.mumi.groupBy({
        by: ["kelompokId", "jenjangId"],
        where: {
          desaId: String(desaId),
        },
        _count: {
          _all: true,
        },
      });

      const kelompokIds = [...new Set(data.map((d) => d.kelompokId))];
      const jenjangIds = [...new Set(data.map((d) => d.jenjangId))];

      const [kelompokList, jenjangList] = await Promise.all([
        prisma.kelompok.findMany({ where: { id: { in: kelompokIds } } }),
        prisma.jenjang.findMany({ where: { id: { in: jenjangIds } } }),
      ]);

      const result = data.map((item) => {
        const kelompok = kelompokList.find((k) => k.id === item.kelompokId);
        const jenjang = jenjangList.find((j) => j.id === item.jenjangId);

        return {
          kelompokId: item.kelompokId,
          kelompokNama: kelompok?.name || "-",
          jenjangId: item.jenjangId,
          jenjangNama: jenjang?.name || "-",
          total: item._count._all,
        };
      });

      return response.success(
        res,
        result,
        "✅ Statistik generus per jenjang & kelompok berdasarkan desa"
      );
    } catch (error) {
      response.error(
        res,
        error,
        "❌ Gagal mengambil statistik jenjang per kelompok desa"
      );
    }
  },
};
