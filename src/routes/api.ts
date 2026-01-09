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
import raporController from "../controllers/rapor.controller";
import indikatorController from "../controllers/indikatorKelas.controller";
import taController from "../controllers/tahunajaran.controller";
import mapelController from "../controllers/mapel.controler";
import kategoriController from "../controllers/kategoriIndikator.controler";
import absenCaberawitController from "../controllers/absenCaberawit.controller";
import authGenerusController from "../controllers/authGenerus";

const router = express.Router();

// ================== AUTH ==================
router.post(
  "/auth/register",
  authController.register
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
  authController.login
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
  "/auth/update-password",
  [authMiddleware, acl([ROLES.SUPERADMIN, ROLES.ADMIN])],
  authController.updatePassword
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
  authController.me
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
  userController.addUser
);

router.get(
  "/users",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  userController.findAll
);
router.delete(
  "/users/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  userController.remove
);

// ================== UPLOAD ==================
router.post(
  "/media/upload-single",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
    mediaMiddleware.single("file"),
  ],
  mediaController.single
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
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
    mediaMiddleware.multiple("files"),
  ],
  mediaController.multiple
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
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  mediaController.remove
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
  daerahController.addDaerah
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
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  daerahController.findAll
);

router.put(
  "/daerah/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  daerahController.update
);

router.delete(
  "/daerah/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  daerahController.remove
);

// ================== DESA ==================

router.post(
  "/desa",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  desaController.addDesa
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
  "/desa",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  desaController.findAll
);

router.put(
  "/desa/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  desaController.update
);

router.delete(
  "/desa/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  desaController.remove
);

// ================== Kelompok ==================
router.post(
  "/kelompok",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  kelompokController.addKelompok
);
router.get(
  "/kelompok",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  kelompokController.findAll
);
router.get(
  "/kelompok/:desaId",
  [authMiddleware, aclMiddleware([ROLES.DESA, ROLES.SUBDESA])],
  kelompokController.findByDesa
);

router.put(
  "/kelompok/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  kelompokController.update
);

router.delete(
  "/kelompok/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  kelompokController.remove
);

// ================== Absen ==================

router.get(
  "/absen/:kegiatanId",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  absenController.findByKegiatan
);

// ================== Kegiatan ==================
router.post(
  "/kegiatan",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  kegiatanController.addKegiatan
);

router.get(
  "/kegiatan",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  kegiatanController.findAll
);

router.get(
  "/kegiatan/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  kegiatanController.findOne
);

router.put(
  "/kegiatan/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  kegiatanController.update
);

router.delete(
  "/kegiatan/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  kegiatanController.remove
);

// ================== Jenjang ==================
router.post(
  "/jenjang",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.ADMIN])],
  jenjangController.addJenjang
);
router.get("/jenjang", authMiddleware, jenjangController.findAll);

router.put(
  "/jenjang/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.ADMIN])],
  jenjangController.update
);

router.delete(
  "/jenjang/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.ADMIN])],
  jenjangController.remove
);

// ================= Kelas Jenjang ==================

router.post(
  "/kelasjenjang",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.ADMIN])],
  kelasjenjangController.add
);
router.get(
  "/kelasjenjang",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH])],
  kelasjenjangController.findAll
);

router.put(
  "/kelasjenjang/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.ADMIN])],
  kelasjenjangController.update
);

router.delete(
  "/kelasjenjang/:id",
  [authMiddleware, aclMiddleware([ROLES.SUPERADMIN, ROLES.ADMIN])],
  kelasjenjangController.remove
);

// ================== Generus ==================
router.post(
  "/generus",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  generusController.addGenerus
);
router.get(
  "/generus",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  generusController.findAll
);
router.get(
  "/generus/statistik/jenjang/desa/:desaId",
  authMiddleware,
  generusController.countByJenjangKelompokDesa
);
router.get(
  "/generus/:kelompokId/mumi",
  [authMiddleware, aclMiddleware([ROLES.DESA, ROLES.SUBDESA])],
  generusController.findAllByKelompok
);
router.get(
  "/generus/:desaId/mahasiswa",
  [authMiddleware, aclMiddleware([ROLES.DESA, ROLES.SUBDESA])],
  generusController.findAllByMahasiswaDesa
);
router.get(
  "/generus/:kelompokId/mahasiswa/kelompok",
  [authMiddleware, aclMiddleware([ROLES.DESA, ROLES.SUBDESA])],
  generusController.findAllByMahasiswaKelompok
);

router.get(
  "/generus/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  generusController.findOne
);
router.put(
  "/generus/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  generusController.update
);
router.delete(
  "/generus/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  generusController.remove
);

// ================== Caberawit ==================
router.post(
  "/caberawit",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  caberawitController.addCaberawit
);
router.get(
  "/caberawit",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  caberawitController.findAll
);
router.get(
  "/caberawit/:kelompokId",
  [authMiddleware, aclMiddleware([ROLES.DESA, ROLES.SUBDESA])],
  caberawitController.findAllByKelompok
);

router.get(
  "/caberawit/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  caberawitController.findOne
);
router.put(
  "/caberawit/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  caberawitController.update
);
router.delete(
  "/caberawit/:id",
  [
    authMiddleware,
    aclMiddleware([ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.DESA, ROLES.KELOMPOK]),
  ],
  caberawitController.remove
);

// ====== Count ======
router.get("/count/daerah", authMiddleware, daerahController.countDaerah);
router.get("/count/desa", authMiddleware, desaController.countDesa);
router.get("/count/kelompok", authMiddleware, kelompokController.countKelompok);

// ================== Rapor ==================

router.get(
  "/rapor-indikator",
  authMiddleware,
  raporController.getIndikatorByKelas
);
router.get(
  "/rapor/caberawit/:caberawitId",
  authMiddleware,
  raporController.getRaporLengkapByCaberawit
);

router.post("/rapor", authMiddleware, raporController.createRapor);
router.patch("/rapor/:id", authMiddleware, raporController.updateRapor);
router.delete("/rapor/:id", authMiddleware, raporController.deleteRapor);

// ================== Indikator Kelas ==================

router.post("/indikator", authMiddleware, indikatorController.create);
router.get("/indikator", authMiddleware, indikatorController.getAll);
router.get(
  "/indikator/by-jenjang/:jenjangId",
  authMiddleware,
  indikatorController.getByJenjang
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
  kategoriController.update
);
router.delete(
  "/kategori-indikator/:id",
  authMiddleware,
  kategoriController.remove
);

// absen caberawit
router.post("/absen", authMiddleware, absenCaberawitController.absen);
router.post(
  "/absen/massal",
  authMiddleware,
  absenCaberawitController.absenMassal
);
router.get("/absen", authMiddleware, absenCaberawitController.findByTanggal);
router.get(
  "/absen/caberawit/bulanan/:caberawitId",
  authMiddleware,
  absenCaberawitController.findByCaberawitBulanan
);

router.delete("/absen/:id", authMiddleware, absenCaberawitController.remove);

// auth generus

// login GENERUS
router.post("/auth-generus/login", authGenerusController.loginGenerus);

// ambil profil GENERUS
router.get("/auth-generus/me", authGenerus, authGenerusController.meGenerus);
router.get(
  "/kegiatan-generus/desa",
  authGenerus,
  kegiatanController.findByDesa
);
router.get(
  "/kegiatan-generus/daerah",
  authGenerus,
  kegiatanController.findByDaerah
);
router.post("/absen-generus/scan", authGenerus, absenController.absen);

export default router;
