import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

const messageDTO = Yup.object({
  content: Yup.string().nullable(),
  receiverId: Yup.number().nullable(),
  groupId: Yup.number().nullable(),
});

export default {
  // ===============================
  // 🟢 SEND MESSAGE
  // ===============================
  async sendMessage(req: IReqUser, res: Response) {
    try {
      if (!req.user?.id) {
        return response.unauthorized(res, "User tidak terautentikasi");
      }

      const senderId = req.user.id;
      const { content, receiverId, groupId, attachments } = req.body;

      await messageDTO.validate({ content, receiverId, groupId });

      if (!receiverId && !groupId) {
        return response.notFound(res, "Harus ada receiverId atau groupId");
      }

      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId: receiverId ?? null,
          groupId: groupId ?? null,
          content,
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
        include: {
          sender: true,
          attachments: true,
        },
      });

      return response.success(res, message, "✅ Pesan berhasil dikirim");
    } catch (error) {
      return response.error(res, error, "❌ Gagal mengirim pesan");
    }
  },

  // ===============================
  // 🔍 PERSONAL CHAT
  // ===============================
  async getPrivateChat(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;
      const { receiverId } = req.params;

      if (!userId) {
        return response.unauthorized(res, "Unauthorized");
      }

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: Number(receiverId) },
            { senderId: Number(receiverId), receiverId: userId },
          ],
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

      return response.success(res, messages, "✅ Chat berhasil diambil");
    } catch (error) {
      return response.error(res, error, "❌ Gagal mengambil chat");
    }
  },

  // ===============================
  // 🔍 GROUP CHAT
  // ===============================
  async getGroupChat(req: IReqUser, res: Response) {
    try {
      const { groupId } = req.params;

      const messages = await prisma.message.findMany({
        where: {
          groupId: Number(groupId),
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

      return response.success(res, messages, "✅ Chat group berhasil diambil");
    } catch (error) {
      return response.error(res, error, "❌ Gagal mengambil chat group");
    }
  },

  // ===============================
  // ✅ MARK AS READ (VERSI BARU)
  // ===============================
  async markAsRead(req: IReqUser, res: Response) {
    try {
      if (!req.user?.id) {
        return response.unauthorized(res, "Unauthorized");
      }

      const userId = req.user.id;
      const { senderId, groupId } = req.body;

      // =====================
      // PERSONAL CHAT
      // =====================
      if (senderId) {
        const messages = await prisma.message.findMany({
          where: {
            senderId,
            receiverId: userId,
          },
          select: { id: true },
        });

        await prisma.messageRead.createMany({
          data: messages.map((msg) => ({
            messageId: msg.id,
            mumiId: userId,
          })),
          skipDuplicates: true,
        });
      }

      // =====================
      // GROUP CHAT
      // =====================
      if (groupId) {
        const messages = await prisma.message.findMany({
          where: {
            groupId,
            senderId: { not: userId },
          },
          select: { id: true },
        });

        await prisma.messageRead.createMany({
          data: messages.map((msg) => ({
            messageId: msg.id,
            mumiId: userId,
          })),
          skipDuplicates: true,
        });
      }

      return response.success(res, null, "Pesan sudah dibaca");
    } catch (error) {
      return response.error(res, error, "Gagal update read status");
    }
  },
};
