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
const uploader_dok_1 = __importDefault(require("../utils/uploader-dok"));
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
function hitungUmur(tglLahir) {
    const today = new Date();
    let umur = today.getFullYear() - tglLahir.getFullYear();
    const m = today.getMonth() - tglLahir.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < tglLahir.getDate())) {
        umur--;
    }
    return umur;
}
exports.default = {
    // ✅ Tambah kegiatan baru
    addKegiatan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, startDate, endDate, tingkat, targetType, jenisKelamin = "SEMUA", daerahId, desaId, kelompokId, jenjangIds = [], minUsia, maxUsia, } = req.body;
            try {
                yield kegiatanAddDTO.validate(req.body);
                // 🔒 Validasi wilayah
                if (tingkat === "DAERAH" && !daerahId)
                    return response_1.default.error(res, null, "daerahId wajib diisi");
                if (tingkat === "DESA" && !desaId)
                    return response_1.default.error(res, null, "desaId wajib diisi");
                if (tingkat === "KELOMPOK" && !kelompokId)
                    return response_1.default.error(res, null, "kelompokId wajib diisi");
                // 🔒 Validasi target
                if (targetType === "JENJANG" && jenjangIds.length === 0)
                    return response_1.default.error(res, null, "Jenjang wajib dipilih");
                if (targetType === "USIA" && (minUsia == null || maxUsia == null))
                    return response_1.default.error(res, null, "Range usia wajib diisi");
                const kegiatan = yield prisma_1.prisma.kegiatan.create({
                    data: {
                        name,
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                        tingkat,
                        targetType,
                        jenisKelamin,
                        daerahId: daerahId !== null && daerahId !== void 0 ? daerahId : null,
                        desaId: desaId !== null && desaId !== void 0 ? desaId : null,
                        kelompokId: kelompokId !== null && kelompokId !== void 0 ? kelompokId : null,
                        minUsia: targetType === "USIA" ? minUsia : null,
                        maxUsia: targetType === "USIA" ? maxUsia : null,
                        sasaran: targetType === "JENJANG"
                            ? { create: jenjangIds.map((id) => ({ jenjangId: id })) }
                            : undefined,
                    },
                    include: {
                        sasaran: { include: { jenjang: true } },
                    },
                });
                response_1.default.success(res, kegiatan, "✅ Berhasil menambahkan kegiatan");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menambahkan kegiatan");
            }
        });
    },
    // ✅ Ambil semua kegiatan
    findAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const kegiatanList = yield prisma_1.prisma.kegiatan.findMany({
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
                response_1.default.success(res, kegiatanList, "✅ Berhasil mengambil semua kegiatan");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil daftar kegiatan");
            }
        });
    },
    // ✅ Ambil satu kegiatan berdasarkan ID
    findOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const kegiatan = yield prisma_1.prisma.kegiatan.findUnique({
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
                    return response_1.default.notFound(res, "Kegiatan tidak ditemukan");
                }
                // 🔹 Ambil jenjang jika target = JENJANG
                const jenjangIds = kegiatan.targetType === "JENJANG"
                    ? kegiatan.sasaran.map((s) => s.jenjangId)
                    : [];
                const whereMumi = {};
                function mapJenisKelaminKegiatanToMumi(value) {
                    const map = {
                        LAKI_LAKI: "Laki-laki",
                        PEREMPUAN: "Perempuan",
                    };
                    return map[value];
                }
                if (kegiatan.jenisKelamin && kegiatan.jenisKelamin !== "SEMUA") {
                    whereMumi.jenis_kelamin = mapJenisKelaminKegiatanToMumi(kegiatan.jenisKelamin);
                }
                // if (kegiatan.jenisKelamin && kegiatan.jenisKelamin !== "SEMUA") {
                //   whereMumi.jenis_kelamin = kegiatan.jenisKelamin;
                // }
                // 📍 Scope wilayah sesuai tingkat
                if (kegiatan.tingkat === "DAERAH") {
                    whereMumi.daerahId = kegiatan.daerahId;
                }
                else if (kegiatan.tingkat === "DESA") {
                    whereMumi.desaId = kegiatan.desaId;
                }
                else if (kegiatan.tingkat === "KELOMPOK") {
                    whereMumi.kelompokId = kegiatan.kelompokId;
                }
                // 🎯 TARGET FILTER
                if (kegiatan.targetType === "JENJANG") {
                    if (jenjangIds.length === 0) {
                        return response_1.default.success(res, { kegiatan, peserta: [] }, "⚠️ Kegiatan ini tidak memiliki sasaran jenjang");
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
                    const tglLahirFilter = {};
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
                const mumiList = yield prisma_1.prisma.mumi.findMany({
                    where: whereMumi,
                    include: {
                        jenjang: true,
                        daerah: true,
                        desa: true,
                        kelompok: true,
                    },
                });
                // 🔍 Ambil absensi
                const absensi = yield prisma_1.prisma.absenGenerus.findMany({
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
                    return Object.assign(Object.assign({}, m), { status: absen ? absen.status : "TIDAK_HADIR", waktuAbsen: absen ? absen.waktuAbsen : null });
                });
                response_1.default.success(res, { kegiatan, peserta: pesertaDenganStatus }, "✅ Berhasil mengambil kegiatan & peserta wajib");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil kegiatan");
            }
        });
    },
    // ✅ Update kegiatan
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, startDate, endDate, tingkat, targetType, jenisKelamin = "SEMUA", daerahId, desaId, kelompokId, jenjangIds = [], minUsia, maxUsia, dokumentasi = [], } = req.body;
            try {
                if (tingkat === "DAERAH" && !daerahId) {
                    return response_1.default.error(res, null, "daerahId wajib diisi untuk kegiatan daerah");
                }
                if (tingkat === "DESA" && !desaId) {
                    return response_1.default.error(res, null, "desaId wajib diisi untuk kegiatan desa");
                }
                if (tingkat === "KELOMPOK" && !kelompokId) {
                    return response_1.default.error(res, null, "kelompokId wajib diisi untuk kegiatan kelompok");
                }
                // Update kegiatan
                const updated = yield prisma_1.prisma.kegiatan.update({
                    where: { id: String(id) },
                    data: {
                        name,
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                        tingkat,
                        targetType,
                        jenisKelamin,
                        daerahId: daerahId !== null && daerahId !== void 0 ? daerahId : null,
                        desaId: desaId !== null && desaId !== void 0 ? desaId : null,
                        kelompokId: kelompokId !== null && kelompokId !== void 0 ? kelompokId : null,
                        minUsia: targetType === "USIA" ? minUsia : null,
                        maxUsia: targetType === "USIA" ? maxUsia : null,
                        // Update sasaran jenjang
                        sasaran: {
                            deleteMany: {}, // hapus relasi lama
                            create: targetType === "JENJANG"
                                ? jenjangIds.map((id) => ({ jenjangId: id }))
                                : [],
                        },
                        // Update dokumentasi langsung dari URL yang dikirim frontend
                        dokumentasi: {
                            deleteMany: {}, // hapus dokumentasi lama
                            create: dokumentasi.map((d) => ({
                                url: d.url,
                            })),
                        },
                    },
                    include: {
                        sasaran: { include: { jenjang: true } },
                        dokumentasi: true,
                    },
                });
                response_1.default.success(res, updated, "✅ Berhasil memperbarui kegiatan!");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal memperbarui kegiatan");
            }
        });
    },
    updateDokumentasi(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { dokumentasi = [] } = req.body;
            try {
                if (!Array.isArray(dokumentasi)) {
                    return response_1.default.error(res, null, "dokumentasi harus berupa array");
                }
                // 1️⃣ Ambil dokumentasi lama
                const existing = yield prisma_1.prisma.kegiatan.findUnique({
                    where: { id: String(id) },
                    include: { dokumentasi: true },
                });
                if (!existing) {
                    return response_1.default.error(res, null, "Data tidak ditemukan");
                }
                // 2️⃣ Hapus file lama dari storage
                for (const doc of existing.dokumentasi) {
                    try {
                        yield uploader_dok_1.default.remove(doc.url);
                    }
                    catch (err) {
                        console.warn("Gagal hapus file:", doc.url);
                    }
                }
                // 3️⃣ Update DB
                const updated = yield prisma_1.prisma.kegiatan.update({
                    where: { id: String(id) },
                    data: {
                        dokumentasi: {
                            deleteMany: {},
                            create: dokumentasi.map((d) => typeof d === "string" ? { url: d } : { url: d.url }),
                        },
                    },
                    include: { dokumentasi: true },
                });
                response_1.default.success(res, updated, "✅ Berhasil memperbarui dokumentasi!");
            }
            catch (error) {
                console.error(error);
                response_1.default.error(res, error, "❌ Gagal memperbarui dokumentasi");
            }
        });
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
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                // await prisma.kegiatanSasaran.deleteMany({
                //   where: { kegiatanId: String(id) },
                // });
                yield prisma_1.prisma.kegiatan.delete({
                    where: { id: String(id) },
                });
                response_1.default.success(res, null, "✅ Kegiatan berhasil dihapus");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menghapus kegiatan");
            }
        });
    },
    // login generus
    findAuthMumiByDaerah(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mumi = req.user;
                const { tanggal } = req.query;
                if (!(mumi === null || mumi === void 0 ? void 0 : mumi.daerahId)) {
                    return response_1.default.notFound(res, "User tidak memiliki daerah terkait");
                }
                const whereKegiatan = {
                    daerahId: mumi.daerahId,
                };
                // 📅 Filter tanggal (opsional)
                if (tanggal) {
                    const tgl = new Date(tanggal);
                    const start = new Date(tgl.setHours(0, 0, 0, 0));
                    const end = new Date(tgl.setHours(23, 59, 59, 999));
                    whereKegiatan.startDate = { gte: start, lte: end };
                }
                // 📦 Ambil semua kegiatan di daerah
                const kegiatanList = yield prisma_1.prisma.kegiatan.findMany({
                    where: whereKegiatan,
                    include: {
                        sasaran: true,
                    },
                    orderBy: { startDate: "desc" },
                });
                // 🧠 Filter berdasarkan TARGET
                const hasil = kegiatanList.filter((kegiatan) => {
                    var _a, _b;
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
                        return (umur >= ((_a = kegiatan.minUsia) !== null && _a !== void 0 ? _a : 0) && umur <= ((_b = kegiatan.maxUsia) !== null && _b !== void 0 ? _b : 200));
                    }
                    return false;
                });
                response_1.default.success(res, hasil, "✅ Berhasil mengambil kegiatan sesuai target MUMI");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil kegiatan");
            }
        });
    },
    findAuthMumiByDesa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mumi = req.user;
                const { tanggal } = req.query;
                if (!(mumi === null || mumi === void 0 ? void 0 : mumi.daerahId)) {
                    return response_1.default.notFound(res, "User tidak memiliki daerah terkait");
                }
                const whereKegiatan = {
                    desaId: mumi.desaId,
                };
                // 📅 Filter tanggal (opsional)
                if (tanggal) {
                    const tgl = new Date(tanggal);
                    const start = new Date(tgl.setHours(0, 0, 0, 0));
                    const end = new Date(tgl.setHours(23, 59, 59, 999));
                    whereKegiatan.startDate = { gte: start, lte: end };
                }
                // 📦 Ambil semua kegiatan di daerah
                const kegiatanList = yield prisma_1.prisma.kegiatan.findMany({
                    where: whereKegiatan,
                    include: {
                        sasaran: true,
                    },
                    orderBy: { startDate: "desc" },
                });
                // 🧠 Filter berdasarkan TARGET
                const hasil = kegiatanList.filter((kegiatan) => {
                    var _a, _b;
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
                        return (umur >= ((_a = kegiatan.minUsia) !== null && _a !== void 0 ? _a : 0) && umur <= ((_b = kegiatan.maxUsia) !== null && _b !== void 0 ? _b : 200));
                    }
                    return false;
                });
                response_1.default.success(res, hasil, "✅ Berhasil mengambil kegiatan sesuai target MUMI");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil kegiatan");
            }
        });
    },
    findAllByFilter(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { daerahId, desaId, kelompokId } = req.query;
                const where = {};
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
                const kegiatanList = yield prisma_1.prisma.kegiatan.findMany({
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
                response_1.default.success(res, kegiatanList, "✅ Berhasil mengambil semua kegiatan berdasarkan daerah");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil daftar kegiatan");
            }
        });
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
