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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
// Ensure uploads directory exists
const UPLOADS_DIR = path_1.default.join(__dirname, "../../uploads");
if (!fs_1.default.existsSync(UPLOADS_DIR)) {
    fs_1.default.mkdirSync(UPLOADS_DIR, { recursive: true });
}
// Helper function to generate unique filename
const generateUniqueFilename = (originalName) => {
    const ext = path_1.default.extname(originalName);
    const name = path_1.default.basename(originalName, ext);
    return `${name}-${(0, uuid_1.v4)()}${ext}`;
};
// Helper function to get file path from URL
const getFilePathFromUrl = (fileUrl) => {
    const filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
    return path_1.default.join(UPLOADS_DIR, filename);
};
exports.default = {
    uploadSingle(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filename = generateUniqueFilename(file.originalname);
                const filePath = path_1.default.join(UPLOADS_DIR, filename);
                // Write file to disk
                fs_1.default.writeFileSync(filePath, file.buffer);
                // Return file information
                return {
                    url: `/uploads/${filename}`,
                    filename: filename,
                    originalName: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                };
            }
            catch (error) {
                throw new Error(`Failed to upload file: ${error}`);
            }
        });
    },
    uploadMultiple(files) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const uploadPromises = files.map(file => this.uploadSingle(file));
                const results = yield Promise.all(uploadPromises);
                return results;
            }
            catch (error) {
                throw new Error(`Failed to upload multiple files: ${error}`);
            }
        });
    },
    remove(fileUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filePath = getFilePathFromUrl(fileUrl);
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                    return { success: true, message: "File deleted successfully" };
                }
                else {
                    return { success: false, message: "File not found" };
                }
            }
            catch (error) {
                throw new Error(`Failed to remove file: ${error}`);
            }
        });
    },
};
