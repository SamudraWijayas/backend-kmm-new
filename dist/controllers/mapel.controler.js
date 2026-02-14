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
// ✅ Schema validasi Yup
const mapelAddDTO = Yup.object({
    name: Yup.string().required("Nama mapel wajib diisi"),
});
exports.default = {
    // 🟢 Tambah mapel
    addmapel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = req.body;
            try {
                yield mapelAddDTO.validate({ name });
                const existing = yield prisma_1.prisma.mataPelajaran.findUnique({
                    where: { name },
                });
                if (existing) {
                    return response_1.default.conflict(res, "Nama mapel sudah terdaftar");
                }
                const newMapel = yield prisma_1.prisma.mataPelajaran.create({
                    data: { name },
                });
                response_1.default.success(res, newMapel, "Berhasil menambahkan Mapel!");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal menambahkan Mapel");
            }
        });
    },
    // 🟡 Ambil semua Mapel
    findAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mapelList = yield prisma_1.prisma.mataPelajaran.findMany({
                    orderBy: { createdAt: "desc" },
                });
                response_1.default.success(res, mapelList, "✅ Berhasil mengambil semua mapel");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil daftar mapel");
            }
        });
    },
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name } = req.body;
            try {
                yield mapelAddDTO.validate({ name });
                const existing = yield prisma_1.prisma.mataPelajaran.findUnique({
                    where: { id: String(id) },
                });
                if (!existing) {
                    return response_1.default.notFound(res, "mapel tidak ditemukan");
                }
                const updated = yield prisma_1.prisma.mataPelajaran.update({
                    where: { id: String(id) },
                    data: { name },
                });
                response_1.default.success(res, updated, "✅ mapel berhasil diperbarui!");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal memperbarui mapel");
            }
        });
    },
    // 🔴 Hapus mapel
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield prisma_1.prisma.mataPelajaran.delete({
                    where: { id: String(id) },
                });
                response_1.default.success(res, null, "✅ mapel berhasil dihapus");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menghapus mapel");
            }
        });
    },
};
