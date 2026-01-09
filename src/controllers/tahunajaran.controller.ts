import { Request, Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import * as Yup from "yup";

const tahunAjaranDTO = Yup.object({
  name: Yup.string().required("Nama tahun ajaran wajib diisi"),
});

export default {
  async add(req: Request, res: Response) {
    try {
      const payload = await tahunAjaranDTO.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const existing = await prisma.tahunAjaran.findFirst({
        where: { name: payload.name },
      });
      if (existing) return response.conflict(res, "Tahun ajaran sudah ada");

      const tahun = await prisma.tahunAjaran.create({
        data: { name: payload.name },
      });
      return response.success(res, tahun, "Berhasil menambahkan tahun ajaran");
    } catch (error) {
      response.error(res, error, "Gagal menambahkan tahun ajaran");
    }
  },

  async findAll(req: Request, res: Response) {
    try {
      const tahunList = await prisma.tahunAjaran.findMany({
        orderBy: { name: "desc" },
      });
      return response.success(
        res,
        tahunList,
        "Berhasil mengambil semua tahun ajaran"
      );
    } catch (error) {
      response.error(res, error, "Gagal mengambil tahun ajaran");
    }
  },
};
