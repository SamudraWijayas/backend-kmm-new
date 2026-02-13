import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";
import authGenerus from "../middleware/authGenerus.middleware";
import acl from "../middleware/acl.middleware";
import mediaMiddleware from "../middleware/media.middleware";
import { ROLES } from "../utils/constant";
import aclMiddleware from "../middleware/acl.middleware";
import daerahController from "../controllers/daerah.controller";
import desaController from "../controllers/desa.controller";
import kelompokController from "../controllers/kelompok.controller";
import kegiatanController from "../controllers/kegiatan.controller";
import jenjangController from "../controllers/jenjang.controler";
import kelasjenjangController from "../controllers/kelasJenjang.controler";
import generusController from "../controllers/generus.controler";
import caberawitController from "../controllers/caberawit.controller";
import absenController from "../controllers/absenGenerus.controller";
import mediaController from "../controllers/media.controller";
import userController from "../controllers/user.controller";
import indikatorController from "../controllers/indikatorKelas.controller";
import taController from "../controllers/tahunajaran.controller";
import mapelController from "../controllers/mapel.controler";
import kategoriController from "../controllers/kategoriIndikator.controler";
import absenCaberawitController from "../controllers/absenCaberawit.controller";
import catatanWaliKelasController from "../controllers/catatanWaliKelas.controller";
import authGenerusController from "../controllers/authGenerus";
import raporController from "../controllers/rapor.controller";
import messageController from "../controllers/message.controller";
import chatController from "../controllers/chat.controller";

const router = express.Router();

// ================== AUTH ==================
router.post(
  "/auth/register",
  authController.register,
  /*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Register user baru'
  #swagger.requestBody = {
    required: true,
    schema: { $ref: "#/components/schemas/RegisterRequest" }
  }
  #swagger.responses[201] = {
    description: "User berhasil terdaftar",
    schema: { $ref: "#/components/schemas/UserResponse" }
  }
  */
);

router.post(
  "/auth/login",
  authController.login,
  /*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Login user'
  #swagger.requestBody = {
    required: true,
    schema: { $ref: "#/components/schemas/LoginRequest" }
  }
  #swagger.responses[200] = {
    description: "Login berhasil, token JWT dikembalikan",
    schema: { $ref: "#/components/schemas/LoginResponse" }
  }
  */
);

router.put(
  "/auth/update-profile",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.SUPERADMIN,
      ROLES.ADMIN,
      ROLES.DAERAH,
      ROLES.SUBDAERAH,
      ROLES.DESA,
      ROLES.SUBDESA,
      ROLES.KELOMPOK,
      ROLES.SUBKELOMPOK,
    ]),
  ],
  authController.updateProfile,
  /*
  #swagger.tags = ['Auth']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/UpdateProfileRequest"
    }
  }
  */
);

router.put(
  "/auth/update-password",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.SUPERADMIN,
      ROLES.ADMIN,
      ROLES.DAERAH,
      ROLES.SUBDAERAH,
      ROLES.DESA,
      ROLES.SUBDESA,
      ROLES.KELOMPOK,
      ROLES.SUBKELOMPOK,
    ]),
  ],
  authController.updatePassword,
  /*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Update Password'
  #swagger.security = [{
    "bearerAuth": {}
  }]
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/UpdatePasswordRequest"
    }
  }
  */
);

router.get(
  "/auth/me",
  authMiddleware,
  authController.me,
  /*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Ambil data user yang sedang login'
  #swagger.security = [{
    "bearerAuth": {}
  }]
  */
);
// ================== USER ====================
router.post(
  "/users",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  userController.addUser,
);

router.get(
  "/users",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.SUPERADMIN,
      ROLES.ADMIN,
      ROLES.DAERAH,
      ROLES.SUBDAERAH,
      ROLES.DESA,
      ROLES.SUBDESA,
      ROLES.KELOMPOK,
      ROLES.SUBKELOMPOK,
    ]),
  ],
  authMiddleware,
  userController.findAll,
);

router.get(
  "/users/kelompok/:kelompokId",
  [authMiddleware, aclMiddleware([ROLES.KELOMPOK, ROLES.SUBKELOMPOK])],
  userController.findAllByKelompok,
);
router.get(
  "/users/desa/:desaId",
  [authMiddleware, aclMiddleware([ROLES.DESA, ROLES.SUBDESA])],
  userController.findAllByDesa,
);
router.delete(
  "/users/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  userController.remove,
);

