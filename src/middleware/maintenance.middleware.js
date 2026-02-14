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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = maintenanceMiddleware;
const prisma_1 = require("../libs/prisma");
function maintenanceMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // endpoint yang tidak boleh diblok
            if (req.path === "/" || req.path.startsWith("/api/maintenance")) {
                return next();
            }
            const setting = yield prisma_1.prisma.setting.findFirst();
            if (setting === null || setting === void 0 ? void 0 : setting.maintenanceMode) {
                return res.status(503).json({
                    message: setting.maintenanceMsg || "Server sedang maintenance",
                });
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
}
