-- AlterTable
ALTER TABLE `caberawit` ADD COLUMN `waliId` INTEGER NULL;

-- CreateTable
CREATE TABLE `CatatanWaliKelas` (
    `id` VARCHAR(191) NOT NULL,
    `caberawitId` INTEGER NOT NULL,
    `tahunAjaranId` VARCHAR(191) NOT NULL,
    `semester` ENUM('GANJIL', 'GENAP') NOT NULL,
    `catatan` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CatatanWaliKelas_caberawitId_tahunAjaranId_semester_key`(`caberawitId`, `tahunAjaranId`, `semester`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Caberawit` ADD CONSTRAINT `Caberawit_waliId_fkey` FOREIGN KEY (`waliId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CatatanWaliKelas` ADD CONSTRAINT `CatatanWaliKelas_caberawitId_fkey` FOREIGN KEY (`caberawitId`) REFERENCES `Caberawit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CatatanWaliKelas` ADD CONSTRAINT `CatatanWaliKelas_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `TahunAjaran`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
