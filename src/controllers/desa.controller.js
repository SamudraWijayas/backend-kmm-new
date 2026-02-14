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
// 🧩 Validasi input untuk tambah Desa
const desaAddDTO = Yup.object({
    name: Yup.string().required("Nama desa wajib diisi"),
    daerahId: Yup.string().required("Daerah wajib diisi"),
});
exports.default = {
    // 🟢 Tambah Desa
    addDesa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = yield desaAddDTO.validate(req.body, {
                    abortEarly: false,
                    stripUnknown: true,
                });
                const { name, daerahId } = payload;
                // ✅ Pastikan daerah ada
                const daerah = yield prisma_1.prisma.daerah.findUnique({
                    where: { id: daerahId },
                });
                if (!daerah) {
                    return response_1.default.notFound(res, "Daerah tidak ditemukan");
                }
                // ✅ Cek duplikat nama desa dalam daerah yang sama
                const existing = yield prisma_1.prisma.desa.findFirst({
                    where: {
                        name,
                        daerahId,
                    },
                });
                if (existing) {
                    return response_1.default.conflict(res, "Nama desa sudah terdaftar di daerah ini");
                }
                // ✅ Simpan data
                const newDesa = yield prisma_1.prisma.desa.create({
                    data: {
                        name,
                        daerahId,
                    },
                    include: {
                        daerah: true,
                    },
                });
                return response_1.default.success(res, newDesa, "✅ Berhasil menambahkan desa!");
            }
            catch (error) {
                if (error.name === "ValidationError") {
                    return response_1.default.error(res, error, "❌ Validasi gagal");
                }
                response_1.default.error(res, error, "❌ Gagal menambahkan desa");
            }
        });
    },
    // 🟡 Ambil daftar Desa (dengan pagination & filter)
    findAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { limit = 15, page = 1, search, daerahId } = req.query;
                const where = {};
                if (search) {
                    where.name = { contains: search };
                }
                // Filter berdasarkan daerahId
                if (daerahId) {
                    where.daerahId = String(daerahId);
                }
                // Ambil data desa dengan urutan paling lama di atas (ascending)
                const desaList = yield prisma_1.prisma.desa.findMany({
                    where,
                    include: {
                        daerah: true,
                    },
                    orderBy: { createdAt: "asc" }, // ⬅️ dari yang paling lama ke terbaru
                    take: +limit,
                    skip: (+page - 1) * +limit,
                });
                // Hitung total data
                const total = yield prisma_1.prisma.desa.count({ where });
                return response_1.default.pagination(res, desaList, {
                    current: +page,
                    total,
                    totalPages: Math.ceil(total / +limit),
                }, "✅ Berhasil mengambil daftar desa");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil daftar desa");
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
                const desaList = yield prisma_1.prisma.desa.findMany({
                    where,
                    orderBy: { createdAt: "asc" },
                    take: +limit,
                    skip: (+page - 1) * +limit,
                });
                const total = yield prisma_1.prisma.desa.count({ where });
                return response_1.default.pagination(res, desaList, {
                    current: +page,
                    total,
                    totalPages: Math.ceil(total / +limit),
                }, `✅ Berhasil mengambil desa di daerah ${daerah.name}`);
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil desa berdasarkan daerah");
            }
        });
    },
    // 🔵 Detail desa
    findOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const desa = yield prisma_1.prisma.desa.findUnique({
                    where: { id: String(id) },
                    include: { daerah: true },
                });
                if (!desa) {
                    return response_1.default.notFound(res, "Desa tidak ditemukan");
                }
                response_1.default.success(res, desa, "✅ Detail desa ditemukan");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil detail desa");
            }
        });
    },
    // 🟣 Update Desa
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const payload = yield desaAddDTO.validate(req.body, {
                    abortEarly: false,
                    stripUnknown: true,
                });
                const { name, daerahId } = payload;
                // ✅ Pastikan desa ada
                const desa = yield prisma_1.prisma.desa.findUnique({
                    where: { id: String(id) },
                });
                if (!desa)
                    return response_1.default.notFound(res, "Desa tidak ditemukan");
                // ✅ Pastikan daerah tujuan valid
                const daerah = yield prisma_1.prisma.daerah.findUnique({
                    where: { id: daerahId },
                });
                if (!daerah)
                    return response_1.default.notFound(res, "Daerah tidak ditemukan");
                // ✅ Cek duplikat nama di daerah yang sama (kecuali dirinya sendiri)
                const existing = yield prisma_1.prisma.desa.findFirst({
                    where: {
                        name,
                        daerahId,
                        NOT: { id: String(id) },
                    },
                });
                if (existing)
                    return response_1.default.conflict(res, "Nama desa sudah terdaftar di daerah ini");
                // ✅ Update data
                const updated = yield prisma_1.prisma.desa.update({
                    where: { id: String(id) },
                    data: { name, daerahId },
                    include: { daerah: true },
                });
                response_1.default.success(res, updated, "✅ Desa berhasil diperbarui!");
            }
            catch (error) {
                if (error.name === "ValidationError") {
                    return response_1.default.error(res, error, "❌ Validasi gagal");
                }
                response_1.default.error(res, error, "❌ Gagal memperbarui desa");
            }
        });
    },
    // 🟠 Hapus desa
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const existing = yield prisma_1.prisma.desa.findUnique({
                    where: { id: String(id) },
                });
                if (!existing) {
                    return response_1.default.notFound(res, "Desa tidak ditemukan");
                }
                yield prisma_1.prisma.desa.delete({
                    where: { id: String(id) },
                });
                response_1.default.success(res, null, "✅ Desa berhasil dihapus");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menghapus desa");
            }
        });
    },
    // 🧮 Hitung semua desa (tanpa filter)
    countDesa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalDesa = yield prisma_1.prisma.desa.count();
                return response_1.default.success(res, { total: totalDesa }, `✅ Total semua desa: ${totalDesa}`);
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menghitung jumlah desa");
            }
        });
    },
    // 🧮 Hitung desa berdasarkan daerahId
    countDesaByDaerah(req, res) {
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
                const totalDesa = yield prisma_1.prisma.desa.count({
                    where: {
                        daerahId: String(daerahId),
                    },
                });
                return response_1.default.success(res, {
                    daerahId,
                    daerahNama: daerah.name,
                    total: totalDesa,
                }, `Total desa di daerah ${daerah.name}: ${totalDesa}`);
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menghitung desa berdasarkan daerah");
            }
        });
    },
};
