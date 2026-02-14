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
exports.disconnect = exports.connect = exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
// Opsional: helper untuk connect/disconnect
const connect = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.prisma.$connect();
        console.log("✅ Database connected!");
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
});
exports.connect = connect;
const disconnect = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.prisma.$disconnect();
        console.log("✅ Database disconnected!");
    }
    catch (error) {
        console.error("❌ Database disconnection failed:", error);
    }
});
exports.disconnect = disconnect;
