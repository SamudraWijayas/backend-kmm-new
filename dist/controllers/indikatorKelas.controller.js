"use strict";
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
exports.default = {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { kelasJenjangId, kategoriIndikatorId, indikator, semester, jenisPenilaian, } = req.body;
                if (!kelasJenjangId)
                    return res.status(400).json({ message: "kelasJenjangId wajib diisi" });
                if (!kategoriIndikatorId)
                    return res
                        .status(400)
                        .json({ message: "kategoriIndikatorId wajib diisi" });
                if (!indikator)
                    return res.status(400).json({ message: "indikator wajib diisi" });
                const data = yield prisma_1.prisma.indikatorKelas.create({
                    data: {
                        kelasJenjangId,
                        kategoriIndikatorId,
                        indikator,
                        semester,
                        jenisPenilaian,
                    },
                    include: {
                        kategoriIndikator: { include: { mataPelajaran: true } },
                    },
                });
                response_1.default.success(res, data, "Berhasil menambah indikator");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal menambah indikator");
            }
        });
    },
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { kelasJenjangId, kategoriIndikatorId } = req.query;
                const where = {};
                if (kelasJenjangId)
                    where.kelasJenjangId = kelasJenjangId;
                if (kategoriIndikatorId)
                    where.kategoriIndikatorId = kategoriIndikatorId;
                const data = yield prisma_1.prisma.indikatorKelas.findMany({
                    where,
                    include: {
                        rapor: true,
                        kategoriIndikator: { include: { mataPelajaran: true } },
                        kelasJenjang: { include: { jenjang: true } },
                    },
                });
                response_1.default.success(res, data, "Berhasil get Indikator");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal get Indikator");
            }
        });
    },
    getByJenjang(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { jenjangId } = req.params;
                if (!jenjangId) {
                    return res.status(400).json({
                        meta: { status: 400, message: "jenjangId diperlukan" },
                    });
                }
                const indikator = yield prisma_1.prisma.indikatorKelas.findMany({
                    where: { kelasJenjangId: jenjangId },
                    include: {
                        kategoriIndikator: { include: { mataPelajaran: true } },
                    },
                });
                response_1.default.success(res, indikator, "Berhasil mengambil data");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal mengambil data");
            }
        });
    },
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const data = yield prisma_1.prisma.indikatorKelas.findUnique({
                    where: { id },
                    include: {
                        rapor: true,
                        kategoriIndikator: { include: { mataPelajaran: true } },
                    },
                });
                if (!data)
                    return res.status(404).json({ message: "Indikator tidak ditemukan" });
                response_1.default.success(res, data, "Berhasil mengambil data indikator");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal mengambil data indikator");
            }
        });
    },
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { indikator, kategoriIndikatorId, semester, jenisPenilaian } = req.body;
                const cek = yield prisma_1.prisma.indikatorKelas.findUnique({ where: { id } });
                if (!cek)
                    return res.status(404).json({ message: "Indikator tidak ditemukan" });
                const data = yield prisma_1.prisma.indikatorKelas.update({
                    where: { id },
                    data: {
                        indikator,
                        kategoriIndikatorId,
                        semester,
                        jenisPenilaian,
                    },
                    include: {
                        kategoriIndikator: { include: { mataPelajaran: true } },
                    },
                });
                response_1.default.success(res, data, "Berhasil update indikator");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal update indikator");
            }
        });
    },
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const cek = yield prisma_1.prisma.indikatorKelas.findUnique({ where: { id } });
                if (!cek)
                    return res.status(404).json({ message: "Indikator tidak ditemukan" });
                yield prisma_1.prisma.indikatorKelas.delete({ where: { id } });
                response_1.default.success(res, null, "Berhasil menghapus indikator");
            }
            catch (error) {
                response_1.default.error(res, error, "Gagal menghapus indikator");
            }
        });
    },
    getByKelasJenjang(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { kelasJenjangId } = req.params;
                if (!kelasJenjangId) {
                    return response_1.default.errors(res, null, "kelasJenjangId wajib diisi", 400);
                }
                const indikator = yield prisma_1.prisma.indikatorKelas.findMany({
                    where: {
                        kelasJenjangId,
                    },
                    include: {
                        kategoriIndikator: {
                            include: {
                                mataPelajaran: true,
                            },
                        },
                    },
                    orderBy: [
                        {
                            kategoriIndikator: {
                                mataPelajaran: {
                                    name: "asc",
                                },
                            },
                        },
                        {
                            indikator: "asc",
                        },
                    ],
                });
                return response_1.default.success(res, indikator, "Berhasil mengambil indikator berdasarkan kelas jenjang");
            }
            catch (error) {
                return response_1.default.error(res, error, "Gagal mengambil indikator berdasarkan kelas jenjang");
            }
        });
    },
};
