"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../libs/prisma");
const response_1 = __importDefault(require("../utils/response"));
const Yup = __importStar(require("yup"));
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
exports.default = {
    // 🟢 Tambah Generus
    addGenerus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nama, daerahId, desaId, kelompokId, jenjangId, kelasJenjangId, tgl_lahir, jenis_kelamin, gol_darah, nama_ortu, mahasiswa, foto, } = req.body;
            try {
                yield generusAddDTO.validate({
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
                const [daerah, desa, kelompok, jenjang] = yield Promise.all([
                    prisma_1.prisma.daerah.findUnique({ where: { id: daerahId } }),
                    prisma_1.prisma.desa.findUnique({ where: { id: desaId } }),
                    prisma_1.prisma.kelompok.findUnique({ where: { id: kelompokId } }),
                    prisma_1.prisma.jenjang.findUnique({ where: { id: jenjangId } }),
                ]);
                if (!daerah)
                    return response_1.default.notFound(res, "Daerah tidak ditemukan");
                if (!desa)
                    return response_1.default.notFound(res, "Desa tidak ditemukan");
                if (!kelompok)
                    return response_1.default.notFound(res, "Kelompok tidak ditemukan");
                if (!jenjang)
                    return response_1.default.notFound(res, "Jenjang tidak ditemukan");
                let baseSlug = nama.toLowerCase().trim().replace(/\s+/g, "-");
                let slug = baseSlug;
                let counter = 1;
                while (yield prisma_1.prisma.mumi.findFirst({ where: { slug } })) {
                    slug = `${baseSlug}-${counter}`;
                    counter++;
                }
                // ✅ Simpan data
                const newGenerus = yield prisma_1.prisma.mumi.create({
                    data: {
                        nama,
                        slug,
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
                response_1.default.success(res, newGenerus, "✅ Generus berhasil ditambahkan!");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menambahkan generus");
            }
        });
    },
    // 🟡 Ambil semua Generus
    findsemua(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { limit = 10, page = 1, search, jenis_kelamin, minUsia, maxUsia, jenjang, } = req.query;
                const where = {};
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
                    let tanggalLahirMin; // lahir setelah (lebih muda)
                    let tanggalLahirMax; // lahir sebelum (lebih tua)
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
                    if (tanggalLahirMin)
                        where.tgl_lahir.gte = tanggalLahirMin;
                    if (tanggalLahirMax)
                        where.tgl_lahir.lte = tanggalLahirMax;
                }
                console.log("Filter usia:", {
                    minUsia,
                    maxUsia,
                    where_tgl_lahir: where.tgl_lahir,
                });
                // 📦 Ambil data dari Prisma
                const list = yield prisma_1.prisma.mumi.findMany({
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
                const total = yield prisma_1.prisma.mumi.count({ where });
                return response_1.default.pagination(res, list, {
                    current: +page,
                    total,
                    totalPages: Math.ceil(total / +limit),
                }, "✅ Berhasil mengambil daftar generus");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil daftar generus");
            }
        });
    },
    findAllByKelompok(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { kelompokId } = req.params;
                const kelompok = yield prisma_1.prisma.kelompok.findUnique({
                    where: { id: String(kelompokId) },
                });
                if (!kelompok) {
                    return response_1.default.notFound(res, "kelompok tidak ditemukan");
                }
                const { limit = 10, page = 1, search, jenis_kelamin, minUsia, maxUsia, jenjang, } = req.query;
                // ✅ WAJIB: filter kelompok
                const where = {
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
                    let tanggalLahirMin;
                    let tanggalLahirMax;
                    if (maxUsia) {
                        tanggalLahirMin = new Date(today);
                        tanggalLahirMin.setFullYear(today.getFullYear() - Number(maxUsia));
                    }
                    if (minUsia) {
                        tanggalLahirMax = new Date(today);
                        tanggalLahirMax.setFullYear(today.getFullYear() - Number(minUsia));
                    }
                    where.tgl_lahir = {};
                    if (tanggalLahirMin)
                        where.tgl_lahir.gte = tanggalLahirMin;
                    if (tanggalLahirMax)
                        where.tgl_lahir.lte = tanggalLahirMax;
                }
                const list = yield prisma_1.prisma.mumi.findMany({
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
                const total = yield prisma_1.prisma.mumi.count({ where });
                return response_1.default.pagination(res, list, {
                    current: Number(page),
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
                }, "✅ Berhasil mengambil daftar generus");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil daftar generus");
            }
        });
    },
    findAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { daerah, desa, limit = 10, page = 1, search, jenis_kelamin, minUsia, maxUsia, jenjang, } = req.query;
                const where = {};
                // 🌍 Filter daerah
                if (daerah) {
                    where.daerahId = String(daerah);
                }
                // 🏘️ Filter desa
                if (desa) {
                    where.desaId = String(desa);
                }
                // 🔍 Filter nama
                if (search) {
                    where.nama = {
                        contains: String(search),
                        // mode: "insensitive",
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
                    const tglLahirFilter = {};
                    if (maxUsia) {
                        const minDate = new Date(today);
                        minDate.setFullYear(today.getFullYear() - Number(maxUsia));
                        tglLahirFilter.gte = minDate;
                    }
                    if (minUsia) {
                        const maxDate = new Date(today);
                        maxDate.setFullYear(today.getFullYear() - Number(minUsia));
                        tglLahirFilter.lte = maxDate;
                    }
                    where.tgl_lahir = tglLahirFilter;
                }
                const list = yield prisma_1.prisma.mumi.findMany({
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
                const total = yield prisma_1.prisma.mumi.count({ where });
                return response_1.default.pagination(res, list, {
                    current: Number(page),
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
                }, "✅ Berhasil mengambil daftar generus");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil daftar generus");
            }
        });
    },
    findAllByDaerah(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { daerahId } = req.params;
                // ✅ validasi daerah
                const daerah = yield prisma_1.prisma.daerah.findUnique({
                    where: { id: String(daerahId) },
                });
                if (!daerah) {
                    return response_1.default.notFound(res, "Daerah tidak ditemukan");
                }
                const { limit = 10, page = 1, search, jenis_kelamin, minUsia, maxUsia, jenjang, } = req.query;
                // ✅ WAJIB: filter daerah
                const where = {
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
                // 🎓 Filter jenjang
                if (jenjang) {
                    where.jenjangId = String(jenjang);
                }
                // 🎂 Filter usia
                if (minUsia || maxUsia) {
                    const today = new Date();
                    let tanggalLahirMin;
                    let tanggalLahirMax;
                    if (maxUsia) {
                        tanggalLahirMin = new Date(today);
                        tanggalLahirMin.setFullYear(today.getFullYear() - Number(maxUsia));
                    }
                    if (minUsia) {
                        tanggalLahirMax = new Date(today);
                        tanggalLahirMax.setFullYear(today.getFullYear() - Number(minUsia));
                    }
                    where.tgl_lahir = {};
                    if (tanggalLahirMin)
                        where.tgl_lahir.gte = tanggalLahirMin;
                    if (tanggalLahirMax)
                        where.tgl_lahir.lte = tanggalLahirMax;
                }
                const list = yield prisma_1.prisma.mumi.findMany({
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
                const total = yield prisma_1.prisma.mumi.count({ where });
                return response_1.default.pagination(res, list, {
                    current: Number(page),
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
                }, `✅ Berhasil mengambil generus di daerah ${daerah.name}`);
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil generus berdasarkan daerah");
            }
        });
    },
    findAllByMahasiswaDaerah(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { daerahId } = req.params;
                const daerah = yield prisma_1.prisma.daerah.findUnique({
                    where: { id: String(daerahId) },
                });
                if (!daerah) {
                    return response_1.default.notFound(res, "daerah tidak ditemukan");
                }
                const { limit = 10, page = 1, search, jenis_kelamin, minUsia, maxUsia, jenjang, } = req.query;
                // ✅ WAJIB: filter desa
                const where = {
                    daerahId: String(daerahId),
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
                    let tanggalLahirMin;
                    let tanggalLahirMax;
                    if (maxUsia) {
                        tanggalLahirMin = new Date(today);
                        tanggalLahirMin.setFullYear(today.getFullYear() - Number(maxUsia));
                    }
                    if (minUsia) {
                        tanggalLahirMax = new Date(today);
                        tanggalLahirMax.setFullYear(today.getFullYear() - Number(minUsia));
                    }
                    where.tgl_lahir = {};
                    if (tanggalLahirMin)
                        where.tgl_lahir.gte = tanggalLahirMin;
                    if (tanggalLahirMax)
                        where.tgl_lahir.lte = tanggalLahirMax;
                }
                const list = yield prisma_1.prisma.mumi.findMany({
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
                const total = yield prisma_1.prisma.mumi.count({ where });
                return response_1.default.pagination(res, list, {
                    current: Number(page),
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
                }, "✅ Berhasil mengambil daftar generus");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil daftar generus");
            }
        });
    },
    findAllByMahasiswaDesa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { desaId } = req.params;
                const desa = yield prisma_1.prisma.desa.findUnique({
                    where: { id: String(desaId) },
                });
                if (!desa) {
                    return response_1.default.notFound(res, "Desa tidak ditemukan");
                }
                const { limit = 10, page = 1, search, jenis_kelamin, minUsia, maxUsia, jenjang, } = req.query;
                // ✅ WAJIB: filter desa
                const where = {
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
                    let tanggalLahirMin;
                    let tanggalLahirMax;
                    if (maxUsia) {
                        tanggalLahirMin = new Date(today);
                        tanggalLahirMin.setFullYear(today.getFullYear() - Number(maxUsia));
                    }
                    if (minUsia) {
                        tanggalLahirMax = new Date(today);
                        tanggalLahirMax.setFullYear(today.getFullYear() - Number(minUsia));
                    }
                    where.tgl_lahir = {};
                    if (tanggalLahirMin)
                        where.tgl_lahir.gte = tanggalLahirMin;
                    if (tanggalLahirMax)
                        where.tgl_lahir.lte = tanggalLahirMax;
                }
                const list = yield prisma_1.prisma.mumi.findMany({
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
                const total = yield prisma_1.prisma.mumi.count({ where });
                return response_1.default.pagination(res, list, {
                    current: Number(page),
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
                }, "✅ Berhasil mengambil daftar generus");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil daftar generus");
            }
        });
    },
    findAllByMahasiswaKelompok(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { kelompokId } = req.params;
                const kelompok = yield prisma_1.prisma.kelompok.findUnique({
                    where: { id: String(kelompokId) },
                });
                if (!kelompok) {
                    return response_1.default.notFound(res, "kelompok tidak ditemukan");
                }
                const { limit = 10, page = 1, search, jenis_kelamin, minUsia, maxUsia, jenjang, } = req.query;
                // ✅ WAJIB: filter kelompok
                const where = {
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
                    let tanggalLahirMin;
                    let tanggalLahirMax;
                    if (maxUsia) {
                        tanggalLahirMin = new Date(today);
                        tanggalLahirMin.setFullYear(today.getFullYear() - Number(maxUsia));
                    }
                    if (minUsia) {
                        tanggalLahirMax = new Date(today);
                        tanggalLahirMax.setFullYear(today.getFullYear() - Number(minUsia));
                    }
                    where.tgl_lahir = {};
                    if (tanggalLahirMin)
                        where.tgl_lahir.gte = tanggalLahirMin;
                    if (tanggalLahirMax)
                        where.tgl_lahir.lte = tanggalLahirMax;
                }
                const list = yield prisma_1.prisma.mumi.findMany({
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
                const total = yield prisma_1.prisma.mumi.count({ where });
                return response_1.default.pagination(res, list, {
                    current: Number(page),
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
                }, "✅ Berhasil mengambil daftar generus");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil daftar generus");
            }
        });
    },
    // 🟠 Ambil Generus by ID
    findOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const data = yield prisma_1.prisma.mumi.findUnique({
                    where: { id: Number(id) },
                    include: {
                        daerah: true,
                        desa: true,
                        kelompok: true,
                        jenjang: true,
                    },
                });
                if (!data)
                    return response_1.default.notFound(res, "Generus tidak ditemukan");
                response_1.default.success(res, data, "✅ Berhasil mengambil data generus");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil data generus");
            }
        });
    },
    // 🔵 Update Generus
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { nama, daerahId, desaId, kelompokId, jenjangId, kelasJenjangId, tgl_lahir, jenis_kelamin, gol_darah, nama_ortu, mahasiswa, foto, } = req.body;
            try {
                // ✅ slug dasar
                let baseSlug = nama.toLowerCase().trim().replace(/\s+/g, "-");
                let slug = baseSlug;
                let counter = 1;
                // ✅ cek slug tapi abaikan id yang sedang diupdate
                while (yield prisma_1.prisma.mumi.findFirst({
                    where: {
                        slug,
                        NOT: { id: Number(id) },
                    },
                })) {
                    slug = `${baseSlug}-${counter}`;
                    counter++;
                }
                const updated = yield prisma_1.prisma.mumi.update({
                    where: { id: Number(id) },
                    data: {
                        nama,
                        slug,
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
                response_1.default.success(res, updated, "✅ Generus berhasil diperbarui");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal memperbarui generus");
            }
        });
    },
    // 🔴 Hapus Generus
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield prisma_1.prisma.mumi.delete({
                    where: { id: Number(id) },
                });
                response_1.default.success(res, null, "✅ Generus berhasil dihapus");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menghapus generus");
            }
        });
    },
    // 📊 Jumlah Generus per Jenjang
    countByJenjang(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield prisma_1.prisma.mumi.groupBy({
                    by: ["jenjangId"],
                    _count: {
                        _all: true,
                    },
                });
                // ambil detail jenjang
                const jenjangIds = data.map((item) => item.jenjangId);
                const jenjangList = yield prisma_1.prisma.jenjang.findMany({
                    where: {
                        id: { in: jenjangIds },
                    },
                });
                // gabungkan hasil
                const result = data.map((item) => {
                    const jenjang = jenjangList.find((j) => j.id === item.jenjangId);
                    return {
                        jenjangId: item.jenjangId,
                        jenjangNama: (jenjang === null || jenjang === void 0 ? void 0 : jenjang.name) || "-",
                        total: item._count._all,
                    };
                });
                return response_1.default.success(res, result, "✅ Berhasil mengambil jumlah generus per jenjang");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil data statistik jenjang");
            }
        });
    },
    // 📊 Jumlah Generus per Jenjang per Desa
    statistikMumibyDaerah(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { daerahId } = req.params;
                const daerah = yield prisma_1.prisma.daerah.findUnique({
                    where: { id: String(daerahId) },
                });
                if (!daerah) {
                    return response_1.default.notFound(res, "Desa tidak ditemukan");
                }
                const data = yield prisma_1.prisma.mumi.groupBy({
                    by: ["desaId", "jenjangId"],
                    where: {
                        daerahId: String(daerahId),
                    },
                    _count: {
                        _all: true,
                    },
                });
                const desaIds = [...new Set(data.map((d) => d.desaId))];
                const jenjangIds = [...new Set(data.map((d) => d.jenjangId))];
                const [desaList, jenjangList] = yield Promise.all([
                    prisma_1.prisma.desa.findMany({ where: { id: { in: desaIds } } }),
                    prisma_1.prisma.jenjang.findMany({ where: { id: { in: jenjangIds } } }),
                ]);
                const result = data.map((item) => {
                    const desa = desaList.find((k) => k.id === item.desaId);
                    const jenjang = jenjangList.find((j) => j.id === item.jenjangId);
                    return {
                        desaId: item.desaId,
                        desaNama: (desa === null || desa === void 0 ? void 0 : desa.name) || "-",
                        jenjangId: item.jenjangId,
                        jenjangNama: (jenjang === null || jenjang === void 0 ? void 0 : jenjang.name) || "-",
                        total: item._count._all,
                    };
                });
                return response_1.default.success(res, result, "✅ Statistik generus per jenjang & desa berdasarkan daerah");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil statistik jenjang per kelompok desa");
            }
        });
    },
    countStatsByDaerah(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { daerahId } = req.params;
                // ✅ Validasi kelompok
                const daerah = yield prisma_1.prisma.daerah.findUnique({
                    where: { id: String(daerahId) },
                });
                if (!daerah) {
                    return response_1.default.notFound(res, "daerah tidak ditemukan");
                }
                // 📊 Group by jenjang DI DALAM daerah
                const data = yield prisma_1.prisma.mumi.groupBy({
                    by: ["jenjangId"],
                    where: {
                        daerahId: String(daerahId),
                    },
                    _count: {
                        _all: true,
                    },
                });
                const jenjangIds = data.map((d) => d.jenjangId);
                const jenjangList = yield prisma_1.prisma.jenjang.findMany({
                    where: {
                        id: { in: jenjangIds },
                    },
                });
                const result = data.map((item) => {
                    const jenjang = jenjangList.find((j) => j.id === item.jenjangId);
                    return {
                        jenjangId: item.jenjangId,
                        jenjangNama: (jenjang === null || jenjang === void 0 ? void 0 : jenjang.name) || "-",
                        total: item._count._all,
                    };
                });
                return response_1.default.success(res, result, "✅ Statistik generus per jenjang berdasarkan daerah");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil statistik generus per jenjang daerah");
            }
        });
    },
    // 📊 Jumlah Generus per Jenjang per Kelompok (by Desa)
    countByJenjangKelompokDesa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { desaId } = req.params;
                const desa = yield prisma_1.prisma.desa.findUnique({
                    where: { id: String(desaId) },
                });
                if (!desa) {
                    return response_1.default.notFound(res, "Desa tidak ditemukan");
                }
                const data = yield prisma_1.prisma.mumi.groupBy({
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
                const [kelompokList, jenjangList] = yield Promise.all([
                    prisma_1.prisma.kelompok.findMany({ where: { id: { in: kelompokIds } } }),
                    prisma_1.prisma.jenjang.findMany({ where: { id: { in: jenjangIds } } }),
                ]);
                const result = data.map((item) => {
                    const kelompok = kelompokList.find((k) => k.id === item.kelompokId);
                    const jenjang = jenjangList.find((j) => j.id === item.jenjangId);
                    return {
                        kelompokId: item.kelompokId,
                        kelompokNama: (kelompok === null || kelompok === void 0 ? void 0 : kelompok.name) || "-",
                        jenjangId: item.jenjangId,
                        jenjangNama: (jenjang === null || jenjang === void 0 ? void 0 : jenjang.name) || "-",
                        total: item._count._all,
                    };
                });
                return response_1.default.success(res, result, "✅ Statistik generus per jenjang & kelompok berdasarkan desa");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil statistik jenjang per kelompok desa");
            }
        });
    },
    countByDaerahDesaKelompok(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { daerahId, desaId, kelompokId } = req.query;
                const where = {};
                // 🔎 Filter daerah
                if (daerahId) {
                    where.daerahId = String(daerahId);
                }
                // 🔎 Filter desa
                if (desaId) {
                    where.desaId = String(desaId);
                }
                // 🔎 Filter kelompok
                if (kelompokId) {
                    where.kelompokId = String(kelompokId);
                }
                const data = yield prisma_1.prisma.mumi.groupBy({
                    by: ["daerahId", "desaId", "kelompokId"],
                    where,
                    _count: {
                        _all: true,
                    },
                });
                // Ambil detail nama (optional tapi berguna)
                const daerahIds = [
                    ...new Set(data.map((d) => d.daerahId).filter(Boolean)),
                ];
                const desaIds = [...new Set(data.map((d) => d.desaId).filter(Boolean))];
                const kelompokIds = [
                    ...new Set(data.map((d) => d.kelompokId).filter(Boolean)),
                ];
                const [daerahList, desaList, kelompokList] = yield Promise.all([
                    prisma_1.prisma.daerah.findMany({ where: { id: { in: daerahIds } } }),
                    prisma_1.prisma.desa.findMany({ where: { id: { in: desaIds } } }),
                    prisma_1.prisma.kelompok.findMany({ where: { id: { in: kelompokIds } } }),
                ]);
                const result = data.map((item) => {
                    const daerah = daerahList.find((d) => d.id === item.daerahId);
                    const desa = desaList.find((d) => d.id === item.desaId);
                    const kelompok = kelompokList.find((k) => k.id === item.kelompokId);
                    return {
                        daerahId: item.daerahId,
                        daerahNama: (daerah === null || daerah === void 0 ? void 0 : daerah.name) || "-",
                        desaId: item.desaId,
                        desaNama: (desa === null || desa === void 0 ? void 0 : desa.name) || "-",
                        kelompokId: item.kelompokId,
                        kelompokNama: (kelompok === null || kelompok === void 0 ? void 0 : kelompok.name) || "-",
                        total: item._count._all,
                    };
                });
                return response_1.default.success(res, result, "✅ Statistik jumlah generus berdasarkan daerah, desa, dan kelompok");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil statistik generus");
            }
        });
    },
    countStatsByKelompokId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { kelompokId } = req.params;
                // ✅ Validasi kelompok
                const kelompok = yield prisma_1.prisma.kelompok.findUnique({
                    where: { id: String(kelompokId) },
                });
                if (!kelompok) {
                    return response_1.default.notFound(res, "Kelompok tidak ditemukan");
                }
                // 📊 Group by jenjang DI DALAM kelompok
                const data = yield prisma_1.prisma.mumi.groupBy({
                    by: ["jenjangId"],
                    where: {
                        kelompokId: String(kelompokId),
                    },
                    _count: {
                        _all: true,
                    },
                });
                const jenjangIds = data.map((d) => d.jenjangId);
                const jenjangList = yield prisma_1.prisma.jenjang.findMany({
                    where: {
                        id: { in: jenjangIds },
                    },
                });
                const result = data.map((item) => {
                    const jenjang = jenjangList.find((j) => j.id === item.jenjangId);
                    return {
                        jenjangId: item.jenjangId,
                        jenjangNama: (jenjang === null || jenjang === void 0 ? void 0 : jenjang.name) || "-",
                        total: item._count._all,
                    };
                });
                return response_1.default.success(res, result, "✅ Statistik generus per jenjang berdasarkan kelompok");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil statistik generus per jenjang kelompok");
            }
        });
    },
    countMumi(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { daerahId, desaId, kelompokId } = req.query;
                const where = {};
                if (daerahId) {
                    where.daerahId = String(daerahId);
                }
                if (desaId) {
                    where.desaId = String(desaId);
                }
                if (kelompokId) {
                    where.kelompokId = String(kelompokId);
                }
                const totalMumi = yield prisma_1.prisma.mumi.count({
                    where,
                });
                return response_1.default.success(res, {
                    total: totalMumi,
                    filter: {
                        daerahId: daerahId !== null && daerahId !== void 0 ? daerahId : null,
                        desaId: desaId !== null && desaId !== void 0 ? desaId : null,
                        kelompokId: kelompokId !== null && kelompokId !== void 0 ? kelompokId : null,
                    },
                }, "✅ Berhasil menghitung jumlah mumi");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menghitung jumlah mumi");
            }
        });
    },
};
