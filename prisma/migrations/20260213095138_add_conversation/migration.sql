/*
  Warnings:

  - You are about to drop the column `groupId` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `message` table. All the data in the column will be lost.
  - You are about to drop the `group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `groupmember` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `conversationId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `group` DROP FOREIGN KEY `Group_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `groupmember` DROP FOREIGN KEY `GroupMember_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `groupmember` DROP FOREIGN KEY `GroupMember_mumiId_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_receiverId_fkey`;

-- DropIndex
DROP INDEX `Message_groupId_fkey` ON `message`;

-- DropIndex
DROP INDEX `Message_receiverId_fkey` ON `message`;

-- AlterTable
ALTER TABLE `message` DROP COLUMN `groupId`,
    DROP COLUMN `receiverId`,
    ADD COLUMN `conversationId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `group`;

-- DropTable
DROP TABLE `groupmember`;

-- CreateTable
CREATE TABLE `Conversation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isGroup` BOOLEAN NOT NULL DEFAULT false,
    `name` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConversationParticipant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversationId` INTEGER NOT NULL,
    `mumiId` INTEGER NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ConversationParticipant_conversationId_mumiId_key`(`conversationId`, `mumiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Mumi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationParticipant` ADD CONSTRAINT `ConversationParticipant_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationParticipant` ADD CONSTRAINT `ConversationParticipant_mumiId_fkey` FOREIGN KEY (`mumiId`) REFERENCES `Mumi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
