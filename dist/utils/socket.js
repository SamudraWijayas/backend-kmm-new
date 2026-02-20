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
exports.getUserSocket = exports.getIO = exports.emitChatListUpdate = exports.emitToUser = exports.emitToConversation = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const prisma_1 = require("../libs/prisma");
let io;
// User mapping: userId -> socketId
const userSockets = new Map();
// Reverse mapping: socketId -> userId
const socketUsers = new Map();
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*", // nanti production ganti domain
        },
    });
    io.on("connection", (socket) => {
        console.log("✅ User connected:", socket.id);
        // ========================================
        // 👤 USER AUTHENTICATION / REGISTER
        // ========================================
        socket.on("register_user", (userId) => {
            userSockets.set(userId, socket.id);
            socketUsers.set(socket.id, userId);
            console.log(`✅ User ${userId} registered with socket ${socket.id}`);
            // Emit user online status
            io.emit("user_online", { userId });
        });
        // ========================================
        // 🚪 JOIN CONVERSATION ROOM
        // ========================================
        socket.on("join_room", (conversationId) => {
            socket.join(`conversation_${conversationId}`);
            console.log(`✅ Socket ${socket.id} joined room conversation_${conversationId}`);
        });
        // ========================================
        // 🚪 LEAVE CONVERSATION ROOM
        // ========================================
        socket.on("leave_room", (conversationId) => {
            socket.leave(`conversation_${conversationId}`);
            console.log(`❌ Socket ${socket.id} left room conversation_${conversationId}`);
        });
        // ========================================
        // ✉️ SEND MESSAGE (Real-time)
        // ========================================
        socket.on("send_message", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { content, conversationId, attachments } = data;
                if (!conversationId)
                    throw new Error("conversationId is required");
                // Ambil userId dari socket (user yang login)
                const senderId = socketUsers.get(socket.id);
                if (!senderId)
                    throw new Error("User belum terdaftar / login");
                // Cek apakah user adalah peserta conversation
                const isParticipant = yield prisma_1.prisma.conversationParticipant.findFirst({
                    where: { conversationId, mumiId: senderId },
                });
                if (!isParticipant)
                    throw new Error("Bukan anggota conversation");
                const message = yield prisma_1.prisma.message.create({
                    data: {
                        content,
                        senderId,
                        conversationId, // Prisma v6 compatible
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
                    include: { sender: true, attachments: true },
                });
                // Update conversation updatedAt
                yield prisma_1.prisma.conversation.update({
                    where: { id: conversationId },
                    data: { updatedAt: new Date() },
                });
                // Emit ke room conversation
                io.to(`conversation_${conversationId}`).emit("receive_message", message);
                // Emit chat_list_update ke semua peserta
                (0, exports.emitChatListUpdate)(conversationId);
            }
            catch (error) {
                console.error("Socket error:", error);
            }
        }));
        // ========================================
        // ✍️ TYPING START
        // ========================================
        socket.on("typing_start", (data) => {
            socket.to(`conversation_${data.conversationId}`).emit("user_typing", {
                conversationId: data.conversationId,
                userId: data.userId,
                isTyping: true,
            });
        });
        // ========================================
        // ✍️ TYPING STOP
        // ========================================
        socket.on("typing_stop", (data) => {
            socket.to(`conversation_${data.conversationId}`).emit("user_typing", {
                conversationId: data.conversationId,
                userId: data.userId,
                isTyping: false,
            });
        });
        // ========================================
        // ✅ MARK AS READ (Real-time)
        // ========================================
        socket.on("mark_read", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { conversationId, userId } = data;
                // Get all messages in conversation where user is not the sender
                const messages = yield prisma_1.prisma.message.findMany({
                    where: {
                        conversationId: String(conversationId),
                        senderId: { not: userId },
                    },
                    select: { id: true },
                });
                // Mark as read
                yield prisma_1.prisma.messageRead.createMany({
                    data: messages.map((msg) => ({
                        messageId: msg.id,
                        mumiId: userId,
                    })),
                    skipDuplicates: true,
                });
                // Emit read status update to conversation room
                io.to(`conversation_${conversationId}`).emit("messages_read", {
                    conversationId,
                    userId,
                    readAt: new Date(),
                });
            }
            catch (error) {
                console.error("Mark read error:", error);
            }
        }));
        // ========================================
        // ❌ DISCONNECT
        // ========================================
        socket.on("disconnect", () => {
            const userId = socketUsers.get(socket.id);
            if (userId) {
                userSockets.delete(userId);
                socketUsers.delete(socket.id);
                io.emit("user_offline", { userId });
                console.log(`❌ User ${userId} disconnected`);
            }
            console.log("❌ Socket disconnected:", socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
// ========================================
// 📤 HELPER: Emit to conversation room
// ========================================
const emitToConversation = (conversationId, event, data) => {
    if (io) {
        io.to(`conversation_${conversationId}`).emit(event, data);
    }
};
exports.emitToConversation = emitToConversation;
// ========================================
// 📤 HELPER: Emit to specific user
// ========================================
const emitToUser = (userId, event, data) => {
    if (io) {
        const socketId = userSockets.get(userId);
        if (socketId) {
            io.to(socketId).emit(event, data);
        }
    }
};
exports.emitToUser = emitToUser;
// ========================================
// 📤 HELPER: Emit chat_list_update to participants
// ========================================
const emitChatListUpdate = (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!io)
        return;
    try {
        // Get all participants of the conversation
        const participants = yield prisma_1.prisma.conversationParticipant.findMany({
            where: { conversationId: String(conversationId) },
            select: { mumiId: true },
        });
        // Emit to all participants
        participants.forEach((participant) => {
            (0, exports.emitToUser)(participant.mumiId, "chat_list_update", {
                conversationId,
                updatedAt: new Date(),
            });
        });
    }
    catch (error) {
        console.error("Error emitting chat list update:", error);
    }
});
exports.emitChatListUpdate = emitChatListUpdate;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
exports.getIO = getIO;
const getUserSocket = (userId) => {
    return userSockets.get(userId);
};
exports.getUserSocket = getUserSocket;
