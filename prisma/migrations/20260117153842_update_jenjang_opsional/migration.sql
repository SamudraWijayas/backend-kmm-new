-- DropForeignKey
ALTER TABLE `caberawit` DROP FOREIGN KEY `Caberawit_jenjangId_fkey`;

-- DropForeignKey
ALTER TABLE `mumi` DROP FOREIGN KEY `Mumi_jenjangId_fkey`;

-- DropIndex
DROP INDEX `Caberawit_jenjangId_fkey` ON `caberawit`;

-- DropIndex
DROP INDEX `Mumi_jenjangId_fkey` ON `mumi`;

-- AlterTable
ALTER TABLE `caberawit` MODIFY `jenjangId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `mumi` MODIFY `jenjangId` VARCHAR(191) NULL,
    MODIFY `mahasiswa` BOOLEAN NULL;

-- AddForeignKey
ALTER TABLE `Mumi` ADD CONSTRAINT `Mumi_jenjangId_fkey` FOREIGN KEY (`jenjangId`) REFERENCES `Jenjang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Caberawit` ADD CONSTRAINT `Caberawit_jenjangId_fkey` FOREIGN KEY (`jenjangId`) REFERENCES `Jenjang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
