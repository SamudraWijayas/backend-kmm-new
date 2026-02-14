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
                const conditions = [];
                // 🔹 Filter jenis kelamin
                if (kegiatan.jenisKelamin && kegiatan.jenisKelamin !== "SEMUA") {
                    conditions.push({
                        jenis_kelamin: kegiatan.jenisKelamin,
                    });
                }
                // 🔹 Scope wilayah
                if (kegiatan.tingkat === "DAERAH") {
                    conditions.push({ daerahId: kegiatan.daerahId });
                }
                if (kegiatan.tingkat === "DESA") {
                    conditions.push({ desaId: kegiatan.desaId });
                }
                if (kegiatan.tingkat === "KELOMPOK") {
                    conditions.push({ kelompokId: kegiatan.kelompokId });
                }
                // 🎯 TARGET FILTER
                if (kegiatan.targetType === "JENJANG") {
                    const jenjangIds = kegiatan.sasaran.map((s) => s.jenjang.id);
                    if (!jenjangIds.length) {
                        return response_1.default.success(res, { kegiatan, peserta: [] }, "Tidak ada sasaran jenjang");
                    }
                    conditions.push({
                        jenjang: {
                            id: {
                                in: jenjangIds,
                            },
                        },
                    });
                }
                if (kegiatan.targetType === "MAHASISWA") {
                    conditions.push({ mahasiswa: true });
                }
                if (kegiatan.targetType === "USIA") {
                    const today = new Date();
                    const tglLahirFilter = {};
                    if (kegiatan.maxUsia != null) {
                        const minDate = new Date(today);
                        minDate.setFullYear(today.getFullYear() - kegiatan.maxUsia);
                        tglLahirFilter.gte = minDate;
                    }
                    if (kegiatan.minUsia != null) {
                        const maxDate = new Date(today);
                        maxDate.setFullYear(today.getFullYear() - kegiatan.minUsia);
                        tglLahirFilter.lte = maxDate;
                    }
                    conditions.push({
                        tgl_lahir: tglLahirFilter,
                    });
                }
                const whereMumi = conditions.length ? { AND: conditions } : {};
                console.log("FINAL WHERE:", JSON.stringify(whereMumi, null, 2));
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
            const { name, startDate, endDate, tingkat, daerahId, desaId, kelompokId, jenjangIds, } = req.body;
            try {
                yield kegiatanAddDTO.validate({
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
                    return response_1.default.error(res, null, "daerahId wajib diisi untuk kegiatan daerah");
                }
                if (tingkat === "DESA" && !desaId) {
                    return response_1.default.error(res, null, "desaId wajib diisi untuk kegiatan desa");
                }
                if (tingkat === "KELOMPOK" && !kelompokId) {
                    return response_1.default.error(res, null, "kelompokId wajib diisi untuk kegiatan kelompok");
                }
                // Update data kegiatan + hapus relasi lama dulu
                const updated = yield prisma_1.prisma.kegiatan.update({
                    where: { id: String(id) },
                    data: {
                        name,
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                        tingkat,
                        daerahId: daerahId !== null && daerahId !== void 0 ? daerahId : null,
                        desaId: desaId !== null && desaId !== void 0 ? desaId : null,
                        kelompokId: kelompokId !== null && kelompokId !== void 0 ? kelompokId : null,
                        sasaran: {
                            deleteMany: {}, // hapus relasi lama
                            create: jenjangIds.map((id) => ({ jenjangId: id })),
                        },
                    },
                    include: {
                        sasaran: { include: { jenjang: true } },
                    },
                });
                response_1.default.success(res, updated, "✅ Berhasil memperbarui kegiatan!");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal memperbarui kegiatan");
            }
        });
    },
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
    findByDaerah(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const daerahId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.daerahId;
                const userJenjangId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.jenjangId;
                const { tanggal } = req.query; // ambil dari query params, misal ?tanggal=2025-12-24T00:31:00.000Z
                if (!daerahId) {
                    return response_1.default.notFound(res, "User tidak memiliki daerah terkait");
                }
                if (!userJenjangId) {
                    return response_1.default.notFound(res, "User tidak memiliki jenjang terkait");
                }
                const whereClause = {
                    daerahId: daerahId,
                    sasaran: {
                        some: {
                            jenjangId: userJenjangId,
                        },
                    },
                };
                if (tanggal) {
                    const tgl = new Date(tanggal);
                    const startOfDay = new Date(tgl);
                    startOfDay.setHours(0, 0, 0, 0); // 00:00:00
                    const endOfDay = new Date(tgl);
                    endOfDay.setHours(23, 59, 59, 999); // 23:59:59
                    whereClause.startDate = { gte: startOfDay, lte: endOfDay }; // ambil semua kegiatan di tanggal itu
                }
                const kegiatanList = yield prisma_1.prisma.kegiatan.findMany({
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
                response_1.default.success(res, kegiatanList, "✅ Berhasil mengambil kegiatan desa sesuai jenjang user");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil kegiatan desa");
            }
        });
    },
    findByDesa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const desaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.desaId;
                const userJenjangId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.jenjangId;
                const { tanggal } = req.query; // misal ?tanggal=2025-12-24T00:31:00.000Z
                if (!desaId) {
                    return response_1.default.notFound(res, "User tidak memiliki desa terkait");
                }
                if (!userJenjangId) {
                    return response_1.default.notFound(res, "User tidak memiliki jenjang terkait");
                }
                const whereClause = {
                    desaId: desaId,
                    sasaran: {
                        some: {
                            jenjangId: userJenjangId,
                        },
                    },
                };
                if (tanggal) {
                    const tgl = new Date(tanggal);
                    const startOfDay = new Date(tgl);
                    startOfDay.setHours(0, 0, 0, 0); // 00:00:00
                    const endOfDay = new Date(tgl);
                    endOfDay.setHours(23, 59, 59, 999); // 23:59:59
                    whereClause.startDate = { gte: startOfDay, lte: endOfDay }; // ambil semua kegiatan di tanggal itu
                }
                const kegiatanList = yield prisma_1.prisma.kegiatan.findMany({
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
                response_1.default.success(res, kegiatanList, "✅ Berhasil mengambil kegiatan desa sesuai jenjang user");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil kegiatan desa");
            }
        });
    },
    findAllByFilter(req, res) {
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
                const kegiatanList = yield prisma_1.prisma.kegiatan.findMany({
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
                response_1.default.success(res, kegiatanList, "✅ Berhasil mengambil semua kegiatan");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil daftar kegiatan");
            }
        });
    },
};
