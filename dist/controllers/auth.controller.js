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
const encryption_1 = require("../utils/encryption");
const jwt_1 = require("../utils/jwt");
const user_model_1 = require("../models/user.model");
exports.default = {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fullName, username, email, password, confirmPassword } = req.body;
            try {
                yield user_model_1.userDTO.validate({
                    fullName,
                    username,
                    email,
                    password,
                    confirmPassword,
                });
                const result = yield prisma_1.prisma.user.create({
                    data: {
                        fullName,
                        username,
                        password: (0, encryption_1.encrypt)(password), // Prisma tidak punya hooks, enkripsi manual
                    },
                });
                response_1.default.success(res, result, "success registration!");
            }
            catch (error) {
                response_1.default.error(res, error, "failed registration");
            }
        });
    },
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { identifier, password } = req.body;
                yield user_model_1.userLoginDTO.validate({ identifier, password });
                const user = yield prisma_1.prisma.user.findFirst({
                    where: {
                        OR: [{ fullName: identifier }, { username: identifier }],
                    },
                });
                if (!user)
                    return response_1.default.unauthorized(res, "Akun tidak terdaftar");
                if (user.password !== (0, encryption_1.encrypt)(password))
                    return response_1.default.unauthorized(res, "Password Salah");
                const token = (0, jwt_1.generateToken)({
                    id: user.id,
                    role: user.role,
                    username: user.username,
                    fullName: user.fullName,
                });
                response_1.default.success(res, token, "Login success");
            }
            catch (error) {
                response_1.default.error(res, error, "Login failed");
            }
        });
    },
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { fullName, avatar } = req.body;
                if (!userId) {
                    return response_1.default.unauthorized(res, "Unauthorized");
                }
                const result = yield prisma_1.prisma.user.update({
                    where: { id: userId },
                    data: {
                        fullName,
                        avatar,
                    },
                });
                response_1.default.success(res, result, "success to update profile");
            }
            catch (error) {
                // prisma error: record not found
                if (error.code === "P2025") {
                    return response_1.default.notFound(res, "user not found");
                }
                response_1.default.error(res, error, "failed to update profile");
            }
        });
    },
    updatePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { oldPassword, password, confirmPassword } = req.body;
                yield user_model_1.userUpdatePasswordDTO.validate({
                    oldPassword,
                    password,
                    confirmPassword,
                });
                const user = yield prisma_1.prisma.user.findUnique({ where: { id: userId } });
                if (!user || user.password !== (0, encryption_1.encrypt)(oldPassword))
                    return response_1.default.notFound(res, "User not found");
                const updatedUser = yield prisma_1.prisma.user.update({
                    where: { id: userId },
                    data: { password: (0, encryption_1.encrypt)(password) },
                });
                response_1.default.success(res, updatedUser, "success to update password");
            }
            catch (error) {
                response_1.default.error(res, error, "failed to update password");
            }
        });
    },
    me(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user = yield prisma_1.prisma.user.findUnique({
                    where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
                });
                response_1.default.success(res, user, "success get user profile");
            }
            catch (error) {
                response_1.default.error(res, error, "failed get user profile");
            }
        });
    },
};
