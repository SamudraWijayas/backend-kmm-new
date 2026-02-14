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
const Yup = __importStar(require("yup"));
const messageDTO = Yup.object({
    content: Yup.string().nullable(),
    conversationId: Yup.number().required(),
});
exports.default = {
    // ===============================
    // 🟢 SEND MESSAGE
    // ===============================
    sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return response_1.default.unauthorized(res, "User tidak terautentikasi");
                }
                const senderId = req.user.id;
                const { content, conversationId, attachments } = req.body;
                yield messageDTO.validate({ content, conversationId });
                // cek apakah user termasuk participant conversation
                const isParticipant = yield prisma_1.prisma.conversationParticipant.findFirst({
                    where: {
                        conversationId,
                        mumiId: senderId,
                    },
                });
                if (!isParticipant) {
                    return response_1.default.unauthorized(res, "Bukan anggota conversation");
                }
                const message = yield prisma_1.prisma.message.create({
                    data: {
                        senderId,
                        conversationId,
                        content,
                        attachments: attachments
                            ? {
                                create: attachments.map((file) => ({
                                    fileUrl: file.fileUrl,
                                    fileName: file.fileName,
                                    fileType: file.fileType,
                                    fileSize: file.fileSize,
                                })),
                            }
                            : undefined,
                    },
                    include: {
                        sender: true,
                        attachments: true,
                    },
                });
                // update updatedAt conversation (biar bisa sorting last chat)
                yield prisma_1.prisma.conversation.update({
                    where: { id: conversationId },
                    data: { updatedAt: new Date() },
                });
                return response_1.default.success(res, message, "✅ Pesan berhasil dikirim");
            }
            catch (error) {
                return response_1.default.error(res, error, "❌ Gagal mengirim pesan");
            }
        });
    },
    // ===============================
    // 🔍 GET CHAT BY CONVERSATION
    // ===============================
    getConversationChat(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { conversationId } = req.params;
                if (!userId) {
                    return response_1.default.unauthorized(res, "Unauthorized");
                }
                // pastikan user participant
                const isParticipant = yield prisma_1.prisma.conversationParticipant.findFirst({
                    where: {
                        conversationId: conversationId,
                        mumiId: userId,
                    },
                });
                if (!isParticipant) {
                    return response_1.default.unauthorized(res, "Bukan anggota conversation");
                }
                const messages = yield prisma_1.prisma.message.findMany({
                    where: {
                        conversationId: conversationId,
                    },
                    include: {
                        sender: true,
                        attachments: true,
                        reads: {
                            select: {
                                mumiId: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                });
                return response_1.default.success(res, messages, "✅ Chat berhasil diambil");
            }
            catch (error) {
                return response_1.default.error(res, error, "❌ Gagal mengambil chat");
            }
        });
    },
    // ===============================
    // ✅ MARK AS READ
    // ===============================
    markAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return response_1.default.unauthorized(res, "Unauthorized");
                }
                const userId = req.user.id;
                const { conversationId } = req.body;
                if (!conversationId) {
                    return response_1.default.notFound(res, "conversationId wajib");
                }
                const messages = yield prisma_1.prisma.message.findMany({
                    where: {
                        conversationId,
                        senderId: { not: userId },
                    },
                    select: { id: true },
                });
                yield prisma_1.prisma.messageRead.createMany({
                    data: messages.map((msg) => ({
                        messageId: msg.id,
                        mumiId: userId,
                    })),
                    skipDuplicates: true,
                });
                return response_1.default.success(res, null, "Pesan sudah dibaca");
            }
            catch (error) {
                return response_1.default.error(res, error, "Gagal update read status");
            }
        });
    },
    // ===============================
    // 🟣 CREATE PRIVATE CONVERSATION
    // ===============================
    createPrivateConversation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return response_1.default.unauthorized(res, "Unauthorized");
                }
                const userId = req.user.id;
                const { targetUserId } = req.body;
                if (!targetUserId) {
                    return response_1.default.notFound(res, "targetUserId wajib");
                }
                if (targetUserId === userId) {
                    return response_1.default.error(res, null, "Tidak bisa chat dengan diri sendiri");
                }
                // cek apakah sudah ada private chat antara 2 user ini
                const existingConversation = yield prisma_1.prisma.conversation.findFirst({
                    where: {
                        isGroup: false,
                        participants: {
                            some: { mumiId: userId },
                        },
                        AND: {
                            participants: {
                                some: { mumiId: targetUserId },
                            },
                        },
                    },
                    include: {
                        participants: true,
                    },
                });
                if (existingConversation &&
                    existingConversation.participants.length === 2) {
                    return response_1.default.success(res, existingConversation, "Private conversation sudah ada");
                }
                // buat conversation baru
                const conversation = yield prisma_1.prisma.conversation.create({
                    data: {
                        isGroup: false,
                        participants: {
                            create: [{ mumiId: userId }, { mumiId: targetUserId }],
                        },
                    },
                    include: {
                        participants: true,
                    },
                });
                return response_1.default.success(res, conversation, "Private conversation berhasil dibuat");
            }
            catch (error) {
                return response_1.default.error(res, error, "Gagal membuat private conversation");
            }
        });
    },
    //
    createGroup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return response_1.default.unauthorized(res, "Unauthorized");
                }
                const { name, description, memberIds, image } = req.body;
                if (!name) {
                    return response_1.default.notFound(res, "Nama group wajib diisi");
                }
                const creatorId = req.user.id;
                const conversation = yield prisma_1.prisma.conversation.create({
                    data: {
                        isGroup: true,
                        name,
                        description,
                        image,
                        createdById: creatorId,
                        participants: {
                            create: [
                                { mumiId: creatorId },
                                ...((memberIds === null || memberIds === void 0 ? void 0 : memberIds.map((id) => ({
                                    mumiId: id,
                                }))) || []),
                            ],
                        },
                    },
                    include: {
                        participants: true,
                    },
                });
                return response_1.default.success(res, conversation, "✅ Group berhasil dibuat");
            }
            catch (error) {
                return response_1.default.error(res, error, "❌ Gagal membuat group");
            }
        });
    },
    getConversationById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { conversationId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return response_1.default.unauthorized(res, "Unauthorized");
                }
                // pastikan user participant
                const isParticipant = yield prisma_1.prisma.conversationParticipant.findFirst({
                    where: {
                        conversationId,
                        mumiId: userId,
                    },
                });
                if (!isParticipant) {
                    return response_1.default.unauthorized(res, "Bukan anggota conversation");
                }
                // ambil conversation beserta peserta saja
                const conversation = yield prisma_1.prisma.conversation.findUnique({
                    where: { id: conversationId },
                    include: {
                        participants: {
                            include: {
                                mumi: true,
                            },
                        },
                    },
                });
                if (!conversation) {
                    return response_1.default.notFound(res, "Conversation tidak ditemukan");
                }
                return response_1.default.success(res, conversation, "✅ Conversation berhasil diambil");
            }
            catch (error) {
                return response_1.default.error(res, error, "❌ Gagal mengambil conversation");
            }
        });
    },
    getGroupDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conversationId } = req.params;
                const group = yield prisma_1.prisma.conversation.findFirst({
                    where: {
                        id: conversationId,
                        isGroup: true,
                    },
                    include: {
                        participants: {
                            include: {
                                mumi: true,
                            },
                        },
                    },
                });
                if (!group) {
                    return response_1.default.notFound(res, "Group tidak ditemukan");
                }
                return response_1.default.success(res, group, "Detail group");
            }
            catch (error) {
                return response_1.default.error(res, error, "Gagal mengambil detail group");
            }
        });
    },
    updateGroup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conversationId } = req.params;
                const { name, description, image } = req.body;
                const group = yield prisma_1.prisma.conversation.update({
                    where: { id: conversationId },
                    data: {
                        name,
                        description,
                        image,
                    },
                });
                return response_1.default.success(res, group, "Group berhasil diupdate");
            }
            catch (error) {
                return response_1.default.error(res, error, "Gagal update group");
            }
        });
    },
    deleteGroup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { conversationId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const group = yield prisma_1.prisma.conversation.findUnique({
                    where: { id: conversationId },
                });
                if (!group || group.createdById !== userId) {
                    return response_1.default.unauthorized(res, "Bukan creator group");
                }
                yield prisma_1.prisma.conversation.delete({
                    where: { id: conversationId },
                });
                return response_1.default.success(res, null, "Group berhasil dihapus");
            }
            catch (error) {
                return response_1.default.error(res, error, "Gagal hapus group");
            }
        });
    },
    leaveGroup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { conversationId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                yield prisma_1.prisma.conversationParticipant.delete({
                    where: {
                        conversationId_mumiId: {
                            conversationId: conversationId,
                            mumiId: userId,
                        },
                    },
                });
                return response_1.default.success(res, null, "Keluar dari group");
            }
            catch (error) {
                return response_1.default.error(res, error, "Gagal keluar group");
            }
        });
    },
    addMember(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conversationId } = req.params;
                const { mumiId } = req.body;
                yield prisma_1.prisma.conversationParticipant.create({
                    data: {
                        conversationId: conversationId,
                        mumiId,
                    },
                });
                return response_1.default.success(res, null, "Member ditambahkan");
            }
            catch (error) {
                return response_1.default.error(res, error, "Gagal tambah member");
            }
        });
    },
    removeMember(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conversationId, mumiId } = req.params;
                yield prisma_1.prisma.conversationParticipant.delete({
                    where: {
                        conversationId_mumiId: {
                            conversationId: conversationId,
                            mumiId: Number(mumiId),
                        },
                    },
                });
                return response_1.default.success(res, null, "Member dihapus");
            }
            catch (error) {
                return response_1.default.error(res, error, "Gagal hapus member");
            }
        });
    },
};
