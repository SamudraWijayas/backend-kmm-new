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
// 🔍 Validasi input
const kelasKategoriDTO = Yup.object({
    mataPelajaranId: Yup.string().required("Kategori wajib dipilih"),
    name: Yup.string().required("Nama kelas wajib diisi"),
});
exports.default = {
    // 🟢 Tambah Kelas Kategori
    add(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { mataPelajaranId, name } = req.body;
            try {
                yield kelasKategoriDTO.validate({ mataPelajaranId, name });
                // cek MataPelajaran ada atau tidak
                const existMataPelajaran = yield prisma_1.prisma.mataPelajaran.findUnique({
                    where: { id: mataPelajaranId },
                });
                if (!existMataPelajaran) {
                    return response_1.default.notFound(res, "MataPelajaran tidak ditemukan");
                }
                // cek nama kelas yg sama dalam satu MataPelajaran
                const existClass = yield prisma_1.prisma.kategoriIndikator.findFirst({
                    where: {
                        mataPelajaranId,
                        name,
                    },
                });
                if (existClass) {
                    return response_1.default.conflict(res, "Nama kelas sudah terdaftar di MataPelajaran ini");
                }
                const newClass = yield prisma_1.prisma.kategoriIndikator.create({
                    data: { mataPelajaranId, name },
                    include: { mataPelajaran: true },
                });
                response_1.default.success(res, newClass, "Berhasil menambahkan kelas Kategori!");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal menambahkan kelas");
            }
        });
    },
    // 🟡 Ambil semua kelas per MataPelajaran (optional by MataPelajaran)
    findAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { mataPelajaranId } = req.query;
            try {
                const kelas = yield prisma_1.prisma.kategoriIndikator.findMany({
                    where: mataPelajaranId
                        ? { mataPelajaranId: String(mataPelajaranId) }
                        : undefined,
                    orderBy: [{ mataPelajaranId: "asc" }, { name: "asc" }],
                    include: {
                        mataPelajaran: true,
                        indikator: true, // nested indikatorKelas
                    },
                });
                response_1.default.success(res, kelas, "Berhasil mengambil semua kelas Kategori");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal mengambil kelas Kategori");
            }
        });
    },
    // 🟦 Ambil detail kelas
    findOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const kelas = yield prisma_1.prisma.kategoriIndikator.findUnique({
                    where: { id },
                    include: {
                        mataPelajaran: true,
                        indikator: true, // nested indikatorKelas
                    },
                });
                if (!kelas) {
                    return response_1.default.notFound(res, "Kelas Kategori tidak ditemukan");
                }
                response_1.default.success(res, kelas, "Berhasil mengambil detail kelas");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal mengambil detail kelas");
            }
        });
    },
    // 🟣 Update Kelas
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name } = req.body;
            try {
                yield Yup.object({
                    name: Yup.string().required(),
                }).validate({ name });
                const exist = yield prisma_1.prisma.kategoriIndikator.findUnique({
                    where: { id },
                });
                if (!exist) {
                    return response_1.default.notFound(res, "Kelas tidak ditemukan");
                }
                const updated = yield prisma_1.prisma.kategoriIndikator.update({
                    where: { id },
                    data: { name },
                    include: { mataPelajaran: true },
                });
                response_1.default.success(res, updated, "Kelas Kategori berhasil diperbarui!");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal memperbarui kelas Kategori");
            }
        });
    },
    // 🔴 Hapus kelas
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                // cek dulu relasi indikator, hapus atau batalkan jika ada
                const exist = yield prisma_1.prisma.kategoriIndikator.findUnique({
                    where: { id },
                    include: { indikator: true },
                });
                if (!exist) {
                    return response_1.default.notFound(res, "Kelas Kategori tidak ditemukan");
                }
                if (exist.indikator.length > 0) {
                    return response_1.default.conflict(res, "Kelas masih memiliki indikator, hapus indikator terlebih dahulu");
                }
                yield prisma_1.prisma.kategoriIndikator.delete({
                    where: { id },
                });
                response_1.default.success(res, null, "Kelas Kategori berhasil dihapus");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal menghapus kelas Kategori");
            }
        });
    },
};
