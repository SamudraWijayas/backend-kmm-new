"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMumiData = exports.generateMumiToken = exports.getUserData = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("./env");
// ===== GENERATE TOKEN =====
const generateToken = (user) => {
    const token = jsonwebtoken_1.default.sign(user, env_1.SECRET, {
        expiresIn: "7d",
    });
    return token;
};
exports.generateToken = generateToken;
// ===== GET USER DATA =====
const getUserData = (token) => {
    return jsonwebtoken_1.default.verify(token, env_1.SECRET);
};
exports.getUserData = getUserData;
const generateMumiToken = (user) => {
    const token = jsonwebtoken_1.default.sign(user, env_1.SECRET, {
        expiresIn: "7d",
    });
    return token;
};
exports.generateMumiToken = generateMumiToken;
const getMumiData = (token) => {
    return jsonwebtoken_1.default.verify(token, env_1.SECRET);
};
exports.getMumiData = getMumiData;
