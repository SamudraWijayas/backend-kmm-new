"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("./env");
const encrypt = (password) => {
    const encrypted = crypto_1.default
        .pbkdf2Sync(password, env_1.SECRET, 1000, 64, "sha512")
        .toString("hex");
    return encrypted;
};
exports.encrypt = encrypt;
