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
const daerahAddDTO = Yup.object({
    name: Yup.string().required("Nama daerah wajib diisi"),
});
exports.default = {
    // 🟢 Tambah daerah
    addDaerah(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = req.body;
            try {
                yield daerahAddDTO.validate({ name });
                const existing = yield prisma_1.prisma.daerah.findUnique({
                    where: { name },
                });
                if (existing) {
                    return response_1.default.conflict(res, "Nama daerah sudah terdaftar");
                }
                const newDaerah = yield prisma_1.prisma.daerah.create({
                    data: { name },
                });
                response_1.default.success(res, newDaerah, "✅ Berhasil menambahkan daerah!");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menambahkan daerah");
            }
        });
    },
    // 🔍 Ambil semua daerah (dengan pagination)
    findAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { limit = 10, page = 1, search } = req.query;
                const where = {};
                if (search) {
                    where.name = { contains: String(search), mode: "insensitive" };
                }
                const daerahList = yield prisma_1.prisma.daerah.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    take: +limit,
                    skip: (+page - 1) * +limit,
                });
                const total = yield prisma_1.prisma.daerah.count({ where });
                response_1.default.pagination(res, daerahList, {
                    current: +page,
                    total,
                    totalPages: Math.ceil(total / +limit),
                }, "✅ Berhasil mengambil semua daerah");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil daftar daerah");
            }
        });
    },
    // 🔍 Ambil satu daerah berdasarkan ID
    findOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const daerah = yield prisma_1.prisma.daerah.findUnique({
                    where: { id: String(id) },
                    include: {
                        desa: true, // tampilkan desa yang ada di daerah ini
                        kelompok: true, // tampilkan kelompok juga
                    },
                });
                if (!daerah) {
                    return response_1.default.notFound(res, "Daerah tidak ditemukan");
                }
                response_1.default.success(res, daerah, "✅ Berhasil mengambil detail daerah");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil detail daerah");
            }
        });
    },
    // ✏️ Update nama daerah
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name } = req.body;
            try {
                yield daerahAddDTO.validate({ name });
                const daerah = yield prisma_1.prisma.daerah.findUnique({
                    where: { id: String(id) },
                });
                if (!daerah) {
                    return response_1.default.notFound(res, "Daerah tidak ditemukan");
                }
                const updated = yield prisma_1.prisma.daerah.update({
                    where: { id: String(id) },
                    data: { name },
                });
                response_1.default.success(res, updated, "✅ Daerah berhasil diperbarui!");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal memperbarui daerah");
            }
        });
    },
    // ❌ Hapus daerah
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield prisma_1.prisma.daerah.delete({
                    where: { id: String(id) },
                });
                response_1.default.success(res, null, "✅ Daerah berhasil dihapus");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menghapus daerah");
            }
        });
    },
    countDaerah(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalDaerah = yield prisma_1.prisma.daerah.count();
                return response_1.default.success(res, { total: totalDaerah }, `✅ Total semua daerah: ${totalDaerah}`);
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menghitung jumlah daerah");
            }
        });
    },
};
