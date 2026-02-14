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
   VALIDASI
========================= */
const catatanWaliDTO = Yup.object({
    caberawitId: Yup.number().required("Caberawit wajib dipilih"),
    semester: Yup.string()
        .oneOf(["GANJIL", "GENAP"])
        .required("Semester wajib diisi"),
    catatan: Yup.string().required("Catatan wajib diisi"),
});
exports.default = {
    /* =========================
       CREATE / UPDATE
       (1 CABERAWIT = 1 CATATAN / SEMESTER)
    ========================= */
    upsert(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { caberawitId, semester, catatan } = req.body;
            try {
                yield catatanWaliDTO.validate({ caberawitId, semester, catatan }, { abortEarly: false });
                // cek caberawit
                const caberawit = yield prisma_1.prisma.caberawit.findUnique({
                    where: { id: Number(caberawitId) },
                });
                if (!caberawit)
                    return response_1.default.notFound(res, "Caberawit tidak ditemukan");
                const data = yield prisma_1.prisma.catatanWaliKelas.upsert({
                    where: {
                        caberawitId_semester: {
                            caberawitId: Number(caberawitId),
                            semester,
                        },
                    },
                    update: {
                        catatan,
                    },
                    create: {
                        caberawitId: Number(caberawitId),
                        semester,
                        catatan,
                    },
                    include: {
                        caberawit: {
                            select: {
                                id: true,
                                nama: true,
                                wali: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                });
                return response_1.default.success(res, data, "✅ Catatan wali kelas berhasil disimpan");
            }
            catch (error) {
                return response_1.default.error(res, error, "❌ Gagal menyimpan catatan wali kelas");
            }
        });
    },
    /* =========================
       GET SATU CATATAN
    ========================= */
    get(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { caberawitId } = req.params;
            try {
                const data = yield prisma_1.prisma.catatanWaliKelas.findFirst({
                    where: {
                        caberawitId: Number(caberawitId),
                    },
                    include: {
                        caberawit: {
                            select: {
                                id: true,
                                nama: true,
                                wali: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc", // ambil yang terbaru (opsional tapi recommended)
                    },
                });
                if (!data) {
                    return response_1.default.notFound(res, "Catatan wali kelas belum dibuat");
                }
                return response_1.default.success(res, data, "✅ Berhasil mengambil catatan wali kelas");
            }
            catch (error) {
                return response_1.default.error(res, error, "❌ Gagal mengambil catatan wali kelas");
            }
        });
    },
    /* =========================
       DELETE
    ========================= */
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { caberawitId } = req.params;
            const { semester } = req.query;
            try {
                if (!semester) {
                    return response_1.default.errors(res, null, "semester wajib diisi", 400);
                }
                yield prisma_1.prisma.catatanWaliKelas.delete({
                    where: {
                        caberawitId_semester: {
                            caberawitId: Number(caberawitId),
                            semester: semester,
                        },
                    },
                });
                return response_1.default.success(res, null, "✅ Catatan wali kelas berhasil dihapus");
            }
            catch (error) {
                return response_1.default.error(res, error, "❌ Gagal menghapus catatan wali kelas");
            }
        });
    },
};
