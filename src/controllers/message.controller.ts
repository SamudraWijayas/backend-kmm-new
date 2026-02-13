import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";

const messageDTO = Yup.object({
  content: Yup.string().nullable(),
  conversationId: Yup.number().required(),
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
      const { content, conversationId, attachments } = req.body;

      await messageDTO.validate({ content, conversationId });

      // cek apakah user termasuk participant conversation
      const isParticipant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          mumiId: senderId,
        },
      });

      if (!isParticipant) {
        return response.unauthorized(res, "Bukan anggota conversation");
      }

      const message = await prisma.message.create({
        data: {
          senderId,
          conversationId,
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

      // update updatedAt conversation (biar bisa sorting last chat)
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return response.success(res, message, "✅ Pesan berhasil dikirim");
    } catch (error) {
      return response.error(res, error, "❌ Gagal mengirim pesan");
    }
  },

  // ===============================
  // 🔍 GET CHAT BY CONVERSATION
  // ===============================
  async getConversationChat(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;
      const { conversationId } = req.params;

      if (!userId) {
        return response.unauthorized(res, "Unauthorized");
      }

      // pastikan user participant
      const isParticipant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: conversationId,
          mumiId: userId,
        },
      });

      if (!isParticipant) {
        return response.unauthorized(res, "Bukan anggota conversation");
      }

      const messages = await prisma.message.findMany({
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

      return response.success(res, messages, "✅ Chat berhasil diambil");
    } catch (error) {
      return response.error(res, error, "❌ Gagal mengambil chat");
    }
  },

  // ===============================
  // ✅ MARK AS READ
  // ===============================
  async markAsRead(req: IReqUser, res: Response) {
    try {
      if (!req.user?.id) {
        return response.unauthorized(res, "Unauthorized");
      }

      const userId = req.user.id;
      const { conversationId } = req.body;

      if (!conversationId) {
        return response.notFound(res, "conversationId wajib");
      }

      const messages = await prisma.message.findMany({
        where: {
          conversationId,
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

      return response.success(res, null, "Pesan sudah dibaca");
    } catch (error) {
      return response.error(res, error, "Gagal update read status");
    }
  },

  // ===============================
  // 🟣 CREATE PRIVATE CONVERSATION
  // ===============================
  async createPrivateConversation(req: IReqUser, res: Response) {
    try {
      if (!req.user?.id) {
        return response.unauthorized(res, "Unauthorized");
      }

      const userId = req.user.id;
      const { targetUserId } = req.body;

      if (!targetUserId) {
        return response.notFound(res, "targetUserId wajib");
      }

      if (targetUserId === userId) {
        return response.error(res, null, "Tidak bisa chat dengan diri sendiri");
      }

      // cek apakah sudah ada private chat antara 2 user ini
      const existingConversation = await prisma.conversation.findFirst({
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

      if (
        existingConversation &&
        existingConversation.participants.length === 2
      ) {
        return response.success(
          res,
          existingConversation,
          "Private conversation sudah ada",
        );
      }

      // buat conversation baru
      const conversation = await prisma.conversation.create({
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

      return response.success(
        res,
        conversation,
        "Private conversation berhasil dibuat",
      );
    } catch (error) {
      return response.error(res, error, "Gagal membuat private conversation");
    }
  },

  //
  async createGroup(req: IReqUser, res: Response) {
    try {
      if (!req.user?.id) {
        return response.unauthorized(res, "Unauthorized");
      }

      const { name, description, memberIds, image } = req.body;

      if (!name) {
        return response.notFound(res, "Nama group wajib diisi");
      }

      const creatorId = req.user.id;

      const conversation = await prisma.conversation.create({
        data: {
          isGroup: true,
          name,
          description,
          image,
          createdById: creatorId,
          participants: {
            create: [
              { mumiId: creatorId },
              ...(memberIds?.map((id: number) => ({
                mumiId: id,
              })) || []),
            ],
          },
        },
        include: {
          participants: true,
        },
      });

      return response.success(res, conversation, "✅ Group berhasil dibuat");
    } catch (error) {
      return response.error(res, error, "❌ Gagal membuat group");
    }
  },

  async getConversationById(req: IReqUser, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return response.unauthorized(res, "Unauthorized");
      }

      // pastikan user participant
      const isParticipant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          mumiId: userId,
        },
      });

      if (!isParticipant) {
        return response.unauthorized(res, "Bukan anggota conversation");
      }

      // ambil conversation beserta peserta saja
      const conversation = await prisma.conversation.findUnique({
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
        return response.notFound(res, "Conversation tidak ditemukan");
      }

      return response.success(
        res,
        conversation,
        "✅ Conversation berhasil diambil",
      );
    } catch (error) {
      return response.error(res, error, "❌ Gagal mengambil conversation");
    }
  },

  async getGroupDetail(req: IReqUser, res: Response) {
    try {
      const { conversationId } = req.params;

      const group = await prisma.conversation.findFirst({
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
        return response.notFound(res, "Group tidak ditemukan");
      }

      return response.success(res, group, "Detail group");
    } catch (error) {
      return response.error(res, error, "Gagal mengambil detail group");
    }
  },

  async updateGroup(req: IReqUser, res: Response) {
    try {
      const { conversationId } = req.params;
      const { name, description, image } = req.body;

      const group = await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          name,
          description,
          image,
        },
      });

      return response.success(res, group, "Group berhasil diupdate");
    } catch (error) {
      return response.error(res, error, "Gagal update group");
    }
  },

  async deleteGroup(req: IReqUser, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id;

      const group = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!group || group.createdById !== userId) {
        return response.unauthorized(res, "Bukan creator group");
      }

      await prisma.conversation.delete({
        where: { id: conversationId },
      });

      return response.success(res, null, "Group berhasil dihapus");
    } catch (error) {
      return response.error(res, error, "Gagal hapus group");
    }
  },

  async leaveGroup(req: IReqUser, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id;

      await prisma.conversationParticipant.delete({
        where: {
          conversationId_mumiId: {
            conversationId: conversationId,
            mumiId: userId!,
          },
        },
      });

      return response.success(res, null, "Keluar dari group");
    } catch (error) {
      return response.error(res, error, "Gagal keluar group");
    }
  },

  async addMember(req: IReqUser, res: Response) {
    try {
      const { conversationId } = req.params;
      const { mumiId } = req.body;

      await prisma.conversationParticipant.create({
        data: {
          conversationId: conversationId,
          mumiId,
        },
      });

      return response.success(res, null, "Member ditambahkan");
    } catch (error) {
      return response.error(res, error, "Gagal tambah member");
    }
  },
  async removeMember(req: IReqUser, res: Response) {
    try {
      const { conversationId, mumiId } = req.params;

      await prisma.conversationParticipant.delete({
        where: {
          conversationId_mumiId: {
            conversationId: conversationId,
            mumiId: Number(mumiId),
          },
        },
      });

      return response.success(res, null, "Member dihapus");
    } catch (error) {
      return response.error(res, error, "Gagal hapus member");
    }
  },
};
