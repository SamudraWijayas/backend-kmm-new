-- DropForeignKey
ALTER TABLE `absengenerus` DROP FOREIGN KEY `AbsenGenerus_kegiatanId_fkey`;

-- DropForeignKey
ALTER TABLE `kegiatansasaran` DROP FOREIGN KEY `KegiatanSasaran_jenjangId_fkey`;

-- DropForeignKey
ALTER TABLE `kegiatansasaran` DROP FOREIGN KEY `KegiatanSasaran_kegiatanId_fkey`;

-- DropIndex
DROP INDEX `AbsenGenerus_kegiatanId_fkey` ON `absengenerus`;

-- DropIndex
DROP INDEX `KegiatanSasaran_jenjangId_fkey` ON `kegiatansasaran`;

-- DropIndex
DROP INDEX `KegiatanSasaran_kegiatanId_fkey` ON `kegiatansasaran`;

-- AddForeignKey
ALTER TABLE `KegiatanSasaran` ADD CONSTRAINT `KegiatanSasaran_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `Kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KegiatanSasaran` ADD CONSTRAINT `KegiatanSasaran_jenjangId_fkey` FOREIGN KEY (`jenjangId`) REFERENCES `Jenjang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AbsenGenerus` ADD CONSTRAINT `AbsenGenerus_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `Kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
