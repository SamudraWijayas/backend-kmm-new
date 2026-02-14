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
const user_model_1 = require("../models/user.model");
const response_1 = __importDefault(require("../utils/response"));
const encryption_1 = require("../utils/encryption");
exports.default = {
    // 🟢 CREATE USER
    addUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fullName, username, password, confirmPassword, role, daerahId, desaId, kelompokId, } = req.body;
            try {
                // ✅ Validasi basic fields
                yield user_model_1.userAddDTO.validate({
                    fullName,
                    username,
                    password,
                    confirmPassword,
                    role,
                });
                // ✅ Cek username duplikat
                const existingUser = yield prisma_1.prisma.user.findUnique({
                    where: { username },
                });
                if (existingUser) {
                    return response_1.default.conflict(res, "❌ Username sudah terdaftar");
                }
                // ✅ Validasi role dan hubungannya
                const validatedData = {};
                switch (role) {
                    case "DAERAH":
                    case "SUBDAERAH":
                        if (!daerahId)
                            return response_1.default.error(res, null, "❌ daerahId wajib untuk role DAERAH atau SUBDAERAH");
                        validatedData.daerahId = String(daerahId);
                        break;
                    case "DESA":
                    case "SUBDESA":
                        if (!desaId)
                            return response_1.default.error(res, null, "❌ desaId wajib untuk role DESA atau SUBDESA");
                        validatedData.desaId = String(desaId);
                        break;
                    case "KELOMPOK":
                    case "SUBKELOMPOK":
                        if (!kelompokId)
                            return response_1.default.error(res, null, "❌ kelompokId wajib untuk role KELOMPOK atau SUBKELOMPOK");
                        validatedData.kelompokId = String(kelompokId);
                        break;
                    case "SUPERADMIN":
                    case "ADMIN":
                        // Tidak butuh ID tambahan
                        break;
                    default:
                        return response_1.default.error(res, null, "❌ Role tidak valid. Gunakan salah satu dari: SUPERADMIN, ADMIN, DAERAH, SUBDAERAH, DESA, SUBDESA, KELOMPOK, SUBKELOMPOK");
                }
                // ✅ Siapkan data prisma
                const createData = {
                    fullName,
                    username,
                    password: (0, encryption_1.encrypt)(password),
                    role,
                };
                if (validatedData.daerahId) {
                    createData.daerah = { connect: { id: validatedData.daerahId } };
                }
                if (validatedData.desaId) {
                    createData.desa = { connect: { id: validatedData.desaId } };
                }
                if (validatedData.kelompokId) {
                    createData.kelompok = { connect: { id: validatedData.kelompokId } };
                }
                // ✅ Simpan user baru ke DB
                const newUser = yield prisma_1.prisma.user.create({ data: createData });
                return response_1.default.success(res, newUser, "✅ Successfully added user!");
            }
            catch (error) {
                console.error("❌ Add user error:", error);
                return response_1.default.error(res, error, "❌ Failed to add user");
            }
        });
    },
    findAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 10, search, daerahId, desaId, kelompokId, } = req.query;
                const where = {};
                // 🔍 Filter search
                if (search) {
                    where.OR = [
                        {
                            fullName: {
                                contains: String(search),
                                mode: "insensitive",
                            },
                        },
                        {
                            username: {
                                contains: String(search),
                                mode: "insensitive",
                            },
                        },
                    ];
                }
                // 📍 Filter daerah
                if (daerahId) {
                    where.daerahId = String(daerahId);
                }
                // 🏠 Filter desa
                if (desaId) {
                    where.desaId = String(desaId);
                }
                // 👥 Filter kelompok
                if (kelompokId) {
                    where.kelompokId = String(kelompokId);
                }
                const users = yield prisma_1.prisma.user.findMany({
                    where,
                    include: {
                        daerah: true,
                        desa: true,
                        kelompok: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: Number(limit),
                    skip: (Number(page) - 1) * Number(limit),
                });
                const total = yield prisma_1.prisma.user.count({ where });
                return response_1.default.pagination(res, users, {
                    current: Number(page),
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
                }, "✅ Berhasil mengambil daftar user");
            }
            catch (error) {
                console.error("❌ findAll error:", error);
                response_1.default.error(res, error, "❌ Gagal mengambil daftar user");
            }
        });
    },
    findAllByKelompok(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { kelompokId } = req.params;
                const kelompok = yield prisma_1.prisma.kelompok.findUnique({
                    where: { id: String(kelompokId) },
                });
                if (!kelompok) {
                    return response_1.default.notFound(res, "kelompok tidak ditemukan");
                }
                const { page = 1, limit = 10, search, daerahId } = req.query;
                const where = {
                    kelompokId: String(kelompokId),
                };
                // 🔍 Filter search
                if (search) {
                    where.OR = [
                        {
                            fullName: {
                                contains: String(search),
                                mode: "insensitive",
                            },
                        },
                        {
                            username: {
                                contains: String(search),
                                mode: "insensitive",
                            },
                        },
                    ];
                }
                // 📍 Filter daerah
                if (daerahId) {
                    where.daerahId = String(daerahId);
                }
                const users = yield prisma_1.prisma.user.findMany({
                    where,
                    include: {
                        daerah: true,
                        desa: true,
                        kelompok: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: Number(limit),
                    skip: (Number(page) - 1) * Number(limit),
                });
                const total = yield prisma_1.prisma.user.count({ where });
                return response_1.default.pagination(res, users, {
                    current: Number(page),
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
                }, "✅ Berhasil mengambil daftar user");
            }
            catch (error) {
                console.error("❌ findAll error:", error);
                response_1.default.error(res, error, "❌ Gagal mengambil daftar user");
            }
        });
    },
    findAllByDesa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { desaId } = req.params;
                const desa = yield prisma_1.prisma.desa.findUnique({
                    where: { id: String(desaId) },
                });
                if (!desa) {
                    return response_1.default.notFound(res, "desa tidak ditemukan");
                }
                const { page = 1, limit = 10, search } = req.query;
                const where = {
                    desaId: String(desaId),
                };
                // 🔍 Filter search
                if (search) {
                    where.OR = [
                        {
                            fullName: {
                                contains: String(search),
                                mode: "insensitive",
                            },
                        },
                        {
                            username: {
                                contains: String(search),
                                mode: "insensitive",
                            },
                        },
                    ];
                }
                const users = yield prisma_1.prisma.user.findMany({
                    where,
                    include: {
                        daerah: true,
                        desa: true,
                        kelompok: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: Number(limit),
                    skip: (Number(page) - 1) * Number(limit),
                });
                const total = yield prisma_1.prisma.user.count({ where });
                return response_1.default.pagination(res, users, {
                    current: Number(page),
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
                }, "✅ Berhasil mengambil daftar user");
            }
            catch (error) {
                console.error("❌ findAll error:", error);
                response_1.default.error(res, error, "❌ Gagal mengambil daftar user");
            }
        });
    },
    // 🟢 READ - FIND ONE USER BY ID
    findOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const result = yield prisma_1.prisma.user.findUnique({
                    where: { id: Number(id) },
                });
                if (!result) {
                    return response_1.default.notFound(res, "user not found");
                }
                response_1.default.success(res, result, "success find one user");
            }
            catch (error) {
                response_1.default.error(res, error, "failed find one user");
            }
        });
    },
    // 🟠 UPDATE USER
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { fullName, username, role } = req.body;
                const user = yield prisma_1.prisma.user.findUnique({ where: { id: Number(id) } });
                if (!user)
                    return response_1.default.notFound(res, "user not found");
                const result = yield prisma_1.prisma.user.update({
                    where: { id: Number(id) },
                    data: { fullName, username, role },
                });
                response_1.default.success(res, result, "success update user");
            }
            catch (error) {
                response_1.default.error(res, error, "failed to update user");
            }
        });
    },
    // 🟠 UPDATE PASSWORD
    updatePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { oldPassword, password, confirmPassword } = req.body;
                // 🔍 Validasi input
                if (!password || !confirmPassword) {
                    return response_1.default.error(res, null, "❌ Password dan konfirmasi wajib diisi");
                }
                if (password !== confirmPassword) {
                    return response_1.default.error(res, null, "❌ Password dan konfirmasi tidak sama");
                }
                // 🔍 Cari user
                const user = yield prisma_1.prisma.user.findUnique({
                    where: { id: Number(id) },
                });
                if (!user) {
                    return response_1.default.notFound(res, "user not found");
                }
                // 🔐 Cek password lama (jika dikirim)
                if (oldPassword) {
                    const encryptedOld = (0, encryption_1.encrypt)(oldPassword);
                    if (user.password !== encryptedOld) {
                        return response_1.default.error(res, null, "❌ Password lama salah");
                    }
                }
                // 🔐 Update password
                const updated = yield prisma_1.prisma.user.update({
                    where: { id: Number(id) },
                    data: {
                        password: (0, encryption_1.encrypt)(password),
                    },
                });
                response_1.default.success(res, updated, "✅ Password berhasil diperbarui");
            }
            catch (error) {
                console.error("❌ Update password error:", error);
                response_1.default.error(res, error, "❌ Gagal memperbarui password");
            }
        });
    },
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { password, confirmPassword } = req.body;
                if (!password || !confirmPassword) {
                    return response_1.default.error(res, null, "❌ Password wajib diisi");
                }
                if (password !== confirmPassword) {
                    return response_1.default.error(res, null, "❌ Password tidak sama");
                }
                const user = yield prisma_1.prisma.user.findUnique({
                    where: { id: Number(id) },
                });
                if (!user)
                    return response_1.default.notFound(res, "user not found");
                const updated = yield prisma_1.prisma.user.update({
                    where: { id: Number(id) },
                    data: {
                        password: (0, encryption_1.encrypt)(password),
                    },
                });
                response_1.default.success(res, updated, "✅ Password berhasil di-reset");
            }
            catch (error) {
                response_1.default.error(res, error, "❌ Gagal reset password");
            }
        });
    },
    // 🔴 DELETE USER
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield prisma_1.prisma.user.findUnique({ where: { id: Number(id) } });
                if (!user)
                    return response_1.default.notFound(res, "user not found");
                const result = yield prisma_1.prisma.user.delete({ where: { id: Number(id) } });
                response_1.default.success(res, result, "success remove user");
            }
            catch (error) {
                response_1.default.error(res, error, "failed to remove user");
            }
        });
    },
};
