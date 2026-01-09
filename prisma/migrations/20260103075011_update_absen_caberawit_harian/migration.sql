/*
  Warnings:

  - You are about to drop the column `bulan` on the `absencaberawit` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahHadir` on the `absencaberawit` table. All the data in the column will be lost.
  - You are about to drop the column `tahun` on the `absencaberawit` table. All the data in the column will be lost.
  - You are about to drop the column `totalPertemuan` on the `absencaberawit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[caberawitId,tanggal]` on the table `AbsenCaberawit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tanggal` to the `AbsenCaberawit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `absencaberawit` DROP COLUMN `bulan`,
    DROP COLUMN `jumlahHadir`,
    DROP COLUMN `tahun`,
    DROP COLUMN `totalPertemuan`,
    ADD COLUMN `status` ENUM('HADIR', 'IZIN', 'SAKIT', 'ALPA') NOT NULL DEFAULT 'ALPA',
    ADD COLUMN `tanggal` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `AbsenCaberawit_caberawitId_tanggal_key` ON `AbsenCaberawit`(`caberawitId`, `tanggal`);
