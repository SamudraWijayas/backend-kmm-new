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
const kelasJenjangDTO = Yup.object({
    jenjangId: Yup.string().required("Jenjang wajib dipilih"),
    name: Yup.string().required("Nama kelas wajib diisi"),
    urutan: Yup.number().nullable(),
});
exports.default = {
    // 🟢 Tambah Kelas Jenjang
    add(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { jenjangId, name, urutan } = req.body;
            try {
                yield kelasJenjangDTO.validate({ jenjangId, name, urutan });
                // cek jenjang ada atau tidak
                const existJenjang = yield prisma_1.prisma.jenjang.findUnique({
                    where: { id: jenjangId },
                });
                if (!existJenjang) {
                    return response_1.default.notFound(res, "Jenjang tidak ditemukan");
                }
                // cek nama kelas yg sama dalam satu jenjang
                const existClass = yield prisma_1.prisma.kelasJenjang.findFirst({
                    where: {
                        jenjangId,
                        name,
                    },
                });
                if (existClass) {
                    return response_1.default.conflict(res, "Nama kelas sudah terdaftar di jenjang ini");
                }
                const newClass = yield prisma_1.prisma.kelasJenjang.create({
                    data: { jenjangId, name, urutan },
                });
                response_1.default.success(res, newClass, "Berhasil menambahkan kelas jenjang!");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal menambahkan kelas");
            }
        });
    },
    // 🟡 Ambil semua kelas per jenjang (optional by jenjang)
    findAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { jenjangId } = req.query;
            try {
                const kelas = yield prisma_1.prisma.kelasJenjang.findMany({
                    where: jenjangId ? { jenjangId: String(jenjangId) } : undefined,
                    orderBy: [{ jenjangId: "asc" }, { urutan: "asc" }],
                    include: {
                        jenjang: true,
                    },
                });
                response_1.default.success(res, kelas, "Berhasil mengambil semua kelas jenjang");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal mengambil kelas jenjang");
            }
        });
    },
    // 🟦 Ambil detail kelas
    findOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const kelas = yield prisma_1.prisma.kelasJenjang.findUnique({
                    where: { id },
                    include: {
                        jenjang: true,
                    },
                });
                if (!kelas) {
                    return response_1.default.notFound(res, "Kelas jenjang tidak ditemukan");
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
            const { name, urutan } = req.body;
            try {
                yield Yup.object({
                    name: Yup.string().required(),
                    urutan: Yup.number().nullable(),
                }).validate({ name, urutan });
                const exist = yield prisma_1.prisma.kelasJenjang.findUnique({
                    where: { id },
                });
                if (!exist) {
                    return response_1.default.notFound(res, "Kelas tidak ditemukan");
                }
                const updated = yield prisma_1.prisma.kelasJenjang.update({
                    where: { id },
                    data: { name, urutan },
                });
                response_1.default.success(res, updated, "Kelas jenjang berhasil diperbarui!");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal memperbarui kelas jenjang");
            }
        });
    },
    // 🔴 Hapus kelas
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield prisma_1.prisma.kelasJenjang.delete({
                    where: { id },
                });
                response_1.default.success(res, null, "Kelas jenjang berhasil dihapus");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal menghapus kelas jenjang");
            }
        });
    },
};
