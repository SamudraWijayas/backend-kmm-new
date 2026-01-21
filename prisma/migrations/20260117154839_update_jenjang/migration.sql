/*
  Warnings:

  - Made the column `jenjangId` on table `caberawit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `jenjangId` on table `mumi` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mahasiswa` on table `mumi` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `caberawit` DROP FOREIGN KEY `Caberawit_jenjangId_fkey`;

-- DropForeignKey
ALTER TABLE `mumi` DROP FOREIGN KEY `Mumi_jenjangId_fkey`;

-- DropIndex
DROP INDEX `Caberawit_jenjangId_fkey` ON `caberawit`;

-- DropIndex
DROP INDEX `Mumi_jenjangId_fkey` ON `mumi`;

-- AlterTable
ALTER TABLE `caberawit` MODIFY `jenjangId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `mumi` MODIFY `jenjangId` VARCHAR(191) NOT NULL,
    MODIFY `mahasiswa` BOOLEAN NOT NULL;

-- AddForeignKey
ALTER TABLE `Mumi` ADD CONSTRAINT `Mumi_jenjangId_fkey` FOREIGN KEY (`jenjangId`) REFERENCES `Jenjang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Caberawit` ADD CONSTRAINT `Caberawit_jenjangId_fkey` FOREIGN KEY (`jenjangId`) REFERENCES `Jenjang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