// ================== UPLOAD ==================
router.post(
  "/media/upload-single",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.SUPERADMIN,
      ROLES.ADMIN,
      ROLES.DAERAH,
      ROLES.SUBDAERAH,
      ROLES.DESA,
      ROLES.SUBDESA,
      ROLES.KELOMPOK,
      ROLES.SUBKELOMPOK,
    ]),
    mediaMiddleware.single("file"),
  ],
  mediaController.single,
  /*
  #swagger.tags = ['Media']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  #swagger.requestBody = {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            file: {
              type: "string",
              format: "binary"
            }
          }
        }
      }
    }
  }
  */
);
router.post(
  "/media/upload-multiple",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.SUPERADMIN,
      ROLES.ADMIN,
      ROLES.DAERAH,
      ROLES.SUBDAERAH,
      ROLES.DESA,
      ROLES.SUBDESA,
      ROLES.KELOMPOK,
      ROLES.SUBKELOMPOK,
    ]),
    mediaMiddleware.multiple("files"),
  ],
  mediaController.multiple,
  /*
  #swagger.tags = ['Media']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  #swagger.requestBody = {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            files: {
              type: "array",
              items: {
                type: "string",
                format: "binary"
              }
            }
          }
        }
      }
    }
  }
  */
);
router.delete(
  "/media/remove",
  authMiddleware,
  mediaController.remove,
  /*
  #swagger.tags = ['Media']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/RemoveMediaRequest"
    }
  }
  */
);
router.delete(
  "/media/remove-multiple",
  authMiddleware,
  mediaController.removeMultiple,
  /*
  #swagger.tags = ['Media']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/RemoveMediaRequest"
    }
  }
  */
);

// ================== DAERAH ==================
router.post(
  "/daerah",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  daerahController.addDaerah,
  /*
  #swagger.tags = ['Order']
  #swagger.security = [{
    "bearerAuth": ""
  }]
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/CreateOrderRequest"
    }
  }
  */
);

router.get(
  "/daerah",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  daerahController.findAll,
);

router.put(
  "/daerah/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  daerahController.update,
);

router.delete(
  "/daerah/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  daerahController.remove,
);

// ================== DESA ==================

router.post(
  "/desa",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  desaController.addDesa,
  /*
  #swagger.tags = ['Order']
  #swagger.security = [{
    "bearerAuth": ""
  }]
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/CreateOrderRequest"
    }
  }
  */
);

router.get("/desa", authMiddleware, desaController.findAll);

router.get(
  "/desa/daerah/:daerahId",
  [authMiddleware, aclMiddleware([ROLES.DAERAH, ROLES.SUBDAERAH])],
  desaController.findByDaerah,
);

router.put(
  "/desa/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  desaController.update,
);

router.delete(
  "/desa/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  desaController.remove,
);

// ================== Kelompok ==================
router.post(
  "/kelompok",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  kelompokController.addKelompok,
);
router.get("/kelompok", authMiddleware, kelompokController.findAll);
router.get(
  "/kelompok/:desaId",
  [authMiddleware, aclMiddleware([ROLES.DESA, ROLES.SUBDESA])],
  kelompokController.findByDesa,
);

router.get(
  "/kelompok/daerah/:daerahId",
  [authMiddleware, aclMiddleware([ROLES.DAERAH, ROLES.SUBDAERAH])],
  kelompokController.findByDaerah,
);

router.put(
  "/kelompok/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  kelompokController.update,
);

router.delete(
  "/kelompok/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  kelompokController.remove,
);

// ================== Absen ==================

router.get(
  "/absen/:kegiatanId",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.SUPERADMIN,
      ROLES.ADMIN,
      ROLES.DAERAH,
      ROLES.SUBDAERAH,
      ROLES.DESA,
      ROLES.SUBDESA,
      ROLES.KELOMPOK,
      ROLES.SUBKELOMPOK,
    ]),
  ],
  absenController.findByKegiatan,
);

// ================== Kegiatan ==================
router.post(
  "/kegiatan",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  kegiatanController.addKegiatan,
);

router.get(
  "/kegiatan",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.SUPERADMIN,
      ROLES.ADMIN,
      ROLES.DAERAH,
      ROLES.SUBDAERAH,
      ROLES.DESA,
      ROLES.SUBDESA,
      ROLES.KELOMPOK,
      ROLES.SUBKELOMPOK,
    ]),
  ],
  kegiatanController.findAll,
);
router.get(
  "/kegiatan/filter",
  authMiddleware,
  kegiatanController.findAllByFilter,
);

router.get(
  "/kegiatan/:id",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.SUPERADMIN,
      ROLES.ADMIN,
      ROLES.DAERAH,
      ROLES.SUBDAERAH,
      ROLES.DESA,
      ROLES.SUBDESA,
      ROLES.KELOMPOK,
      ROLES.SUBKELOMPOK,
    ]),
  ],
  kegiatanController.findOne,
);

