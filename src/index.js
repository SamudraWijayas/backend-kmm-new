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
const express_1 = __importDefault(require("express"));
const api_1 = __importDefault(require("./routes/api"));
const prisma_1 = require("./libs/prisma"); // Prisma client
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const error_middleware_1 = __importDefault(require("./middleware/error.middleware"));
const maintenance_middleware_1 = __importDefault(require("./middleware/maintenance.middleware"));
const settingController_1 = require("./controllers/settingController");
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const PORT = 5000;
            yield (0, prisma_1.connect)();
            const app = (0, express_1.default)();
            app.use((0, cors_1.default)());
            app.use(body_parser_1.default.json());
            app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
            app.get("/", (req, res) => {
                res.status(200).json({
                    message: "Server is running",
                    data: null,
                });
            });
            app.get("/api/maintenance", settingController_1.getMaintenance);
            app.use(maintenance_middleware_1.default);
            app.use("/api", api_1.default);
            app.use(error_middleware_1.default.serverRoute());
            app.use(error_middleware_1.default.serverError());
            app.listen(PORT, () => {
                console.log(`🚀 Server is running at http://localhost:${PORT}`);
            });
        }
        catch (error) {
            console.log(error);
        }
    });
}
init();
// Routes
// Jalankan koneksi database dulu baru start server
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, prisma_1.connect)(); // prisma.$connect()
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}))();
