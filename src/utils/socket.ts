import { Server } from "socket.io";
import { prisma } from "../libs/prisma";
import * as Yup from "yup";

let io: Server;

// User mapping: userId -> socketId
const userSockets: Map<number, string> = new Map();
// Reverse mapping: socketId -> userId
const socketUsers: Map<string, number> = new Map();

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*", // nanti production ganti domain
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // ========================================
    // 👤 USER AUTHENTICATION / REGISTER
    // ========================================
    socket.on("register_user", (userId: number) => {
      userSockets.set(userId, socket.id);
      socketUsers.set(socket.id, userId);
      console.log(`✅ User ${userId} registered with socket ${socket.id}`);

      // Emit user online status
      io.emit("user_online", { userId });
    });

    // ========================================
    // 🚪 JOIN CONVERSATION ROOM
    // ========================================
    socket.on("join_room", (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
      console.log(
        `✅ Socket ${socket.id} joined room conversation_${conversationId}`,
      );
    });

    // ========================================
    // 🚪 LEAVE CONVERSATION ROOM
    // ========================================
    socket.on("leave_room", (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(
        `❌ Socket ${socket.id} left room conversation_${conversationId}`,
      );
    });

    // ========================================
    // ✉️ SEND MESSAGE (Real-time)
    // ========================================
    socket.on("send_message", async (data) => {
      try {
        const { content, conversationId, attachments } = data;

        if (!conversationId) throw new Error("conversationId is required");

        // Ambil userId dari socket (user yang login)
        const senderId = socketUsers.get(socket.id);
        if (!senderId) throw new Error("User belum terdaftar / login");

        // Cek apakah user adalah peserta conversation
        const isParticipant = await prisma.conversationParticipant.findFirst({
          where: { conversationId, mumiId: senderId },
        });

        if (!isParticipant) throw new Error("Bukan anggota conversation");

        const message = await prisma.message.create({
          data: {
            content,
            senderId,
            conversationId, // Prisma v6 compatible
            attachments: attachments
              ? {
                  create: attachments.map((file: any) => ({
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
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        // Emit ke room conversation
        io.to(`conversation_${conversationId}`).emit(
          "receive_message",
          message,
        );

        // Emit chat_list_update ke semua peserta
        emitChatListUpdate(conversationId);
      } catch (error) {
        console.error("Socket error:", error);
      }
    });

    // ========================================
    // ✍️ TYPING START
    // ========================================
    socket.on(
      "typing_start",
      (data: { conversationId: string; userId: number }) => {
        socket.to(`conversation_${data.conversationId}`).emit("user_typing", {
          conversationId: data.conversationId,
          userId: data.userId,
          isTyping: true,
        });
      },
    );

    // ========================================
    // ✍️ TYPING STOP
    // ========================================
    socket.on(
      "typing_stop",
      (data: { conversationId: string; userId: number }) => {
        socket.to(`conversation_${data.conversationId}`).emit("user_typing", {
          conversationId: data.conversationId,
          userId: data.userId,
          isTyping: false,
        });
      },
    );

    // ========================================
    // ✅ MARK AS READ (Real-time)
    // ========================================
    socket.on(
      "mark_read",
      async (data: { conversationId: string; userId: number }) => {
        try {
          const { conversationId, userId } = data;

          // Get all messages in conversation where user is not the sender
          const messages = await prisma.message.findMany({
            where: {
              conversationId: String(conversationId),
              senderId: { not: userId },
            },
            select: { id: true },
          });

          // Mark as read
          await prisma.messageRead.createMany({
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
        } catch (error) {
          console.error("Mark read error:", error);
        }
      },
    );

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

// ========================================
// 📤 HELPER: Emit to conversation room
// ========================================
export const emitToConversation = (
  conversationId: string,
  event: string,
  data: any,
) => {
  if (io) {
    io.to(`conversation_${conversationId}`).emit(event, data);
  }
};

// ========================================
// 📤 HELPER: Emit to specific user
// ========================================
export const emitToUser = (userId: number, event: string, data: any) => {
  if (io) {
    const socketId = userSockets.get(userId);
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  }
};

// ========================================
// 📤 HELPER: Emit chat_list_update to participants
// ========================================
export const emitChatListUpdate = async (conversationId: string) => {
  if (!io) return;

  try {
    // Get all participants of the conversation
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId: String(conversationId) },
      select: { mumiId: true },
    });

    // Emit to all participants
    participants.forEach((participant) => {
      emitToUser(participant.mumiId, "chat_list_update", {
        conversationId,
        updatedAt: new Date(),
      });
    });
  } catch (error) {
    console.error("Error emitting chat list update:", error);
  }
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const getUserSocket = (userId: number) => {
  return userSockets.get(userId);
};
