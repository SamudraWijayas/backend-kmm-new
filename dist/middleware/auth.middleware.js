"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = auth;
const jwt_1 = require("../utils/jwt");
const response_1 = __importDefault(require("../utils/response"));
function auth(req, res, next) {
    var _a;
    const token = (_a = req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized, token missing" });
    }
    const user = (0, jwt_1.getUserData)(token);
    if (!user) {
        return response_1.default.unauthorized(res);
    }
    req.user = user;
    next();
}
