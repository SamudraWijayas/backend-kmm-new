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
        },
        include: {
          daerah: true,
          desa: true,
          kelompok: true,
          jenjang: true,
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
        jenjang,
        daerah,
        desa,
        kelompok
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

      if (daerah){
        where.daerahId = daerah
      }
      if (desa){
        where.desaId = desa
      }
      if (kelompok){
        where.kelompokId = kelompok
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
        "✅ Berhasil mengambil daftar Caberawit"
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
        jenjang,
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
        "✅ Berhasil mengambil daftar Caberawit"
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil daftar Caberawit");
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
        "✅ Berhasil mengambil daftar Caberawit"
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
          tgl_lahir: new Date(tgl_lahir),
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
};
