import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqMumi } from "../utils/interfaces";
import * as Yup from "yup";
import { generateMumiToken } from "../utils/jwt"; // pastikan ini ada
import { encrypt } from "../utils/encryption";
import { userUpdatePasswordDTO } from "../models/user.model";

// ✅ Validasi login
const loginDTO = Yup.object({
  identifier: Yup.string().required("Nama wajib diisi"),
  password: Yup.string().required("Password wajib diisi"),
});

const validatePassword = Yup.string()
  .required("Password wajib diisi")
  .min(6, "Password minimal 6 karakter")
  .test(
    "at-least-one-uppercase-letter",
    "Password harus mengandung minimal 1 huruf besar",
    (value) => !!value && /[A-Z]/.test(value),
  )
  .test(
    "at-least-one-number",
    "Password harus mengandung minimal 1 angka",
    (value) => !!value && /\d/.test(value),
  );

const validateConfirmPassword = Yup.string()
  .required()
  .oneOf([Yup.ref("password"), ""], "Password tidak sama");

const setPasswordFirstTimeDTO = Yup.object({
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
});

export default {
  // 🔐 Login Generus
  async loginGenerus(req: IReqMumi, res: Response) {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password)
        return response.notFound(res, "Identifier dan password wajib diisi");

      const generus = await prisma.mumi.findFirst({
        where: {
          nama: identifier,
        },
      });

      if (!generus)
        return response.unauthorized(res, "Akun generus tidak terdaftar");

      let isValid = false;

      // =====================================
      // 🔐 Jika BELUM punya password
      // =====================================
      if (generus.hasPassword === false) {
        const tgl = new Date(generus.tgl_lahir);
        const defaultPassword = `${tgl.getFullYear()}${String(
          tgl.getMonth() + 1,
        ).padStart(2, "0")}${String(tgl.getDate()).padStart(2, "0")}`;

        isValid = password === defaultPassword;
      }

      // =====================================
      // 🔐 Jika SUDAH punya password
      // =====================================
      if (generus.hasPassword === true) {
        if (!generus.password)
          return response.unauthorized(res, "Password belum diset");

        isValid = generus.password === encrypt(password);
      }

      if (!isValid) return response.unauthorized(res, "Password Salah");

      // =====================================
      // 🎟 Generate Token
      // =====================================
      const token = generateMumiToken({
        id: generus.id,
        nama: generus.nama,
        kelompokId: generus.kelompokId,
        desaId: generus.desaId,
        daerahId: generus.daerahId,
        jenjangId: generus.jenjangId,
        mahasiswa: Boolean(generus.mahasiswa),
        tgl_lahir: generus.tgl_lahir.toISOString(),
      });

      return response.success(res, token, "Login generus success");
    } catch (error) {
      return response.error(res, error, "Login generus failed");
    }
  },
  async updateProfile(req: IReqMumi, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return response.unauthorized(res, "Unauthorized");
      }

      const {
        nama,
        daerahId,
        desaId,
        kelompokId,
        jenjangId,
        kelasJenjangId,
        tgl_lahir,
        jenis_kelamin,
        gol_darah,
        nama_ortu,
        mahasiswa,
        foto,
      } = req.body;

      const result = await prisma.mumi.update({
        where: { id: userId },
        data: {
          ...(nama && { nama }),
          ...(jenis_kelamin && { jenis_kelamin }),
          ...(gol_darah && { gol_darah }),
          ...(nama_ortu && { nama_ortu }),
          ...(foto && { foto }),

          ...(typeof mahasiswa === "boolean" && { mahasiswa }),

          ...(tgl_lahir && {
            tgl_lahir: new Date(tgl_lahir),
          }),

          ...(daerahId && {
            daerah: { connect: { id: daerahId } },
          }),

          ...(desaId && {
            desa: { connect: { id: desaId } },
          }),

          ...(kelompokId && {
            kelompok: { connect: { id: kelompokId } },
          }),

          ...(jenjangId && {
            jenjang: { connect: { id: jenjangId } },
          }),

          ...(kelasJenjangId && {
            kelasJenjang: { connect: { id: kelasJenjangId } },
          }),
        },
      });

      response.success(res, result, "success to update profile");
    } catch (error: any) {
      console.error("UPDATE PROFILE ERROR:", error);

      if (error.code === "P2025") {
        return response.notFound(res, "user not found");
      }

      response.error(res, error, "failed to update profile");
    }
  },
  async setPasswordFirstTime(req: IReqMumi, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return response.unauthorized(res, "Unauthorized");
      }

      await setPasswordFirstTimeDTO.validate(req.body);

      const { password } = req.body;

      const generus = await prisma.mumi.findUnique({
        where: { id: userId },
        select: {
          id: true,
          password: true,
        },
      });

      if (!generus) {
        return response.notFound(res, "User tidak ditemukan");
      }

      // ❌ sudah pernah set password
      if (generus.password) {
        return response.notFound(
          res,
          "Password sudah pernah disetel, gunakan fitur ganti password",
        );
      }

      await prisma.mumi.update({
        where: { id: userId },
        data: {
          password: encrypt(password),
          hasPassword: true,
        },
      });

      response.success(res, null, "Password berhasil disetel");
    } catch (error) {
      response.error(res, error, "Gagal menyetel password");
    }
  },
  async updatePassword(req: IReqMumi, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return response.unauthorized(res, "Unauthorized");
      }

      const { oldPassword, password, confirmPassword } = req.body;

      await userUpdatePasswordDTO.validate({
        oldPassword,
        password,
        confirmPassword,
      });

      const mumi = await prisma.mumi.findUnique({
        where: { id: userId },
      });

      if (!mumi) {
        return response.notFound(res, "Mumi not found");
      }

      if (mumi.password !== encrypt(oldPassword)) {
        return response.badRequest(res, "Password lama salah");
      }

      const updatedUser = await prisma.mumi.update({
        where: { id: userId },
        data: { password: encrypt(password) },
      });

      return response.success(res, updatedUser, "Password berhasil diubah");
    } catch (error) {
      return response.error(res, error, "Gagal ubah password");
    }
  },
  async meGenerus(req: IReqMumi, res: Response) {
    try {
      const generus = await prisma.mumi.findUnique({
        where: { id: req.user?.id },
        select: {
          id: true,
          nama: true,
          foto: true,
          gol_darah: true,
          jenis_kelamin: true,
          tgl_lahir: true,
          nama_ortu: true,
          mahasiswa: true,
          jenjangId: true,
          daerahId: true,
          desaId: true,
          kelompokId: true,
          createdAt: true,
          updatedAt: true,

          daerah: true,
          desa: true,
          kelompok: true,
          jenjang: true,
          hasPassword: true,

          // ❌ password tidak ada di sini
        },
      });

      response.success(res, generus, "success get user profile");
    } catch (error) {
      response.error(res, error, "failed get user profile");
    }
  },
};
