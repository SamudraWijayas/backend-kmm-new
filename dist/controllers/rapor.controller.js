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
// ✅ Validasi input untuk add/update rapor
const raporDTO = Yup.object({
    caberawitId: Yup.number().required("caberawitId wajib diisi"),
    semester: Yup.string()
        .oneOf(["GANJIL", "GENAP"])
        .required("Semester wajib diisi"),
    raporItems: Yup.array()
        .of(Yup.object({
        indikatorKelasId: Yup.string().required(),
        kelasJenjangId: Yup.string().required(),
        status: Yup.string().oneOf(["TUNTAS", "TIDAK_TUNTAS"]).nullable(), // optional
        nilaiPengetahuan: Yup.number().nullable(),
        nilaiKeterampilan: Yup.number().nullable(),
    }))
        .required("raporItems wajib diisi"),
});
// ✅ Build rapor sederhana
function buildRapor(rapor) {
    return rapor.map((r) => ({
        id_indikator: r.indikatorKelas.id,
        indikator: r.indikatorKelas.indikator,
        semester: r.semester,
        status: r.status,
        nilaiPengetahuan: r.nilaiPengetahuan,
        nilaiKeterampilan: r.nilaiKeterampilan,
    }));
}
exports.default = {
    // 🔵 Get rapor caberawit
    getByCaberawit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { caberawitId } = req.params;
            try {
                if (!caberawitId)
                    return response_1.default.errors(res, null, "caberawitId wajib diisi", 400);
                const rapor = yield prisma_1.prisma.raporGenerus.findMany({
                    where: { caberawitId: Number(caberawitId) },
                    include: { indikatorKelas: true },
                    orderBy: { indikatorKelas: { indikator: "asc" } },
                });
                response_1.default.success(res, buildRapor(rapor), "✅ Berhasil mengambil rapor caberawit");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal mengambil rapor caberawit");
            }
        });
    },
    // 🟢 Add / Update rapor (status otomatis)
    upsert(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                yield raporDTO.validate(req.body, { abortEarly: false });
                const { caberawitId, semester, raporItems } = req.body;
                const results = [];
                for (const item of raporItems) {
                    const nilai = (_b = (_a = item.nilaiPengetahuan) !== null && _a !== void 0 ? _a : item.nilaiKeterampilan) !== null && _b !== void 0 ? _b : 0;
                    const status = item.status
                        ? item.status
                        : nilai > 74
                            ? "TUNTAS"
                            : "TIDAK_TUNTAS";
                    const rapor = yield prisma_1.prisma.raporGenerus.upsert({
                        where: {
                            rapor_unique_caberawit: {
                                caberawitId: Number(caberawitId),
                                indikatorKelasId: item.indikatorKelasId,
                                semester: item.semester || semester,
                            },
                        },
                        update: {
                            status,
                            nilaiPengetahuan: item.nilaiPengetahuan,
                            nilaiKeterampilan: item.nilaiKeterampilan,
                        },
                        create: {
                            caberawitId: Number(caberawitId),
                            indikatorKelasId: item.indikatorKelasId,
                            kelasJenjangId: item.kelasJenjangId,
                            semester: item.semester || semester,
                            status,
                            nilaiPengetahuan: item.nilaiPengetahuan,
                            nilaiKeterampilan: item.nilaiKeterampilan,
                        },
                    });
                    results.push(rapor);
                }
                response_1.default.success(res, results, "✅ Berhasil menambahkan/memperbarui rapor caberawit");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal menambahkan/memperbarui rapor caberawit");
            }
        });
    },
};
