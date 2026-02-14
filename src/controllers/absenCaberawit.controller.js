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
/* =========================
   🔒 HELPER VALIDASI HARI
========================= */
function validateTanggal(tanggal) {
    const day = tanggal.getDay(); // 0 = Minggu
    if (day === 0) {
        throw new Error("Absensi caberawit tidak boleh hari Minggu");
    }
}
/* =========================
   ✅ DTO
========================= */
const absenDTO = Yup.object({
    caberawitId: Yup.number().required(),
    tanggal: Yup.date().required(),
    status: Yup.string().oneOf(["HADIR", "IZIN", "SAKIT", "ALPA"]).required(),
});
exports.default = {
    /* =========================
       🟢 ABSEN 1 ANAK (SEHARI)
    ========================= */
    absen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { caberawitId, tanggal, status } = req.body;
            try {
                yield absenDTO.validate({ caberawitId, tanggal, status });
                const tanggalAbsen = new Date(tanggal);
                validateTanggal(tanggalAbsen);
                // pastikan caberawit ada
                const caberawit = yield prisma_1.prisma.caberawit.findUnique({
                    where: { id: caberawitId },
                });
                if (!caberawit)
                    return response_1.default.notFound(res, "Caberawit tidak ditemukan");
                // upsert = bisa create / edit
                const data = yield prisma_1.prisma.absenCaberawit.upsert({
                    where: {
                        caberawit_tanggal_unique: {
                            caberawitId,
                            tanggal: tanggalAbsen,
                        },
                    },
                    create: {
                        caberawitId,
                        tanggal: tanggalAbsen,
                        status,
                    },
                    update: {
                        status,
                    },
                    include: {
                        caberawit: true,
                    },
                });
                response_1.default.success(res, data, "✅ Absensi caberawit berhasil disimpan");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menyimpan absensi caberawit");
            }
        });
    },
    /* =========================
       🟢 ABSEN MASSAL (1 TANGGAL)
    ========================= */
    absenMassal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tanggal, list } = req.body;
            // list = [{ caberawitId, status }]
            try {
                const tanggalAbsen = new Date(tanggal);
                validateTanggal(tanggalAbsen);
                if (!Array.isArray(list) || list.length === 0) {
                    return response_1.default.notFound(res, "Data absensi kosong");
                }
                const ops = list.map((item) => prisma_1.prisma.absenCaberawit.upsert({
                    where: {
                        caberawit_tanggal_unique: {
                            caberawitId: item.caberawitId,
                            tanggal: tanggalAbsen,
                        },
                    },
                    create: {
                        caberawitId: item.caberawitId,
                        tanggal: tanggalAbsen,
                        status: item.status || "ALPA",
                    },
                    update: {
                        status: item.status || "ALPA",
                    },
                }));
                yield prisma_1.prisma.$transaction(ops);
                response_1.default.success(res, null, "✅ Absensi caberawit massal berhasil disimpan");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menyimpan absensi massal");
            }
        });
    },
    /* =========================
       🔵 GET ABSENSI PER TANGGAL
    ========================= */
    findByTanggal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tanggal, kelompokId } = req.query;
            try {
                if (!tanggal)
                    return response_1.default.notFound(res, "Tanggal wajib diisi");
                const data = yield prisma_1.prisma.absenCaberawit.findMany({
                    where: {
                        tanggal: new Date(String(tanggal)),
                        caberawit: kelompokId
                            ? { kelompokId: String(kelompokId) }
                            : undefined,
                    },
                    include: {
                        caberawit: {
                            include: {
                                kelompok: true,
                            },
                        },
                    },
                    orderBy: {
                        caberawit: { nama: "asc" },
                    },
                });
                response_1.default.success(res, data, "✅ Data absensi berhasil diambil");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil data absensi");
            }
        });
    },
    /* =========================
       🔴 DELETE ABSENSI
    ========================= */
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield prisma_1.prisma.absenCaberawit.delete({
                    where: { id },
                });
                response_1.default.success(res, null, "✅ Absensi berhasil dihapus");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menghapus absensi");
            }
        });
    },
    findByCaberawitBulanan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { caberawitId } = req.params; // wajib
                let { bulan, tahun } = req.query; // optional
                if (!caberawitId)
                    return response_1.default.notFound(res, "caberawitId wajib diisi");
                // default bulan & tahun = sekarang
                const now = new Date();
                const month = bulan ? Number(bulan) : now.getMonth() + 1; // 1–12
                const year = tahun ? Number(tahun) : now.getFullYear();
                if (month < 1 || month > 12)
                    return response_1.default.error(res, null, "Bulan tidak valid");
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0, 23, 59, 59);
                const data = yield prisma_1.prisma.absenCaberawit.findMany({
                    where: {
                        caberawitId: Number(caberawitId),
                        tanggal: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    orderBy: { tanggal: "asc" },
                });
                response_1.default.success(res, data, "✅ Data absensi caberawit bulanan berhasil diambil");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil absensi bulanan");
            }
        });
    },
    /* =========================
     🔵 GET REKAP ABSENSI CABERAWIT
  ========================= */
    getRekapByCaberawit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { caberawitId } = req.params;
                if (!caberawitId) {
                    return response_1.default.notFound(res, "caberawitId wajib diisi");
                }
                const data = yield prisma_1.prisma.absenCaberawit.groupBy({
                    by: ["status"],
                    where: {
                        caberawitId: Number(caberawitId),
                    },
                    _count: {
                        status: true,
                    },
                });
                // default value biar ga undefined
                const result = {
                    HADIR: 0,
                    IZIN: 0,
                    SAKIT: 0,
                    ALPA: 0,
                    TOTAL: 0,
                };
                data.forEach((item) => {
                    result[item.status] = item._count.status;
                    result.TOTAL += item._count.status;
                });
                response_1.default.success(res, result, "✅ Rekap absensi caberawit berhasil diambil");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil rekap absensi caberawit");
            }
        });
    },
};
