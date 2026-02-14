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
const prisma_1 = require("../libs/prisma");
const response_1 = __importDefault(require("../utils/response"));
exports.default = {
    chatList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return response_1.default.unauthorized(res, "User tidak valid");
                }
                const userId = req.user.id;
                const search = String(req.query.search || "");
                // =========================
                // AMBIL SEMUA CONVERSATION USER
                // =========================
                const conversations = yield prisma_1.prisma.conversation.findMany({
                    where: Object.assign({ participants: {
                            some: { mumiId: userId },
                        } }, (search && {
                        OR: [
                            {
                                name: {
                                    contains: search,
                                },
                            },
                            {
                                participants: {
                                    some: {
                                        mumi: {
                                            nama: {
                                                contains: search,
                                            },
                                            id: { not: userId },
                                        },
                                    },
                                },
                            },
                        ],
                    })),
                    include: {
                        participants: {
                            include: {
                                mumi: true,
                            },
                        },
                        messages: {
                            orderBy: { createdAt: "desc" },
                            take: 1,
                        },
                    },
                    orderBy: {
                        updatedAt: "desc",
                    },
                });
                // =========================
                // FORMAT CHAT LIST
                // =========================
                const chatList = yield Promise.all(conversations.map((conv) => __awaiter(this, void 0, void 0, function* () {
                    const lastMessage = conv.messages[0] || null;
                    // hitung unread
                    const unreadCount = yield prisma_1.prisma.message.count({
                        where: {
                            conversationId: conv.id,
                            senderId: { not: userId },
                            reads: {
                                none: {
                                    mumiId: userId,
                                },
                            },
                        },
                    });
                    // PERSONAL CHAT
                    if (!conv.isGroup) {
                        const otherUser = conv.participants
                            .map((p) => p.mumi)
                            .find((u) => u.id !== userId);
                        return {
                            type: "personal",
                            conversationId: conv.id,
                            user: otherUser,
                            lastMessage: (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.content) || null,
                            createdAt: (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.createdAt) || conv.createdAt,
                            unreadCount,
                        };
                    }
                    // GROUP CHAT
                    return {
                        type: "group",
                        conversationId: conv.id,
                        name: conv.name,
                        image: conv.image,
                        lastMessage: (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.content) || null,
                        createdAt: (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.createdAt) || conv.createdAt,
                        unreadCount,
                    };
                })));
                return response_1.default.success(res, chatList, "✅ Chat list berhasil diambil");
            }
            catch (error) {
                console.log(error);
                return response_1.default.error(res, error, "❌ Gagal mengambil chat list");
            }
        });
    },
};
