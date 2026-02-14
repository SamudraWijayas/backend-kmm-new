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
// 🧩 Validasi input untuk tambah Kelompok
const kelompokAddDTO = Yup.object({
    name: Yup.string().required("Nama kelompok wajib diisi"),
    daerahId: Yup.string().required("Daerah wajib diisi"),
    desaId: Yup.string().required("Desa wajib diisi"),
});
exports.default = {
    // 🟢 Tambah kelompok
    addKelompok(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = yield kelompokAddDTO.validate(req.body, {
                    abortEarly: false,
                    stripUnknown: true,
                });
                const { name, daerahId, desaId } = payload;
                // ✅ Pastikan daerah ada
                const daerah = yield prisma_1.prisma.daerah.findUnique({
                    where: { id: daerahId },
                });
                if (!daerah) {
                    return response_1.default.notFound(res, "Daerah tidak ditemukan");
                }
                // pastikan desa ada
                const desa = yield prisma_1.prisma.desa.findUnique({
                    where: { id: desaId },
                });
                if (!desa) {
                    return response_1.default.notFound(res, "Desa tidak ditemukan");
                }
                // ✅ Cek duplikat nama kelompok dalam daerah yang sama
                const existing = yield prisma_1.prisma.kelompok.findFirst({
                    where: {
                        name,
                        daerahId,
                        desaId,
                    },
                });
                if (existing) {
                    return response_1.default.conflict(res, "Nama kelompok sudah terdaftar di daerah ini");
                }
                // ✅ Simpan data
                const newKelompok = yield prisma_1.prisma.kelompok.create({
                    data: {
                        name,
                        daerahId,
                        desaId,
                    },
                    include: {
                        daerah: true,
                        desa: true,
                    },
                });
                return response_1.default.success(res, newKelompok, "✅ Berhasil menambahkan kelompok!");
            }
            catch (error) {
                if (error.name === "ValidationError") {
                    return response_1.default.error(res, error, "❌ Validasi gagal");
                }
                response_1.default.error(res, error, "❌ Gagal menambahkan kelompok");
            }
        });
    },
    findAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { limit = 100, page = 1, search, daerahId, desaId } = req.query;
                const where = {};
                if (search) {
                    where.name = { contains: String(search), mode: "insensitive" };
                }
                if (daerahId) {
                    where.daerahId = String(daerahId);
                }
                if (desaId) {
                    where.desaId = String(desaId);
                }
                const kelompokList = yield prisma_1.prisma.kelompok.findMany({
                    where,
                    include: {
                        daerah: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        desa: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                    take: +limit,
                    skip: (+page - 1) * +limit,
                });
                const total = yield prisma_1.prisma.kelompok.count({ where });
                return response_1.default.pagination(res, kelompokList, {
                    current: +page,
                    total,
                    totalPages: Math.ceil(total / +limit),
                }, "✅ Berhasil mengambil daftar kelompok");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil daftar kelompok");
            }
        });
    },
    findByDaerah(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { daerahId } = req.params;
                const { limit = 15, page = 1, search } = req.query;
                if (!daerahId) {
                    return response_1.default.error(res, null, "❌ daerahId wajib diisi");
                }
                // ✅ Pastikan daerah ada
                const daerah = yield prisma_1.prisma.daerah.findUnique({
                    where: { id: String(daerahId) },
                });
                if (!daerah) {
                    return response_1.default.notFound(res, "Daerah tidak ditemukan");
                }
                const where = {
                    daerahId: String(daerahId),
                };
                if (search) {
                    where.name = { contains: String(search) };
                }
                const kelompokList = yield prisma_1.prisma.kelompok.findMany({
                    where,
                    orderBy: { createdAt: "asc" },
                    take: +limit,
                    skip: (+page - 1) * +limit,
                });
                const total = yield prisma_1.prisma.kelompok.count({ where });
                return response_1.default.pagination(res, kelompokList, {
                    current: +page,
                    total,
                    totalPages: Math.ceil(total / +limit),
                }, `✅ Berhasil mengambil kelompok di daerah ${daerah.name}`);
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil kelompok berdasarkan daerah");
            }
        });
    },
    // 🔵 Detail kelompok
    findOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const kelompok = yield prisma_1.prisma.kelompok.findUnique({
                    where: { id: String(id) },
                    include: { daerah: true, desa: true },
                });
                if (!kelompok) {
                    return response_1.default.notFound(res, "kelompok tidak ditemukan");
                }
                response_1.default.success(res, kelompok, "✅ Detail kelompok ditemukan");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil detail kelompok");
            }
        });
    },
    // 🟣 Update kelompok
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const payload = yield kelompokAddDTO.validate(req.body, {
                    abortEarly: false,
                    stripUnknown: true,
                });
                const { name, daerahId, desaId } = payload;
                // ✅ Pastikan kelompok ada
                const kelompok = yield prisma_1.prisma.kelompok.findUnique({
                    where: { id: String(id) },
                });
                if (!kelompok)
                    return response_1.default.notFound(res, "kelompok tidak ditemukan");
                // ✅ Pastikan daerah tujuan valid
                const daerah = yield prisma_1.prisma.daerah.findUnique({
                    where: { id: daerahId },
                });
                if (!daerah)
                    return response_1.default.notFound(res, "Daerah tidak ditemukan");
                // ✅ Pastikan desa tujuan valid
                const desa = yield prisma_1.prisma.desa.findUnique({
                    where: { id: desaId },
                });
                if (!desa)
                    return response_1.default.notFound(res, "Desa tidak ditemukan");
                // ✅ Cek duplikat nama di daerah yang sama (kecuali dirinya sendiri)
                const existing = yield prisma_1.prisma.kelompok.findFirst({
                    where: {
                        name,
                        daerahId,
                        desaId,
                        NOT: { id: String(id) },
                    },
                });
                if (existing)
                    return response_1.default.conflict(res, "Nama kelompok sudah terdaftar di daerah ini");
                // ✅ Update data
                const updated = yield prisma_1.prisma.kelompok.update({
                    where: { id: String(id) },
                    data: { name, daerahId, desaId },
                    include: { daerah: true, desa: true },
                });
                response_1.default.success(res, updated, "✅ kelompok berhasil diperbarui!");
            }
            catch (error) {
                if (error.name === "ValidationError") {
                    return response_1.default.error(res, error, "❌ Validasi gagal");
                }
                response_1.default.error(res, error, "❌ Gagal memperbarui kelompok");
            }
        });
    },
    // 🟠 Hapus kelompok
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const existing = yield prisma_1.prisma.kelompok.findUnique({
                    where: { id: String(id) },
                });
                if (!existing) {
                    return response_1.default.notFound(res, "kelompok tidak ditemukan");
                }
                yield prisma_1.prisma.kelompok.delete({
                    where: { id: String(id) },
                });
                response_1.default.success(res, null, "✅ kelompok berhasil dihapus");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menghapus kelompok");
            }
        });
    },
    // 🔢 Hitung jumlah kelompok (optional filter: daerahId, desaId)
    countKelompok(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { daerahId, desaId, search } = req.query;
                const where = {};
                if (daerahId) {
                    where.daerahId = String(daerahId);
                }
                if (desaId) {
                    where.desaId = String(desaId);
                }
                if (search) {
                    where.name = {
                        contains: String(search),
                        mode: "insensitive",
                    };
                }
                const totalKelompok = yield prisma_1.prisma.kelompok.count({
                    where,
                });
                return response_1.default.success(res, {
                    total: totalKelompok,
                    filter: {
                        daerahId: daerahId !== null && daerahId !== void 0 ? daerahId : null,
                        desaId: desaId !== null && desaId !== void 0 ? desaId : null,
                        search: search !== null && search !== void 0 ? search : null,
                    },
                }, "✅ Berhasil menghitung jumlah kelompok");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menghitung jumlah kelompok");
            }
        });
    },
    // 🔍 Ambil kelompok berdasarkan desaId
    findByDesa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { desaId } = req.params;
                // validasi desa
                const desa = yield prisma_1.prisma.desa.findUnique({
                    where: { id: String(desaId) },
                });
                if (!desa) {
                    return response_1.default.notFound(res, "Desa tidak ditemukan");
                }
                const kelompokList = yield prisma_1.prisma.kelompok.findMany({
                    where: {
                        desaId: String(desaId),
                    },
                    include: {
                        daerah: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        desa: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                });
                return response_1.default.success(res, kelompokList, `✅ Daftar kelompok berdasarkan desa ${desa.name}`);
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil kelompok berdasarkan desa");
            }
        });
    },
    countKelompokByDaerah(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { daerahId } = req.params;
                if (!daerahId) {
                    return response_1.default.error(res, null, "❌ daerahId wajib diisi");
                }
                // ✅ Pastikan daerah ada
                const daerah = yield prisma_1.prisma.daerah.findUnique({
                    where: { id: String(daerahId) },
                });
                if (!daerah) {
                    return response_1.default.notFound(res, "Daerah tidak ditemukan");
                }
                const totalKelompok = yield prisma_1.prisma.kelompok.count({
                    where: {
                        daerahId: String(daerahId),
                    },
                });
                return response_1.default.success(res, {
                    daerahId,
                    daerahNama: daerah.name,
                    total: totalKelompok,
                }, `Total desa di daerah ${daerah.name}: ${totalKelompok}`);
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menghitung desa berdasarkan daerah");
            }
        });
    },
};
