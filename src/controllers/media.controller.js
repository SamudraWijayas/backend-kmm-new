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
const response_1 = __importDefault(require("../utils/response"));
const uploader_1 = __importDefault(require("../utils/uploader"));
const uploader_dok_1 = __importDefault(require("../utils/uploader-dok"));
exports.default = {
    single(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.file) {
                return response_1.default.error(res, null, "file not found");
            }
            try {
                const result = yield uploader_1.default.uploadSingle(req.file);
                response_1.default.success(res, result, "success upload a file");
            }
            catch (_a) {
                response_1.default.error(res, null, "failed upload a file");
            }
        });
    },
    multiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.files || req.files.length === 0) {
                return response_1.default.error(res, null, "files not found");
            }
            try {
                const result = yield uploader_dok_1.default.uploadMultiple(req.files);
                response_1.default.success(res, result, "success upload files");
            }
            catch (_a) {
                response_1.default.error(res, null, "failed upload files");
            }
        });
    },
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fileUrl } = req.body;
                const result = yield uploader_1.default.remove(fileUrl);
                response_1.default.success(res, result, "success remove file");
            }
            catch (_a) {
                response_1.default.error(res, null, "failed remove file");
            }
        });
    },
    removeMultiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fileUrl } = req.body;
                const result = yield uploader_dok_1.default.remove(fileUrl);
                response_1.default.success(res, result, "success remove file");
            }
            catch (_a) {
                response_1.default.error(res, null, "failed remove file");
            }
        });
    },
};