router.put(
  "/kegiatan/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  kegiatanController.update,
);
router.put(
  "/kegiatan/:id/dokumentasi",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  kegiatanController.updateDokumentasi,
);

router.delete(
  "/kegiatan/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  kegiatanController.remove,
);

// ================== Jenjang ==================
router.post(
  "/jenjang",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.ADMIN])],
  jenjangController.addJenjang,
);
router.get("/jenjang", authMiddleware, jenjangController.findAll);

router.put(
  "/jenjang/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.ADMIN])],
  jenjangController.update,
);

router.delete(
  "/jenjang/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.ADMIN])],
  jenjangController.remove,
);

// ================= Kelas Jenjang ==================

router.post(
  "/kelasjenjang",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.ADMIN])],
  kelasjenjangController.add,
);
router.get(
  "/kelasjenjang",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  kelasjenjangController.findAll,
);

router.put(
  "/kelasjenjang/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.ADMIN])],
  kelasjenjangController.update,
);

router.delete(
  "/kelasjenjang/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.ADMIN])],
  kelasjenjangController.remove,
);

// ================== Generus ==================
router.post(
  "/generus",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.SUPERADMIN,
      ROLES.ADMIN,
      ROLES.DAERAH,
      ROLES.SUBDAERAH,
      ROLES.DESA,
      ROLES.SUBDESA,
      ROLES.KELOMPOK,
      ROLES.SUBKELOMPOK,
    ]),
  ],
  generusController.addGenerus,
);
router.get(
  "/generus",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.SUPERADMIN,
      ROLES.ADMIN,
      ROLES.DAERAH,
      ROLES.SUBDAERAH,
      ROLES.DESA,
      ROLES.SUBDESA,
      ROLES.KELOMPOK,
      ROLES.SUBKELOMPOK,
    ]),
  ],
  generusController.findAll,
);
router.get(
  "/generus/daerah/:daerahId",
  [authMiddleware, aclMiddleware([ROLES.DAERAH, ROLES.SUBDAERAH])],
  generusController.findAllByDaerah,
);
router.get(
  "/generus/statistik/jenjang/daerah/:daerahId",
  authMiddleware,
  generusController.statistikMumibyDaerah,
);
router.get(
  "/generus/count/statistik/jenjang/daerah/:daerahId",
  authMiddleware,
  generusController.countStatsByDaerah,
);
router.get(
  "/generus/statistik/jenjang/desa/:desaId",
  authMiddleware,
  generusController.countByJenjangKelompokDesa,
);
router.get(
  "/generus/statistik/jenjang/kelompok/:kelompokId",
  authMiddleware,
  generusController.countStatsByKelompokId,
);
router.get(
  "/generus/:kelompokId/mumi",
  authMiddleware,
  generusController.findAllByKelompok,
);
router.get(
  "/generus/:daerahId/mahasiswa",
  [authMiddleware, aclMiddleware([ROLES.DAERAH, ROLES.SUBDAERAH])],
  generusController.findAllByMahasiswaDaerah,
);
router.get(
  "/generus/:desaId/mahasiswa",
  [authMiddleware, aclMiddleware([ROLES.DESA, ROLES.SUBDESA])],
  generusController.findAllByMahasiswaDesa,
);
router.get(
  "/generus/:kelompokId/mahasiswa/kelompok",
  authMiddleware,
  generusController.findAllByMahasiswaKelompok,
);

router.get(
  "/generus/:kelompokId/mahasiswa/kelompok",
  [authMiddleware, aclMiddleware([ROLES.DESA, ROLES.SUBDESA])],
  generusController.findAllByMahasiswaKelompok,
);

router.get(
  "/generus/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  generusController.findOne,
);
router.put(
  "/generus/:id",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.SUPERADMIN,
      ROLES.ADMIN,
      ROLES.DAERAH,
      ROLES.SUBDAERAH,
      ROLES.DESA,
      ROLES.SUBDESA,
      ROLES.KELOMPOK,
      ROLES.SUBKELOMPOK,
    ]),
  ],
  generusController.update,
);
router.delete(
  "/generus/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  generusController.remove,
);

// ================== Caberawit ==================

router.patch(
  "/caberawit/assign-wali",
  [authMiddleware, aclMiddleware([ROLES.KELOMPOK, ROLES.SUBKELOMPOK])],
  caberawitController.assignWali,
);
router.patch(
  "/caberawit/unassign-wali",
  [authMiddleware, aclMiddleware([ROLES.KELOMPOK, ROLES.SUBKELOMPOK])],
  caberawitController.unassignWali,
);

