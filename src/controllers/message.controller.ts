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
  // 🟢 Kirim pesan
  async sendMessage(req: IReqUser, res: Response) {
    try {
      const { content, receiverId, groupId, attachments } = req.body;
      if (!req.user?.id) {
        return response.unauthorized(res, "User tidak terautentikasi");
      }

      const senderId = req.user?.id;

      await messageDTO.validate({ content, receiverId, groupId });

      if (!receiverId && !groupId) {
        return response.unauthorized(res, "Harus ada receiverId atau groupId");
      }

      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          groupId,
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

      response.success(res, message, "✅ Pesan berhasil dikirim");
    } catch (error) {
      response.error(res, error, "❌ Gagal mengirim pesan");
    }
  },

  // 🔍 Chat personal
  async getPrivateChat(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;
      const { receiverId } = req.params;

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
        },
        orderBy: { createdAt: "asc" },
      });

      response.success(res, messages, "✅ Chat berhasil diambil");
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil chat");
    }
  },

  // 🔍 Chat group
  async getGroupChat(req: IReqUser, res: Response) {
    try {
      const { groupId } = req.params;

      const messages = await prisma.message.findMany({
        where: { groupId: Number(groupId) },
        include: {
          sender: true,
          attachments: true,
        },
        orderBy: { createdAt: "asc" },
      });

      response.success(res, messages, "✅ Chat group berhasil diambil");
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil chat group");
    }
  },
  async markAsRead(req: IReqUser, res: Response) {
    try {
      if (!req.user?.id) {
        return response.unauthorized(res, "Unauthorized");
      }

      const userId = req.user.id;
      const { senderId, groupId } = req.body;

      // PERSONAL CHAT
      if (senderId) {
        await prisma.message.updateMany({
          where: {
            senderId,
            receiverId: userId,
            read: false,
          },
          data: {
            read: true,
          },
        });
      }

      // GROUP CHAT
      if (groupId) {
        await prisma.message.updateMany({
          where: {
            groupId,
            senderId: { not: userId },
            read: false,
          },
          data: {
            read: true,
          },
        });
      }

      return response.success(res, null, "Pesan sudah dibaca");
    } catch (error) {
      return response.error(res, error, "Gagal update read status");
    }
  },
};
