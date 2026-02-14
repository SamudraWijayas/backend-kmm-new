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
exports.getMaintenance = exports.toggleMaintenance = void 0;
const prisma_1 = require("../libs/prisma");
const response_1 = __importDefault(require("../utils/response"));
const toggleMaintenance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, message } = req.body;
    yield prisma_1.prisma.setting.upsert({
        where: { id: 1 },
        update: {
            maintenanceMode: status,
            maintenanceMsg: message,
        },
        create: {
            id: 1,
            maintenanceMode: status,
            maintenanceMsg: message,
        },
    });
    response_1.default.success(res, null, "Maintenance updated");
});
exports.toggleMaintenance = toggleMaintenance;
const getMaintenance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const setting = yield prisma_1.prisma.setting.findFirst();
    res.json({
        maintenanceMode: (_a = setting === null || setting === void 0 ? void 0 : setting.maintenanceMode) !== null && _a !== void 0 ? _a : false,
    });
});
exports.getMaintenance = getMaintenance;
