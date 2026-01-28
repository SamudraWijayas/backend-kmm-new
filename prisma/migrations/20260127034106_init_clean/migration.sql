-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `role` ENUM('SUPERADMIN', 'ADMIN', 'DAERAH', 'SUBDAERAH', 'DESA', 'SUBDESA', 'KELOMPOK', 'SUBKELOMPOK') NOT NULL DEFAULT 'SUPERADMIN',
    `daerahId` VARCHAR(191) NULL,
    `desaId` VARCHAR(191) NULL,
    `kelompokId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Daerah` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Daerah_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Desa` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `daerahId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kelompok` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `desaId` VARCHAR(191) NOT NULL,
    `daerahId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kegiatan` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `tingkat` ENUM('DAERAH', 'DESA', 'KELOMPOK') NOT NULL,
    `daerahId` VARCHAR(191) NULL,
    `desaId` VARCHAR(191) NULL,
    `kelompokId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KegiatanSasaran` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kegiatanId` VARCHAR(191) NOT NULL,
    `jenjangId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mumi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `jenjangId` VARCHAR(191) NOT NULL,
    `kelasJenjangId` VARCHAR(191) NULL,
    `tgl_lahir` DATETIME(3) NOT NULL,
    `jenis_kelamin` VARCHAR(191) NOT NULL,
    `gol_darah` VARCHAR(191) NOT NULL,
    `nama_ortu` VARCHAR(191) NOT NULL,
    `mahasiswa` BOOLEAN NULL,
    `foto` VARCHAR(191) NULL,
    `kelompokId` VARCHAR(191) NOT NULL,
    `desaId` VARCHAR(191) NOT NULL,
    `daerahId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Caberawit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `jenjangId` VARCHAR(191) NOT NULL,
    `kelasJenjangId` VARCHAR(191) NULL,
    `tgl_lahir` DATETIME(3) NOT NULL,
    `jenis_kelamin` VARCHAR(191) NOT NULL,
    `gol_darah` VARCHAR(191) NOT NULL,
    `nama_ortu` VARCHAR(191) NOT NULL,
    `foto` VARCHAR(191) NULL,
    `kelompokId` VARCHAR(191) NOT NULL,
    `desaId` VARCHAR(191) NOT NULL,
    `daerahId` VARCHAR(191) NOT NULL,
    `waliId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AbsenGenerus` (
    `id` VARCHAR(191) NOT NULL,
    `kegiatanId` VARCHAR(191) NOT NULL,
    `mumiId` INTEGER NOT NULL,
    `status` ENUM('HADIR', 'TIDAK_HADIR', 'TERLAMBAT') NOT NULL DEFAULT 'TIDAK_HADIR',
    `waktuAbsen` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AbsenCaberawit` (
    `id` VARCHAR(191) NOT NULL,
    `caberawitId` INTEGER NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `status` ENUM('HADIR', 'IZIN', 'SAKIT', 'ALPA') NOT NULL DEFAULT 'ALPA',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AbsenCaberawit_caberawitId_tanggal_key`(`caberawitId`, `tanggal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Jenjang` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Jenjang_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KelasJenjang` (
    `id` VARCHAR(191) NOT NULL,
    `jenjangId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `urutan` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MataPelajaran` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MataPelajaran_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KategoriIndikator` (
    `id` VARCHAR(191) NOT NULL,
    `mataPelajaranId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IndikatorKelas` (
    `id` VARCHAR(191) NOT NULL,
    `kelasJenjangId` VARCHAR(191) NOT NULL,
    `kategoriIndikatorId` VARCHAR(191) NOT NULL,
    `indikator` VARCHAR(191) NOT NULL,
    `semester` ENUM('GANJIL', 'GENAP') NOT NULL,
    `jenisPenilaian` ENUM('PENGETAHUAN', 'KETERAMPILAN', 'KEDUANYA') NOT NULL DEFAULT 'PENGETAHUAN',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TahunAjaran` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RaporGenerus` (
    `id` VARCHAR(191) NOT NULL,
    `mumiId` INTEGER NULL,
    `caberawitId` INTEGER NULL,
    `indikatorKelasId` VARCHAR(191) NOT NULL,
    `kelasJenjangId` VARCHAR(191) NOT NULL,
    `status` ENUM('TUNTAS', 'TIDAK_TUNTAS') NOT NULL,
    `semester` ENUM('GANJIL', 'GENAP') NOT NULL,
    `nilaiPengetahuan` INTEGER NULL,
    `nilaiKeterampilan` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CatatanWaliKelas` (
    `id` VARCHAR(191) NOT NULL,
    `caberawitId` INTEGER NOT NULL,
    `semester` ENUM('GANJIL', 'GENAP') NOT NULL,
    `catatan` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CatatanWaliKelas_caberawitId_semester_key`(`caberawitId`, `semester`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_daerahId_fkey` FOREIGN KEY (`daerahId`) REFERENCES `Daerah`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_desaId_fkey` FOREIGN KEY (`desaId`) REFERENCES `Desa`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `Kelompok`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Desa` ADD CONSTRAINT `Desa_daerahId_fkey` FOREIGN KEY (`daerahId`) REFERENCES `Daerah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kelompok` ADD CONSTRAINT `Kelompok_desaId_fkey` FOREIGN KEY (`desaId`) REFERENCES `Desa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kelompok` ADD CONSTRAINT `Kelompok_daerahId_fkey` FOREIGN KEY (`daerahId`) REFERENCES `Daerah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kegiatan` ADD CONSTRAINT `Kegiatan_daerahId_fkey` FOREIGN KEY (`daerahId`) REFERENCES `Daerah`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kegiatan` ADD CONSTRAINT `Kegiatan_desaId_fkey` FOREIGN KEY (`desaId`) REFERENCES `Desa`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kegiatan` ADD CONSTRAINT `Kegiatan_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `Kelompok`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KegiatanSasaran` ADD CONSTRAINT `KegiatanSasaran_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `Kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KegiatanSasaran` ADD CONSTRAINT `KegiatanSasaran_jenjangId_fkey` FOREIGN KEY (`jenjangId`) REFERENCES `Jenjang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mumi` ADD CONSTRAINT `Mumi_jenjangId_fkey` FOREIGN KEY (`jenjangId`) REFERENCES `Jenjang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mumi` ADD CONSTRAINT `Mumi_kelasJenjangId_fkey` FOREIGN KEY (`kelasJenjangId`) REFERENCES `KelasJenjang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mumi` ADD CONSTRAINT `Mumi_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `Kelompok`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mumi` ADD CONSTRAINT `Mumi_desaId_fkey` FOREIGN KEY (`desaId`) REFERENCES `Desa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mumi` ADD CONSTRAINT `Mumi_daerahId_fkey` FOREIGN KEY (`daerahId`) REFERENCES `Daerah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Caberawit` ADD CONSTRAINT `Caberawit_jenjangId_fkey` FOREIGN KEY (`jenjangId`) REFERENCES `Jenjang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Caberawit` ADD CONSTRAINT `Caberawit_kelasJenjangId_fkey` FOREIGN KEY (`kelasJenjangId`) REFERENCES `KelasJenjang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Caberawit` ADD CONSTRAINT `Caberawit_waliId_fkey` FOREIGN KEY (`waliId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Caberawit` ADD CONSTRAINT `Caberawit_kelompokId_fkey` FOREIGN KEY (`kelompokId`) REFERENCES `Kelompok`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Caberawit` ADD CONSTRAINT `Caberawit_desaId_fkey` FOREIGN KEY (`desaId`) REFERENCES `Desa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Caberawit` ADD CONSTRAINT `Caberawit_daerahId_fkey` FOREIGN KEY (`daerahId`) REFERENCES `Daerah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AbsenGenerus` ADD CONSTRAINT `AbsenGenerus_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `Kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AbsenGenerus` ADD CONSTRAINT `AbsenGenerus_mumiId_fkey` FOREIGN KEY (`mumiId`) REFERENCES `Mumi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AbsenCaberawit` ADD CONSTRAINT `AbsenCaberawit_caberawitId_fkey` FOREIGN KEY (`caberawitId`) REFERENCES `Caberawit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KelasJenjang` ADD CONSTRAINT `KelasJenjang_jenjangId_fkey` FOREIGN KEY (`jenjangId`) REFERENCES `Jenjang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KategoriIndikator` ADD CONSTRAINT `KategoriIndikator_mataPelajaranId_fkey` FOREIGN KEY (`mataPelajaranId`) REFERENCES `MataPelajaran`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IndikatorKelas` ADD CONSTRAINT `IndikatorKelas_kelasJenjangId_fkey` FOREIGN KEY (`kelasJenjangId`) REFERENCES `KelasJenjang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IndikatorKelas` ADD CONSTRAINT `IndikatorKelas_kategoriIndikatorId_fkey` FOREIGN KEY (`kategoriIndikatorId`) REFERENCES `KategoriIndikator`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaporGenerus` ADD CONSTRAINT `RaporGenerus_kelasJenjangId_fkey` FOREIGN KEY (`kelasJenjangId`) REFERENCES `KelasJenjang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaporGenerus` ADD CONSTRAINT `RaporGenerus_mumiId_fkey` FOREIGN KEY (`mumiId`) REFERENCES `Mumi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaporGenerus` ADD CONSTRAINT `RaporGenerus_caberawitId_fkey` FOREIGN KEY (`caberawitId`) REFERENCES `Caberawit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaporGenerus` ADD CONSTRAINT `RaporGenerus_indikatorKelasId_fkey` FOREIGN KEY (`indikatorKelasId`) REFERENCES `IndikatorKelas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CatatanWaliKelas` ADD CONSTRAINT `CatatanWaliKelas_caberawitId_fkey` FOREIGN KEY (`caberawitId`) REFERENCES `Caberawit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
