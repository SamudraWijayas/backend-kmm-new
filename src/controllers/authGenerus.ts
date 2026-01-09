import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqMumi } from "../utils/interfaces";
import * as Yup from "yup";
import { generateMumiToken } from "../utils/jwt"; // pastikan ini ada

// ✅ Validasi login
const loginDTO = Yup.object({
  identifier: Yup.string().required("Nama wajib diisi"),
  password: Yup.string().required("Password wajib diisi"),
});

export default {
  // 🔐 Login Generus
  async loginGenerus(req: IReqMumi, res: Response) {
    try {
      const { identifier, password } = req.body;

      // ⚠️ password boleh kosong
      if (!identifier) {
        return response.notFound(res, "Identifier wajib diisi");
      }

      const generus = await prisma.mumi.findFirst({
        where: {
          nama: identifier,
        },
      });

      if (!generus)
        return response.unauthorized(res, "Akun generus tidak terdaftar");

      // 🔑 jika password tidak ada → pakai tgl lahir
      let finalPassword = password;

      if (!password) {
        const tgl = new Date(generus.tgl_lahir);
        const yyyy = tgl.getFullYear();
        const mm = String(tgl.getMonth() + 1).padStart(2, "0");
        const dd = String(tgl.getDate()).padStart(2, "0");

        finalPassword = `${yyyy}${mm}${dd}`;
      }

      // 🔒 validasi password (dibandingkan dengan tgl lahir)
      const tgl = new Date(generus.tgl_lahir);
      const realPassword = `${tgl.getFullYear()}${String(
        tgl.getMonth() + 1
      ).padStart(2, "0")}${String(tgl.getDate()).padStart(2, "0")}`;

      if (finalPassword !== realPassword)
        return response.unauthorized(res, "Password Salah");

      const token = generateMumiToken({
        id: generus.id,
        nama: generus.nama,
        kelompokId: generus.kelompokId,
        desaId: generus.desaId,
        daerahId: generus.daerahId,
        jenjangId: generus.jenjangId,
      });

      response.success(res, token, "Login generus success");
    } catch (error) {
      response.error(res, error, "Login generus failed");
    }
  },

  async meGenerus(req: IReqMumi, res: Response) {
    try {
      const generus = await prisma.mumi.findUnique({
        where: { id: req.user?.id },
      });
      response.success(res, generus, "success get user profile");
    } catch (error) {
      response.error(res, error, "failed get user profile");
    }
  },
};
