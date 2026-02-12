-- DropForeignKey
ALTER TABLE `kegiatandokumentasi` DROP FOREIGN KEY `KegiatanDokumentasi_kegiatanId_fkey`;

-- DropIndex
DROP INDEX `KegiatanDokumentasi_kegiatanId_fkey` ON `kegiatandokumentasi`;

-- AddForeignKey
ALTER TABLE `KegiatanDokumentasi` ADD CONSTRAINT `KegiatanDokumentasi_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `Kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
