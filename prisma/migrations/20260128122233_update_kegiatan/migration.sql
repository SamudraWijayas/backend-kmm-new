/*
  Warnings:

  - A unique constraint covering the columns `[caberawitId,indikatorKelasId,semester]` on the table `RaporGenerus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `targetType` to the `Kegiatan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `kegiatan` ADD COLUMN `maxUsia` INTEGER NULL,
    ADD COLUMN `minUsia` INTEGER NULL,
    ADD COLUMN `targetType` ENUM('JENJANG', 'MAHASISWA', 'USIA') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `RaporGenerus_caberawitId_indikatorKelasId_semester_key` ON `RaporGenerus`(`caberawitId`, `indikatorKelasId`, `semester`);
