import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";

export default {
  async chatList(req: IReqUser, res: Response) {
    try {
      if (!req.user?.id) {
        return response.unauthorized(res, "User tidak valid");
      }

      const userId = req.user.id;
      const search = String(req.query.search || "");

      // =========================
      // PERSONAL CHAT
      // =========================
      const personalMessages = await prisma.message.findMany({
        where: {
          groupId: null,
          AND: [
            {
              OR: [{ senderId: userId }, { receiverId: userId }],
            },
            ...(search
              ? [
                  {
                    OR: [
                      {
                        sender: {
                          nama: {
                            contains: search,
                          },
                        },
                      },
                      {
                        receiver: {
                          nama: {
                            contains: search,
                          },
                        },
                      },
                    ],
                  },
                ]
              : []),
          ],
        },
        include: {
          sender: true,
          receiver: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const personalMap = new Map();

      for (const msg of personalMessages) {
        const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;

        if (!otherUser) continue;

        if (!personalMap.has(otherUser.id)) {
          const unreadCount = await prisma.message.count({
            where: {
              senderId: otherUser.id,
              receiverId: userId,
              reads: {
                none: {
                  mumiId: userId,
                },
              },
            },
          });

          personalMap.set(otherUser.id, {
            type: "personal",
            user: otherUser,
            lastMessage: msg.content,
            createdAt: msg.createdAt,
            unreadCount,
          });
        }
      }

      // =========================
      // GROUP CHAT
      // =========================
      const groupMembers = await prisma.groupMember.findMany({
        where: {
          mumiId: userId,
          ...(search && {
            group: {
              name: {
                contains: search,
              },
            },
          }),
        },
        include: {
          group: {
            include: {
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      });

      const groupChats = await Promise.all(
        groupMembers.map(async (gm) => {
          const unreadCount = await prisma.message.count({
            where: {
              groupId: gm.group.id,
              senderId: { not: userId },
              reads: {
                none: {
                  mumiId: userId,
                },
              },
            },
          });

          return {
            type: "group",
            group: gm.group,
            lastMessage: gm.group.messages[0]?.content || null,
            createdAt: gm.group.messages[0]?.createdAt || gm.group.createdAt,
            unreadCount,
          };
        }),
      );

      // =========================
      // MERGE + SORT
      // =========================
      const chatList = [
        ...Array.from(personalMap.values()),
        ...groupChats,
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return response.success(res, chatList, "✅ Chat list berhasil diambil");
    } catch (error) {
      console.log(error);
      return response.error(res, error, "❌ Gagal mengambil chat list");
    }
  },
};