router.post(
  "/caberawit",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.SUPERADMIN,
      ROLES.ADMIN,
      ROLES.DAERAH,
      ROLES.SUBDAERAH,
      ROLES.DESA,
      ROLES.SUBDESA,
      ROLES.KELOMPOK,
      ROLES.SUBKELOMPOK,
    ]),
  ],
  caberawitController.addCaberawit,
);
router.get(
  "/caberawit",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.SUPERADMIN,
      ROLES.ADMIN,
      ROLES.DAERAH,
      ROLES.SUBDAERAH,
      ROLES.DESA,
      ROLES.SUBDESA,
      ROLES.KELOMPOK,
      ROLES.SUBKELOMPOK,
    ]),
  ],
  caberawitController.findAll,
);
router.get(
  "/caberawit/daerah/:daerahId",
  [authMiddleware, aclMiddleware([ROLES.DAERAH, ROLES.SUBDAERAH])],
  caberawitController.findAllByDaerah,
);

router.get(
  "/caberawit/by-wali",
  [authMiddleware, aclMiddleware([ROLES.KELOMPOK, ROLES.SUBKELOMPOK])],
  caberawitController.findAllByWali,
);

router.get(
  "/caberawit/:kelompokId",
  authMiddleware,
  caberawitController.findAllByKelompok,
);

router.get(
  "/caberawit-one/:id",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.SUPERADMIN,
      ROLES.ADMIN,
      ROLES.DAERAH,
      ROLES.SUBDAERAH,
      ROLES.DESA,
      ROLES.SUBDESA,
      ROLES.KELOMPOK,
      ROLES.SUBKELOMPOK,
    ]),
  ],
  caberawitController.findOne,
);

router.put(
  "/caberawit/:id",
  [
    authMiddleware,
    aclMiddleware([
      ROLES.SUPERADMIN,
      ROLES.ADMIN,
      ROLES.DAERAH,
      ROLES.SUBDAERAH,
      ROLES.DESA,
      ROLES.SUBDESA,
      ROLES.KELOMPOK,
      ROLES.SUBKELOMPOK,
    ]),
  ],
  caberawitController.update,
);
router.delete(
  "/caberawit/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  caberawitController.remove,
);

// ====== Count ======
router.get("/count/daerah", authMiddleware, daerahController.countDaerah);
router.get("/count/daerah", authMiddleware, daerahController.countDaerah);
router.get(
  "/count/desa-bydaerah/:daerahId",
  [authMiddleware, aclMiddleware([ROLES.DAERAH, ROLES.SUBDAERAH])],
  desaController.countDesaByDaerah,
);
router.get(
  "/count/kelompok-bydaerah/:daerahId",
  [authMiddleware, aclMiddleware([ROLES.DAERAH, ROLES.SUBDAERAH])],
  kelompokController.countKelompokByDaerah,
);
router.get("/count/kelompok", authMiddleware, kelompokController.countKelompok);
router.get("/count/mumi", authMiddleware, generusController.countMumi);
router.get(
  "/count/caberawit",
  authMiddleware,
  caberawitController.countCaberawit,
);

// ================== Rapor ==================

router.get(
  "/rapor/caberawit/:caberawitId",
  authMiddleware,
  raporController.getByCaberawit,
);
router.post("/rapor", authMiddleware, raporController.upsert);
// router.get(
//   "/rapor/caberawit/:caberawitId",
//   authMiddleware,
//   raporController.getRaporByCaberawitId,
// );

// router.post("/rapor", authMiddleware, raporController.createRapor);
// router.patch("/rapor/:id", authMiddleware, raporController.updateRapor);
// router.delete("/rapor/:id", authMiddleware, raporController.deleteRapor);

// ================== Indikator Kelas ==================

router.post("/indikator", authMiddleware, indikatorController.create);
router.get("/indikator", authMiddleware, indikatorController.getAll);
router.get(
  "/indikator/kelas-jenjang/:kelasJenjangId",
  authMiddleware,
  indikatorController.getByKelasJenjang,
);
router.get(
  "/indikator/by-jenjang/:jenjangId",
  authMiddleware,
  indikatorController.getByJenjang,
);
router.get("/indikator/:id", authMiddleware, indikatorController.getById);
router.put("/indikator/:id", authMiddleware, indikatorController.update);
router.delete("/indikator/:id", authMiddleware, indikatorController.delete);

