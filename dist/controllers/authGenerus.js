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
const jwt_1 = require("../utils/jwt"); // pastikan ini ada
const encryption_1 = require("../utils/encryption");
// ✅ Validasi login
const loginDTO = Yup.object({
    identifier: Yup.string().required("Nama wajib diisi"),
    password: Yup.string().required("Password wajib diisi"),
});
const validatePassword = Yup.string()
    .required("Password wajib diisi")
    .min(6, "Password minimal 6 karakter")
    .test("at-least-one-uppercase-letter", "Password harus mengandung minimal 1 huruf besar", (value) => !!value && /[A-Z]/.test(value))
    .test("at-least-one-number", "Password harus mengandung minimal 1 angka", (value) => !!value && /\d/.test(value));
const setPasswordFirstTimeDTO = Yup.object({
    password: validatePassword,
    confirmPassword: Yup.string()
        .required("Konfirmasi password wajib diisi")
        .oneOf([Yup.ref("password")], "Konfirmasi password tidak sama"),
});
exports.default = {
    // 🔐 Login Generus
    loginGenerus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { identifier, password } = req.body;
                if (!identifier || !password)
                    return response_1.default.notFound(res, "Identifier dan password wajib diisi");
                const generus = yield prisma_1.prisma.mumi.findFirst({
                    where: {
                        nama: identifier,
                    },
                });
                if (!generus)
                    return response_1.default.unauthorized(res, "Akun generus tidak terdaftar");
                let isValid = false;
                // =====================================
                // 🔐 Jika BELUM punya password
                // =====================================
                if (generus.hasPassword === false) {
                    const tgl = new Date(generus.tgl_lahir);
                    const defaultPassword = `${tgl.getFullYear()}${String(tgl.getMonth() + 1).padStart(2, "0")}${String(tgl.getDate()).padStart(2, "0")}`;
                    isValid = password === defaultPassword;
                }
                // =====================================
                // 🔐 Jika SUDAH punya password
                // =====================================
                if (generus.hasPassword === true) {
                    if (!generus.password)
                        return response_1.default.unauthorized(res, "Password belum diset");
                    isValid = generus.password === (0, encryption_1.encrypt)(password);
                }
                if (!isValid)
                    return response_1.default.unauthorized(res, "Password Salah");
                // =====================================
                // 🎟 Generate Token
                // =====================================
                const token = (0, jwt_1.generateMumiToken)({
                    id: generus.id,
                    nama: generus.nama,
                    kelompokId: generus.kelompokId,
                    desaId: generus.desaId,
                    daerahId: generus.daerahId,
                    jenjangId: generus.jenjangId,
                    mahasiswa: Boolean(generus.mahasiswa),
                    tgl_lahir: generus.tgl_lahir.toISOString(),
                });
                return response_1.default.success(res, token, "Login generus success");
            }
            catch (error) {
                return response_1.default.error(res, error, "Login generus failed");
            }
        });
    },
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return response_1.default.unauthorized(res, "Unauthorized");
                }
                const { nama, daerahId, desaId, kelompokId, jenjangId, kelasJenjangId, tgl_lahir, jenis_kelamin, gol_darah, nama_ortu, mahasiswa, foto, } = req.body;
                const result = yield prisma_1.prisma.mumi.update({
                    where: { id: userId },
                    data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (nama && { nama })), (jenis_kelamin && { jenis_kelamin })), (gol_darah && { gol_darah })), (nama_ortu && { nama_ortu })), (foto && { foto })), (typeof mahasiswa === "boolean" && { mahasiswa })), (tgl_lahir && {
                        tgl_lahir: new Date(tgl_lahir),
                    })), (daerahId && {
                        daerah: { connect: { id: daerahId } },
                    })), (desaId && {
                        desa: { connect: { id: desaId } },
                    })), (kelompokId && {
                        kelompok: { connect: { id: kelompokId } },
                    })), (jenjangId && {
                        jenjang: { connect: { id: jenjangId } },
                    })), (kelasJenjangId && {
                        kelasJenjang: { connect: { id: kelasJenjangId } },
                    })),
                });
                response_1.default.success(res, result, "success to update profile");
            }
            catch (error) {
                console.error("UPDATE PROFILE ERROR:", error);
                if (error.code === "P2025") {
                    return response_1.default.notFound(res, "user not found");
                }
                response_1.default.error(res, error, "failed to update profile");
            }
        });
    },
    setPasswordFirstTime(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return response_1.default.unauthorized(res, "Unauthorized");
                }
                yield setPasswordFirstTimeDTO.validate(req.body, { abortEarly: false });
                const { password } = req.body;
                const generus = yield prisma_1.prisma.mumi.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        password: true,
                    },
                });
                if (!generus) {
                    return response_1.default.notFound(res, "User tidak ditemukan");
                }
                // ❌ sudah pernah set password
                if (generus.password) {
                    return response_1.default.notFound(res, "Password sudah pernah disetel, gunakan fitur ganti password");
                }
                yield prisma_1.prisma.mumi.update({
                    where: { id: userId },
                    data: {
                        password: (0, encryption_1.encrypt)(password),
                        hasPassword: true,
                    },
                });
                response_1.default.success(res, null, "Password berhasil disetel");
            }
            catch (error) {
                if (error.name === "ValidationError") {
                    return response_1.default.notFound(res, error.errors);
                }
                console.error("SET PASSWORD FIRST TIME ERROR:", error);
                response_1.default.error(res, error, "Gagal menyetel password");
            }
        });
    },
    meGenerus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const generus = yield prisma_1.prisma.mumi.findUnique({
                    where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
                    select: {
                        id: true,
                        nama: true,
                        foto: true,
                        gol_darah: true,
                        jenis_kelamin: true,
                        tgl_lahir: true,
                        nama_ortu: true,
                        mahasiswa: true,
                        jenjangId: true,
                        daerahId: true,
                        desaId: true,
                        kelompokId: true,
                        createdAt: true,
                        updatedAt: true,
                        daerah: true,
                        desa: true,
                        kelompok: true,
                        jenjang: true,
                        hasPassword: true,
                        // ❌ password tidak ada di sini
                    },
                });
                response_1.default.success(res, generus, "success get user profile");
            }
            catch (error) {
                response_1.default.error(res, error, "failed get user profile");
            }
        });
    },
};
