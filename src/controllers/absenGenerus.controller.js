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
const absenDTO = Yup.object({
    kegiatanId: Yup.string().required("ID kegiatan wajib diisi"),
    manualStatus: Yup.string()
        .oneOf(["HADIR", "TIDAK_HADIR", "TERLAMBAT"])
        .nullable(),
});
exports.default = {
    // ✅ Absen dengan barcode
    absen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { kegiatanId, manualStatus } = req.body;
            const mumiId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!mumiId) {
                return response_1.default.unauthorized(res, "User MUMI tidak valid");
            }
            try {
                yield absenDTO.validate({ kegiatanId, mumiId, manualStatus });
                const kegiatan = yield prisma_1.prisma.kegiatan.findUnique({
                    where: { id: kegiatanId },
                });
                if (!kegiatan) {
                    return response_1.default.notFound(res, "Kegiatan tidak ditemukan");
                }
                const existing = yield prisma_1.prisma.absenGenerus.findFirst({
                    where: { kegiatanId, mumiId },
                });
                if (existing) {
                    return response_1.default.notFound(res, `Kamu sudah melakukan absen`);
                }
                const now = new Date();
                const start = new Date(kegiatan.startDate);
                const toleransiMenit = 15;
                const batasTerlambat = new Date(start.getTime() + toleransiMenit * 60000);
                let statusFinal = manualStatus;
                if (!manualStatus) {
                    statusFinal = now <= batasTerlambat ? "HADIR" : "TERLAMBAT";
                }
                const absen = yield prisma_1.prisma.absenGenerus.create({
                    data: {
                        kegiatanId,
                        mumiId,
                        status: statusFinal,
                        waktuAbsen: now,
                    },
                });
                response_1.default.success(res, absen, `Absensi kamu berhasil! Status kehadiran: ${statusFinal}`);
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menyimpan absensi");
            }
        });
    },
    // ✅ Daftar absen per kegiatan
    findByKegiatan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { kegiatanId } = req.params;
            try {
                const list = yield prisma_1.prisma.absenGenerus.findMany({
                    where: { kegiatanId: String(kegiatanId) },
                    include: {
                        mumi: {
                            select: { id: true, nama: true, jenjang: true },
                        },
                    },
                    orderBy: { waktuAbsen: "desc" },
                });
                response_1.default.success(res, list, "✅ Daftar absensi berhasil diambil");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil daftar absensi");
            }
        });
    },
    // ✅ Riwayat absen per generus
    findByGenerus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { mumiId } = req.params;
            try {
                const riwayat = yield prisma_1.prisma.absenGenerus.findMany({
                    where: { mumiId: Number(mumiId) },
                    include: {
                        kegiatan: { select: { id: true, name: true, startDate: true } },
                    },
                    orderBy: { waktuAbsen: "desc" },
                });
                response_1.default.success(res, riwayat, "✅ Riwayat absensi berhasil diambil");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil riwayat absensi");
            }
        });
    },
    // ✅ Hapus absen (opsional)
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield prisma_1.prisma.absenGenerus.delete({
                    where: { id: String(id) },
                });
                response_1.default.success(res, null, "✅ Absensi berhasil dihapus");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menghapus absensi");
            }
        });
    },
};
