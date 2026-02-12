/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Mumi` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `mumi` ADD COLUMN `slug` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Mumi_slug_key` ON `Mumi`(`slug`);
