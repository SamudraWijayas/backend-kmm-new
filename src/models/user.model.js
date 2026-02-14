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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAddDTO = exports.userLoginDTO = exports.userDTO = exports.userUpdatePasswordDTO = exports.USER_MODEL_NAME = void 0;
const Yup = __importStar(require("yup"));
const constant_1 = require("../utils/constant");
const validatePassword = Yup.string()
    .required()
    .min(6, "Password must be at least 6 characters")
    .test("at-least-one-uppercase-letter", "Contains at least one uppercase letter", (value) => {
    if (!value)
        return false;
    const regex = /^(?=.*[A-Z])/;
    return regex.test(value);
})
    .test("at-least-one-number", "Contains at least one uppercase letter", (value) => {
    if (!value)
        return false;
    const regex = /^(?=.*\d)/;
    return regex.test(value);
});
const validateConfirmPassword = Yup.string()
    .required()
    .oneOf([Yup.ref("password"), ""], "Password not match");
exports.USER_MODEL_NAME = "User";
exports.userUpdatePasswordDTO = Yup.object({
    oldPassword: validatePassword,
    password: validatePassword,
    confirmPassword: validateConfirmPassword,
});
exports.userDTO = Yup.object({
    fullName: Yup.string().required(),
    username: Yup.string().required(),
    password: validatePassword,
    confirmPassword: validateConfirmPassword,
});
exports.userLoginDTO = Yup.object({
    identifier: Yup.string().required(),
    password: validatePassword,
});
exports.userAddDTO = Yup.object({
    fullName: Yup.string().required(),
    username: Yup.string().required(),
    password: validatePassword,
    confirmPassword: validateConfirmPassword,
    role: Yup.string()
        .oneOf([constant_1.ROLES.ADMIN, constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH, constant_1.ROLES.SUBDAERAH, constant_1.ROLES.DESA, constant_1.ROLES.SUBDESA, constant_1.ROLES.KELOMPOK, constant_1.ROLES.SUBKELOMPOK])
        .required("Role harus dipilih"),
    avatar: Yup.string().nullable(),
});
