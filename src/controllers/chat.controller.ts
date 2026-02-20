import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import { emitToUser } from "../utils/socket";

export default {
  async chatList(req: IReqUser, res: Response) {
    try {
      if (!req.user?.id) {
        return response.unauthorized(res, "User tidak valid");
      }

      const userId = req.user.id;
      const search = String(req.query.search || "");

      // =========================
      // AMBIL SEMUA CONVERSATION USER
      // =========================
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: { mumiId: userId },
          },
          ...(search && {
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
          }),
        },
        include: {
          participants: {
            include: {
              mumi: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  nama: true,
                  foto: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      // =========================
      // FORMAT CHAT LIST
      // =========================
      const chatList = await Promise.all(
        conversations.map(async (conv) => {
          const lastMessage = conv.messages[0] || null;

          // hitung unread
          const unreadCount = await prisma.message.count({
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

          const lastMessageContent = lastMessage?.content || null;
          const lastMessageCreatedAt = lastMessage?.createdAt || conv.createdAt;
          const lastMessageSender = lastMessage?.sender || null;

          // PERSONAL CHAT
          if (!conv.isGroup) {
            const otherUser = conv.participants
              .map((p) => p.mumi)
              .find((u) => u.id !== userId);

            return {
              type: "personal",
              conversationId: conv.id,
              user: otherUser,
              lastMessage: lastMessage?.content || null,
              lastMessageSender,
              createdAt: lastMessage?.createdAt || conv.createdAt,
              unreadCount,
            };
          }

          // GROUP CHAT
          return {
            type: "group",
            conversationId: conv.id,
            name: conv.name,
            image: conv.image,
            lastMessage: lastMessage?.content || null,
            lastMessageSender,
            createdAt: lastMessage?.createdAt || conv.createdAt,
            unreadCount,
          };
        }),
      );

      emitToUser(userId, "chat_list_synced", {
        syncedAt: new Date(),
      });

      return response.success(res, chatList, "✅ Chat list berhasil diambil");
    } catch (error) {
      console.log(error);
      return response.error(res, error, "❌ Gagal mengambil chat list");
    }
  },
};
