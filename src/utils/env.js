"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIENT_HOST = exports.SECRET = exports.DATABASE_NAME = exports.DATABASE_PASSWORD = exports.DATABASE_USER = exports.DATABASE_HOST = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.DATABASE_HOST = process.env.DATABASE_HOST || "";
exports.DATABASE_USER = process.env.DATABASE_USER || "";
exports.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || "";
exports.DATABASE_NAME = process.env.DATABASE_NAME || "";
exports.SECRET = process.env.SECRET || "";
exports.CLIENT_HOST = process.env.CLIENT_HOST || "http://localhost:3001";
