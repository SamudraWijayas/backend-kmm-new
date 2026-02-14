"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const authGenerus_middleware_1 = __importDefault(require("../middleware/authGenerus.middleware"));
const media_middleware_1 = __importDefault(require("../middleware/media.middleware"));
const constant_1 = require("../utils/constant");
const acl_middleware_1 = __importDefault(require("../middleware/acl.middleware"));
const daerah_controller_1 = __importDefault(require("../controllers/daerah.controller"));
const desa_controller_1 = __importDefault(require("../controllers/desa.controller"));
const kelompok_controller_1 = __importDefault(require("../controllers/kelompok.controller"));
const kegiatan_controller_1 = __importDefault(require("../controllers/kegiatan.controller"));
const jenjang_controler_1 = __importDefault(require("../controllers/jenjang.controler"));
const kelasJenjang_controler_1 = __importDefault(require("../controllers/kelasJenjang.controler"));
const generus_controler_1 = __importDefault(require("../controllers/generus.controler"));
const caberawit_controller_1 = __importDefault(require("../controllers/caberawit.controller"));
const absenGenerus_controller_1 = __importDefault(require("../controllers/absenGenerus.controller"));
const media_controller_1 = __importDefault(require("../controllers/media.controller"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const indikatorKelas_controller_1 = __importDefault(require("../controllers/indikatorKelas.controller"));
const tahunajaran_controller_1 = __importDefault(require("../controllers/tahunajaran.controller"));
const mapel_controler_1 = __importDefault(require("../controllers/mapel.controler"));
const kategoriIndikator_controler_1 = __importDefault(require("../controllers/kategoriIndikator.controler"));
const absenCaberawit_controller_1 = __importDefault(require("../controllers/absenCaberawit.controller"));
const catatanWaliKelas_controller_1 = __importDefault(require("../controllers/catatanWaliKelas.controller"));
const authGenerus_1 = __importDefault(require("../controllers/authGenerus"));
const rapor_controller_1 = __importDefault(require("../controllers/rapor.controller"));
const message_controller_1 = __importDefault(require("../controllers/message.controller"));
const chat_controller_1 = __importDefault(require("../controllers/chat.controller"));
const router = express_1.default.Router();
// ================== AUTH ==================
router.post("/auth/register", auth_controller_1.default.register);
router.post("/auth/login", auth_controller_1.default.login);
router.put("/auth/update-profile", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([
        constant_1.ROLES.SUPERADMIN,
        constant_1.ROLES.ADMIN,
        constant_1.ROLES.DAERAH,
        constant_1.ROLES.SUBDAERAH,
        constant_1.ROLES.DESA,
        constant_1.ROLES.SUBDESA,
        constant_1.ROLES.KELOMPOK,
        constant_1.ROLES.SUBKELOMPOK,
    ]),
], auth_controller_1.default.updateProfile);
router.put("/auth/update-password", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([
        constant_1.ROLES.SUPERADMIN,
        constant_1.ROLES.ADMIN,
        constant_1.ROLES.DAERAH,
        constant_1.ROLES.SUBDAERAH,
        constant_1.ROLES.DESA,
        constant_1.ROLES.SUBDESA,
        constant_1.ROLES.KELOMPOK,
        constant_1.ROLES.SUBKELOMPOK,
    ]),
], auth_controller_1.default.updatePassword);
router.get("/auth/me", auth_middleware_1.default, auth_controller_1.default.me);
// ================== USER ====================
router.post("/users", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH, constant_1.ROLES.DESA, constant_1.ROLES.KELOMPOK]),
], user_controller_1.default.addUser);
router.get("/users", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([
        constant_1.ROLES.SUPERADMIN,
        constant_1.ROLES.ADMIN,
        constant_1.ROLES.DAERAH,
        constant_1.ROLES.SUBDAERAH,
        constant_1.ROLES.DESA,
        constant_1.ROLES.SUBDESA,
        constant_1.ROLES.KELOMPOK,
        constant_1.ROLES.SUBKELOMPOK,
    ]),
], auth_middleware_1.default, user_controller_1.default.findAll);
router.get("/users/kelompok/:kelompokId", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.KELOMPOK, constant_1.ROLES.SUBKELOMPOK])], user_controller_1.default.findAllByKelompok);
router.get("/users/desa/:desaId", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.DESA, constant_1.ROLES.SUBDESA])], user_controller_1.default.findAllByDesa);
router.delete("/users/:id", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH, constant_1.ROLES.DESA, constant_1.ROLES.KELOMPOK]),
], user_controller_1.default.remove);
// ================== UPLOAD ==================
router.post("/media/upload-single", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([
        constant_1.ROLES.SUPERADMIN,
        constant_1.ROLES.ADMIN,
        constant_1.ROLES.DAERAH,
        constant_1.ROLES.SUBDAERAH,
        constant_1.ROLES.DESA,
        constant_1.ROLES.SUBDESA,
        constant_1.ROLES.KELOMPOK,
        constant_1.ROLES.SUBKELOMPOK,
    ]),
    media_middleware_1.default.single("file"),
], media_controller_1.default.single);
router.post("/media/upload-multiple", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([
        constant_1.ROLES.SUPERADMIN,
        constant_1.ROLES.ADMIN,
        constant_1.ROLES.DAERAH,
        constant_1.ROLES.SUBDAERAH,
        constant_1.ROLES.DESA,
        constant_1.ROLES.SUBDESA,
        constant_1.ROLES.KELOMPOK,
        constant_1.ROLES.SUBKELOMPOK,
    ]),
    media_middleware_1.default.multiple("files"),
], media_controller_1.default.multiple);
router.delete("/media/remove", auth_middleware_1.default, media_controller_1.default.remove);
router.delete("/media/remove-multiple", auth_middleware_1.default, media_controller_1.default.removeMultiple);
// ================== DAERAH ==================
router.post("/daerah", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH])], daerah_controller_1.default.addDaerah);
router.get("/daerah", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH, constant_1.ROLES.DESA, constant_1.ROLES.KELOMPOK]),
], daerah_controller_1.default.findAll);
router.put("/daerah/:id", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH])], daerah_controller_1.default.update);
router.delete("/daerah/:id", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH])], daerah_controller_1.default.remove);
// ================== DESA ==================
router.post("/desa", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH])], desa_controller_1.default.addDesa);
router.get("/desa", auth_middleware_1.default, desa_controller_1.default.findAll);
router.get("/desa/daerah/:daerahId", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.DAERAH, constant_1.ROLES.SUBDAERAH])], desa_controller_1.default.findByDaerah);
router.put("/desa/:id", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH])], desa_controller_1.default.update);
router.delete("/desa/:id", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH])], desa_controller_1.default.remove);
// ================== Kelompok ==================
router.post("/kelompok", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH])], kelompok_controller_1.default.addKelompok);
router.get("/kelompok", auth_middleware_1.default, kelompok_controller_1.default.findAll);
router.get("/kelompok/:desaId", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.DESA, constant_1.ROLES.SUBDESA])], kelompok_controller_1.default.findByDesa);
router.get("/kelompok/daerah/:daerahId", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.DAERAH, constant_1.ROLES.SUBDAERAH])], kelompok_controller_1.default.findByDaerah);
router.put("/kelompok/:id", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH])], kelompok_controller_1.default.update);
router.delete("/kelompok/:id", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH])], kelompok_controller_1.default.remove);
// ================== Absen ==================
router.get("/absen/:kegiatanId", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([
        constant_1.ROLES.SUPERADMIN,
        constant_1.ROLES.ADMIN,
        constant_1.ROLES.DAERAH,
        constant_1.ROLES.SUBDAERAH,
        constant_1.ROLES.DESA,
        constant_1.ROLES.SUBDESA,
        constant_1.ROLES.KELOMPOK,
        constant_1.ROLES.SUBKELOMPOK,
    ]),
], absenGenerus_controller_1.default.findByKegiatan);
// ================== Kegiatan ==================
router.post("/kegiatan", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH, constant_1.ROLES.DESA, constant_1.ROLES.KELOMPOK]),
], kegiatan_controller_1.default.addKegiatan);
router.get("/kegiatan", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([
        constant_1.ROLES.SUPERADMIN,
        constant_1.ROLES.ADMIN,
        constant_1.ROLES.DAERAH,
        constant_1.ROLES.SUBDAERAH,
        constant_1.ROLES.DESA,
        constant_1.ROLES.SUBDESA,
        constant_1.ROLES.KELOMPOK,
        constant_1.ROLES.SUBKELOMPOK,
    ]),
], kegiatan_controller_1.default.findAll);
router.get("/kegiatan/filter", auth_middleware_1.default, kegiatan_controller_1.default.findAllByFilter);
router.get("/kegiatan/:id", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([
        constant_1.ROLES.SUPERADMIN,
        constant_1.ROLES.ADMIN,
        constant_1.ROLES.DAERAH,
        constant_1.ROLES.SUBDAERAH,
        constant_1.ROLES.DESA,
        constant_1.ROLES.SUBDESA,
        constant_1.ROLES.KELOMPOK,
        constant_1.ROLES.SUBKELOMPOK,
    ]),
], kegiatan_controller_1.default.findOne);
router.put("/kegiatan/:id", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH, constant_1.ROLES.DESA, constant_1.ROLES.KELOMPOK]),
], kegiatan_controller_1.default.update);
router.put("/kegiatan/:id/dokumentasi", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH, constant_1.ROLES.DESA, constant_1.ROLES.KELOMPOK]),
], kegiatan_controller_1.default.updateDokumentasi);
router.delete("/kegiatan/:id", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH, constant_1.ROLES.DESA, constant_1.ROLES.KELOMPOK]),
], kegiatan_controller_1.default.remove);
// ================== Jenjang ==================
router.post("/jenjang", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.ADMIN])], jenjang_controler_1.default.addJenjang);
router.get("/jenjang", auth_middleware_1.default, jenjang_controler_1.default.findAll);
router.put("/jenjang/:id", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.ADMIN])], jenjang_controler_1.default.update);
router.delete("/jenjang/:id", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.ADMIN])], jenjang_controler_1.default.remove);
// ================= Kelas Jenjang ==================
router.post("/kelasjenjang", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.ADMIN])], kelasJenjang_controler_1.default.add);
router.get("/kelasjenjang", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH, constant_1.ROLES.DESA, constant_1.ROLES.KELOMPOK]),
], kelasJenjang_controler_1.default.findAll);
router.put("/kelasjenjang/:id", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.ADMIN])], kelasJenjang_controler_1.default.update);
router.delete("/kelasjenjang/:id", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.ADMIN])], kelasJenjang_controler_1.default.remove);
// ================== Generus ==================
router.post("/generus", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([
        constant_1.ROLES.SUPERADMIN,
        constant_1.ROLES.ADMIN,
        constant_1.ROLES.DAERAH,
        constant_1.ROLES.SUBDAERAH,
        constant_1.ROLES.DESA,
        constant_1.ROLES.SUBDESA,
        constant_1.ROLES.KELOMPOK,
        constant_1.ROLES.SUBKELOMPOK,
    ]),
], generus_controler_1.default.addGenerus);
router.get("/generus", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([
        constant_1.ROLES.SUPERADMIN,
        constant_1.ROLES.ADMIN,
        constant_1.ROLES.DAERAH,
        constant_1.ROLES.SUBDAERAH,
        constant_1.ROLES.DESA,
        constant_1.ROLES.SUBDESA,
        constant_1.ROLES.KELOMPOK,
        constant_1.ROLES.SUBKELOMPOK,
    ]),
], generus_controler_1.default.findAll);
router.get("/generus/daerah/:daerahId", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.DAERAH, constant_1.ROLES.SUBDAERAH])], generus_controler_1.default.findAllByDaerah);
router.get("/generus/statistik/jenjang/daerah/:daerahId", auth_middleware_1.default, generus_controler_1.default.statistikMumibyDaerah);
router.get("/generus/count/statistik/jenjang/daerah/:daerahId", auth_middleware_1.default, generus_controler_1.default.countStatsByDaerah);
router.get("/generus/statistik/jenjang/desa/:desaId", auth_middleware_1.default, generus_controler_1.default.countByJenjangKelompokDesa);
router.get("/generus/statistik/jenjang/kelompok/:kelompokId", auth_middleware_1.default, generus_controler_1.default.countStatsByKelompokId);
router.get("/generus/:kelompokId/mumi", auth_middleware_1.default, generus_controler_1.default.findAllByKelompok);
router.get("/generus/:daerahId/mahasiswa", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.DAERAH, constant_1.ROLES.SUBDAERAH])], generus_controler_1.default.findAllByMahasiswaDaerah);
router.get("/generus/:desaId/mahasiswa", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.DESA, constant_1.ROLES.SUBDESA])], generus_controler_1.default.findAllByMahasiswaDesa);
router.get("/generus/:kelompokId/mahasiswa/kelompok", auth_middleware_1.default, generus_controler_1.default.findAllByMahasiswaKelompok);
router.get("/generus/:kelompokId/mahasiswa/kelompok", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.DESA, constant_1.ROLES.SUBDESA])], generus_controler_1.default.findAllByMahasiswaKelompok);
router.get("/generus/:id", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH, constant_1.ROLES.DESA, constant_1.ROLES.KELOMPOK]),
], generus_controler_1.default.findOne);
router.put("/generus/:id", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([
        constant_1.ROLES.SUPERADMIN,
        constant_1.ROLES.ADMIN,
        constant_1.ROLES.DAERAH,
        constant_1.ROLES.SUBDAERAH,
        constant_1.ROLES.DESA,
        constant_1.ROLES.SUBDESA,
        constant_1.ROLES.KELOMPOK,
        constant_1.ROLES.SUBKELOMPOK,
    ]),
], generus_controler_1.default.update);
router.delete("/generus/:id", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH, constant_1.ROLES.DESA, constant_1.ROLES.KELOMPOK]),
], generus_controler_1.default.remove);
// ================== Caberawit ==================
router.patch("/caberawit/assign-wali", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.KELOMPOK, constant_1.ROLES.SUBKELOMPOK])], caberawit_controller_1.default.assignWali);
router.patch("/caberawit/unassign-wali", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.KELOMPOK, constant_1.ROLES.SUBKELOMPOK])], caberawit_controller_1.default.unassignWali);
router.post("/caberawit", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([
        constant_1.ROLES.SUPERADMIN,
        constant_1.ROLES.ADMIN,
        constant_1.ROLES.DAERAH,
        constant_1.ROLES.SUBDAERAH,
        constant_1.ROLES.DESA,
        constant_1.ROLES.SUBDESA,
        constant_1.ROLES.KELOMPOK,
        constant_1.ROLES.SUBKELOMPOK,
    ]),
], caberawit_controller_1.default.addCaberawit);
router.get("/caberawit", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([
        constant_1.ROLES.SUPERADMIN,
        constant_1.ROLES.ADMIN,
        constant_1.ROLES.DAERAH,
        constant_1.ROLES.SUBDAERAH,
        constant_1.ROLES.DESA,
        constant_1.ROLES.SUBDESA,
        constant_1.ROLES.KELOMPOK,
        constant_1.ROLES.SUBKELOMPOK,
    ]),
], caberawit_controller_1.default.findAll);
router.get("/caberawit/daerah/:daerahId", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.DAERAH, constant_1.ROLES.SUBDAERAH])], caberawit_controller_1.default.findAllByDaerah);
router.get("/caberawit/by-wali", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.KELOMPOK, constant_1.ROLES.SUBKELOMPOK])], caberawit_controller_1.default.findAllByWali);
router.get("/caberawit/:kelompokId", auth_middleware_1.default, caberawit_controller_1.default.findAllByKelompok);
router.get("/caberawit-one/:id", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([
        constant_1.ROLES.SUPERADMIN,
        constant_1.ROLES.ADMIN,
        constant_1.ROLES.DAERAH,
        constant_1.ROLES.SUBDAERAH,
        constant_1.ROLES.DESA,
        constant_1.ROLES.SUBDESA,
        constant_1.ROLES.KELOMPOK,
        constant_1.ROLES.SUBKELOMPOK,
    ]),
], caberawit_controller_1.default.findOne);
router.put("/caberawit/:id", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([
        constant_1.ROLES.SUPERADMIN,
        constant_1.ROLES.ADMIN,
        constant_1.ROLES.DAERAH,
        constant_1.ROLES.SUBDAERAH,
        constant_1.ROLES.DESA,
        constant_1.ROLES.SUBDESA,
        constant_1.ROLES.KELOMPOK,
        constant_1.ROLES.SUBKELOMPOK,
    ]),
], caberawit_controller_1.default.update);
router.delete("/caberawit/:id", [
    auth_middleware_1.default,
    (0, acl_middleware_1.default)([constant_1.ROLES.SUPERADMIN, constant_1.ROLES.DAERAH, constant_1.ROLES.DESA, constant_1.ROLES.KELOMPOK]),
], caberawit_controller_1.default.remove);
// ====== Count ======
router.get("/count/daerah", auth_middleware_1.default, daerah_controller_1.default.countDaerah);
router.get("/count/daerah", auth_middleware_1.default, daerah_controller_1.default.countDaerah);
router.get("/count/desa-bydaerah/:daerahId", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.DAERAH, constant_1.ROLES.SUBDAERAH])], desa_controller_1.default.countDesaByDaerah);
router.get("/count/kelompok-bydaerah/:daerahId", [auth_middleware_1.default, (0, acl_middleware_1.default)([constant_1.ROLES.DAERAH, constant_1.ROLES.SUBDAERAH])], kelompok_controller_1.default.countKelompokByDaerah);
router.get("/count/kelompok", auth_middleware_1.default, kelompok_controller_1.default.countKelompok);
router.get("/count/mumi", auth_middleware_1.default, generus_controler_1.default.countMumi);
router.get("/count/caberawit", auth_middleware_1.default, caberawit_controller_1.default.countCaberawit);
// ================== Rapor ==================
router.get("/rapor/caberawit/:caberawitId", auth_middleware_1.default, rapor_controller_1.default.getByCaberawit);
router.post("/rapor", auth_middleware_1.default, rapor_controller_1.default.upsert);
// router.get(
//   "/rapor/caberawit/:caberawitId",
//   authMiddleware,
//   raporController.getRaporByCaberawitId,
// );
// router.post("/rapor", authMiddleware, raporController.createRapor);
// router.patch("/rapor/:id", authMiddleware, raporController.updateRapor);
// router.delete("/rapor/:id", authMiddleware, raporController.deleteRapor);
// ================== Indikator Kelas ==================
router.post("/indikator", auth_middleware_1.default, indikatorKelas_controller_1.default.create);
router.get("/indikator", auth_middleware_1.default, indikatorKelas_controller_1.default.getAll);
router.get("/indikator/kelas-jenjang/:kelasJenjangId", auth_middleware_1.default, indikatorKelas_controller_1.default.getByKelasJenjang);
router.get("/indikator/by-jenjang/:jenjangId", auth_middleware_1.default, indikatorKelas_controller_1.default.getByJenjang);
router.get("/indikator/:id", auth_middleware_1.default, indikatorKelas_controller_1.default.getById);
router.put("/indikator/:id", auth_middleware_1.default, indikatorKelas_controller_1.default.update);
router.delete("/indikator/:id", auth_middleware_1.default, indikatorKelas_controller_1.default.delete);
// ================== Tahun Ajaran ==================
router.post("/tahunajaran", auth_middleware_1.default, tahunajaran_controller_1.default.add);
router.get("/tahunajaran", auth_middleware_1.default, tahunajaran_controller_1.default.findAll);
// ================== Mata Pelajaran ==================
router.post("/mapel", auth_middleware_1.default, mapel_controler_1.default.addmapel);
router.get("/mapel", auth_middleware_1.default, mapel_controler_1.default.findAll);
router.put("/mapel/:id", auth_middleware_1.default, mapel_controler_1.default.update);
router.delete("/mapel/:id", auth_middleware_1.default, mapel_controler_1.default.remove);
// ================== Kategori Indikator ==================
router.post("/kategori-indikator", auth_middleware_1.default, kategoriIndikator_controler_1.default.add);
router.get("/kategori-indikator", auth_middleware_1.default, kategoriIndikator_controler_1.default.findAll);
router.put("/kategori-indikator/:id", auth_middleware_1.default, kategoriIndikator_controler_1.default.update);
router.delete("/kategori-indikator/:id", auth_middleware_1.default, kategoriIndikator_controler_1.default.remove);
// absen caberawit
router.post("/absen", auth_middleware_1.default, absenCaberawit_controller_1.default.absen);
router.post("/absen/massal", auth_middleware_1.default, absenCaberawit_controller_1.default.absenMassal);
router.get("/absen/caberawit/rekap/:caberawitId", auth_middleware_1.default, absenCaberawit_controller_1.default.getRekapByCaberawit);
router.get("/absen", auth_middleware_1.default, absenCaberawit_controller_1.default.findByTanggal);
router.get("/absen/caberawit/bulanan/:caberawitId", auth_middleware_1.default, absenCaberawit_controller_1.default.findByCaberawitBulanan);
router.delete("/absen/:id", auth_middleware_1.default, absenCaberawit_controller_1.default.remove);
// catatan wali kelas
router.post("/catatan-wali", auth_middleware_1.default, catatanWaliKelas_controller_1.default.upsert);
router.get("/catatan-wali/caberawit/:caberawitId", auth_middleware_1.default, catatanWaliKelas_controller_1.default.get);
router.delete("/catatan-wali/:id", auth_middleware_1.default, catatanWaliKelas_controller_1.default.remove);
// auth generus =======================================================================================================
// login GENERUS
router.post("/auth-generus/login", authGenerus_1.default.loginGenerus);
router.put("/auth-generus/update-profile", authGenerus_middleware_1.default, authGenerus_1.default.updateProfile);
// ambil profil GENERUS
router.get("/auth-generus/me", authGenerus_middleware_1.default, authGenerus_1.default.meGenerus);
router.get("/kegiatan-generus/desa", authGenerus_middleware_1.default, kegiatan_controller_1.default.findAuthMumiByDesa);
router.put("/auth-generus/set-password", authGenerus_middleware_1.default, authGenerus_1.default.setPasswordFirstTime);
router.get("/kegiatan-generus", kegiatan_controller_1.default.findAll);
router.get("/kegiatan-generus/daerah", authGenerus_middleware_1.default, kegiatan_controller_1.default.findAuthMumiByDaerah);
router.post("/media-generus/upload-single", [authGenerus_middleware_1.default, media_middleware_1.default.single("file")], media_controller_1.default.single);
router.post("/absen-generus/scan", authGenerus_middleware_1.default, absenGenerus_controller_1.default.absen);
router.get("/desa-generus", authGenerus_middleware_1.default, desa_controller_1.default.findAll);
router.get("/kelompok-generus", authGenerus_middleware_1.default, kelompok_controller_1.default.findAll);
router.get("/chat/list", authGenerus_middleware_1.default, chat_controller_1.default.chatList);
// message
router.post("/messages", authGenerus_middleware_1.default, message_controller_1.default.sendMessage);
// GET CHAT BY CONVERSATION
router.get("/messages/:conversationId", authGenerus_middleware_1.default, message_controller_1.default.getConversationChat);
// MARK AS READ
router.post("/messages/read", authGenerus_middleware_1.default, message_controller_1.default.markAsRead);
router.post("/conversations/private", authGenerus_middleware_1.default, message_controller_1.default.createPrivateConversation);
// CREATE GROUP
router.post("/conversations/group", authGenerus_middleware_1.default, message_controller_1.default.createGroup);
// GET GROUP DETAIL
router.get("/conversations/group/:conversationId", authGenerus_middleware_1.default, message_controller_1.default.getGroupDetail);
router.get("/conversation/:conversationId", authGenerus_middleware_1.default, message_controller_1.default.getConversationById);
// UPDATE GROUP
router.patch("/conversations/group/:conversationId", authGenerus_middleware_1.default, message_controller_1.default.updateGroup);
// DELETE GROUP
router.delete("/conversations/group/:conversationId", authGenerus_middleware_1.default, message_controller_1.default.deleteGroup);
// LEAVE GROUP
router.delete("/conversations/group/:conversationId/leave", authGenerus_middleware_1.default, message_controller_1.default.leaveGroup);
// ADD MEMBER
router.post("/conversations/group/:conversationId/member", authGenerus_middleware_1.default, message_controller_1.default.addMember);
// REMOVE MEMBER
router.delete("/conversations/group/:conversationId/member/:mumiId", authGenerus_middleware_1.default, message_controller_1.default.removeMember);
exports.default = router;
