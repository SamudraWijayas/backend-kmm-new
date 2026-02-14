"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const Yup = __importStar(require("yup"));
const client_1 = require("@prisma/client");
exports.default = {
    success(res, data, message) {
        res.status(200).json({
            meta: {
                status: 200,
                message,
            },
            data,
        });
    },
    sukses(res, data, total, message) {
        res.status(200).json({
            meta: {
                status: 200,
                message,
            },
            data,
            total,
        });
    },
    error(res, error, message) {
        // ✅ Validasi error dari Yup
        if (error instanceof Yup.ValidationError) {
            return res.status(400).json({
                meta: { status: 400, message },
                data: { [`${error.path}`]: error.errors[0] },
            });
        }
        // ✅ Error spesifik dari Prisma (misalnya unique constraint, foreign key, dll)
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            return res.status(400).json({
                meta: {
                    status: 400,
                    message: error.message,
                },
                data: error.meta,
            });
        }
        // ✅ Fallback untuk error biasa
        res.status(500).json({
            meta: {
                status: 500,
                message: message || "Server error",
            },
            data: error,
        });
    },
    notFound(res, message = "not found") {
        res.status(404).json({
            meta: { status: 404, message },
            data: null,
        });
    },
    unauthorized(res, message = "unauthorized") {
        res.status(403).json({
            meta: { status: 403, message },
            data: null,
        });
    },
    pagination(res, data, pagination, message) {
        res.status(200).json({
            meta: { status: 200, message },
            data,
            pagination,
        });
    },
    conflict(res, message = "conflict") {
        res.status(409).json({
            meta: { status: 409, message },
            data: null,
        });
    },
    errors(res, error, message, status = 500) {
        if (error instanceof Yup.ValidationError) {
            return res.status(400).json({
                meta: { status: 400, message },
                data: { [`${error.path}`]: error.errors[0] },
            });
        }
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            return res.status(400).json({
                meta: { status: 400, message: error.message },
                data: error.meta,
            });
        }
        return res.status(status).json({
            meta: { status, message },
            data: error,
        });
    },
};