// ================== Tahun Ajaran ==================
router.post("/tahunajaran", authMiddleware, taController.add);
router.get("/tahunajaran", authMiddleware, taController.findAll);

// ================== Mata Pelajaran ==================
router.post("/mapel", authMiddleware, mapelController.addmapel);
router.get("/mapel", authMiddleware, mapelController.findAll);
router.put("/mapel/:id", authMiddleware, mapelController.update);
router.delete("/mapel/:id", authMiddleware, mapelController.remove);

// ================== Kategori Indikator ==================
router.post("/kategori-indikator", authMiddleware, kategoriController.add);
router.get("/kategori-indikator", authMiddleware, kategoriController.findAll);
router.put(
  "/kategori-indikator/:id",
  authMiddleware,
  kategoriController.update,
);
router.delete(
  "/kategori-indikator/:id",
  authMiddleware,
  kategoriController.remove,
);

// absen caberawit
router.post("/absen", authMiddleware, absenCaberawitController.absen);
router.post(
  "/absen/massal",
  authMiddleware,
  absenCaberawitController.absenMassal,
);

router.get(
  "/absen/caberawit/rekap/:caberawitId",
  authMiddleware,
  absenCaberawitController.getRekapByCaberawit,
);

router.get("/absen", authMiddleware, absenCaberawitController.findByTanggal);
router.get(
  "/absen/caberawit/bulanan/:caberawitId",
  authMiddleware,
  absenCaberawitController.findByCaberawitBulanan,
);

router.delete("/absen/:id", authMiddleware, absenCaberawitController.remove);

// catatan wali kelas
router.post("/catatan-wali", authMiddleware, catatanWaliKelasController.upsert);
router.get(
  "/catatan-wali/caberawit/:caberawitId",
  authMiddleware,
  catatanWaliKelasController.get,
);

router.delete(
  "/catatan-wali/:id",
  authMiddleware,
  catatanWaliKelasController.remove,
);

// auth generus =======================================================================================================

// login GENERUS
router.post("/auth-generus/login", authGenerusController.loginGenerus);
router.put(
  "/auth-generus/update-profile",
  authGenerus,
  authGenerusController.updateProfile,
);

// ambil profil GENERUS
router.get("/auth-generus/me", authGenerus, authGenerusController.meGenerus);
router.get(
  "/kegiatan-generus/desa",
  authGenerus,
  kegiatanController.findAuthMumiByDesa,
);
router.put(
  "/auth-generus/set-password",
  authGenerus,
  authGenerusController.setPasswordFirstTime,
);

router.get("/kegiatan-generus", kegiatanController.findAll);

router.get(
  "/kegiatan-generus/daerah",
  authGenerus,
  kegiatanController.findAuthMumiByDaerah,
);
router.post(
  "/media-generus/upload-single",
  [authGenerus, mediaMiddleware.single("file")],
  mediaController.single,
);
router.post("/absen-generus/scan", authGenerus, absenController.absen);
router.get("/desa-generus", authGenerus, desaController.findAll);
router.get("/kelompok-generus", authGenerus, kelompokController.findAll);

router.get("/chat/list", authGenerus, chatController.chatList);

// message
router.post("/messages", authGenerus, messageController.sendMessage);

// GET CHAT BY CONVERSATION
router.get(
  "/messages/:conversationId",
  authGenerus,
  messageController.getConversationChat,
);

// MARK AS READ
router.post("/messages/read", authGenerus, messageController.markAsRead);

router.post(
  "/conversations/private",
  authGenerus,
  messageController.createPrivateConversation,
);

// CREATE GROUP
router.post("/conversations/group", authGenerus, messageController.createGroup);

// GET GROUP DETAIL
router.get(
  "/conversations/group/:conversationId",
  authGenerus,
  messageController.getGroupDetail,
);

router.get(
  "/conversation/:conversationId",
  authGenerus,
  messageController.getConversationById,
);

// UPDATE GROUP
router.patch(
  "/conversations/group/:conversationId",
  authGenerus,
  messageController.updateGroup,
);

// DELETE GROUP
router.delete(
  "/conversations/group/:conversationId",
  authGenerus,
  messageController.deleteGroup,
);

// LEAVE GROUP
router.delete(
  "/conversations/group/:conversationId/leave",
  authGenerus,
  messageController.leaveGroup,
);

// ADD MEMBER
router.post(
  "/conversations/group/:conversationId/member",
  authGenerus,
  messageController.addMember,
);

// REMOVE MEMBER
router.delete(
  "/conversations/group/:conversationId/member/:mumiId",
  authGenerus,
  messageController.removeMember,
);

export default router;
