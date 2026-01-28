import { Response } from "express";
import { prisma } from "../libs/prisma";
import response from "../utils/response";
import { IReqUser } from "../utils/interfaces";
import * as Yup from "yup";
import { StatusRapor } from "@prisma/client";

// ✅ Validasi input untuk add/update rapor
const raporDTO = Yup.object({
  caberawitId: Yup.number().required("caberawitId wajib diisi"),
  semester: Yup.string()
    .oneOf(["GANJIL", "GENAP"])
    .required("Semester wajib diisi"),
  raporItems: Yup.array()
    .of(
      Yup.object({
        indikatorKelasId: Yup.string().required(),
        kelasJenjangId: Yup.string().required(),
        status: Yup.string().oneOf(["TUNTAS", "TIDAK_TUNTAS"]).nullable(), // optional
        nilaiPengetahuan: Yup.number().nullable(),
        nilaiKeterampilan: Yup.number().nullable(),
      }),
    )
    .required("raporItems wajib diisi"),
});

// ✅ Build rapor sederhana
function buildRapor(rapor: any[]) {
  return rapor.map((r) => ({
    id_indikator: r.indikatorKelas.id,
    indikator: r.indikatorKelas.indikator,
    semester: r.semester,
    status: r.status,
    nilaiPengetahuan: r.nilaiPengetahuan,
    nilaiKeterampilan: r.nilaiKeterampilan,
  }));
}

export default {
  // 🔵 Get rapor caberawit
  async getByCaberawit(req: IReqUser, res: Response) {
    const { caberawitId } = req.params;

    try {
      if (!caberawitId)
        return response.errors(res, null, "caberawitId wajib diisi", 400);

      const rapor = await prisma.raporGenerus.findMany({
        where: { caberawitId: Number(caberawitId) },
        include: { indikatorKelas: true },
        orderBy: { indikatorKelas: { indikator: "asc" } },
      });

      response.success(
        res,
        buildRapor(rapor),
        "✅ Berhasil mengambil rapor caberawit",
      );
    } catch (error) {
      response.error(res, error, "❌ Gagal mengambil rapor caberawit");
    }
  },

  // 🟢 Add / Update rapor (status otomatis)
  async upsert(req: IReqUser, res: Response) {
    try {
      await raporDTO.validate(req.body, { abortEarly: false });

      const { caberawitId, semester, raporItems } = req.body;

      const results = [];

      for (const item of raporItems) {
        const nilai = item.nilaiPengetahuan ?? item.nilaiKeterampilan ?? 0;

        const status: StatusRapor = item.status
          ? (item.status as StatusRapor)
          : nilai > 74
            ? "TUNTAS"
            : "TIDAK_TUNTAS";

        const rapor = await prisma.raporGenerus.upsert({
          where: {
            rapor_unique_caberawit: {
              caberawitId: Number(caberawitId),
              indikatorKelasId: item.indikatorKelasId,
              semester: item.semester || semester,
            },
          },
          update: {
            status,
            nilaiPengetahuan: item.nilaiPengetahuan,
            nilaiKeterampilan: item.nilaiKeterampilan,
          },
          create: {
            caberawitId: Number(caberawitId),
            indikatorKelasId: item.indikatorKelasId,
            kelasJenjangId: item.kelasJenjangId,
            semester: item.semester || semester,
            status,
            nilaiPengetahuan: item.nilaiPengetahuan,
            nilaiKeterampilan: item.nilaiKeterampilan,
          },
        });

        results.push(rapor);
      }

      response.success(
        res,
        results,
        "✅ Berhasil menambahkan/memperbarui rapor caberawit",
      );
    } catch (error) {
      response.error(
        res,
        error,
        "❌ Gagal menambahkan/memperbarui rapor caberawit",
      );
    }
  },
};
