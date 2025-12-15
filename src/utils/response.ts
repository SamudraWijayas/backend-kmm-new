import { Response } from "express";
import * as Yup from "yup";
import { Prisma } from "@prisma/client";

type Pagination = {
  totalPages: number;
  current: number;
  total: number;
};

type Total = {
  total: number;
};

export default {
  success(res: Response, data: any, message: string) {
    res.status(200).json({
      meta: {
        status: 200,
        message,
      },
      data,
    });
  },

  sukses(res: Response, data: any[], total: Total, message: string) {
    res.status(200).json({
      meta: {
        status: 200,
        message,
      },
      data,
      total,
    });
  },

  error(res: Response, error: unknown, message: string) {
    // ✅ Validasi error dari Yup
    if (error instanceof Yup.ValidationError) {
      return res.status(400).json({
        meta: { status: 400, message },
        data: { [`${error.path}`]: error.errors[0] },
      });
    }

    // ✅ Error spesifik dari Prisma (misalnya unique constraint, foreign key, dll)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({
        meta: {
          status: 400,
          message: error.message,
        },
        data: error.meta,
      });
    }

    // ✅ Fallback untuk error biasa
    res.status(500).json({
      meta: {
        status: 500,
        message: message || "Server error",
      },
      data: error,
    });
  },

  notFound(res: Response, message: string = "not found") {
    res.status(404).json({
      meta: { status: 404, message },
      data: null,
    });
  },

  unauthorized(res: Response, message: string = "unauthorized") {
    res.status(403).json({
      meta: { status: 403, message },
      data: null,
    });
  },

  pagination(
    res: Response,
    data: any[],
    pagination: Pagination,
    message: string
  ) {
    res.status(200).json({
      meta: { status: 200, message },
      data,
      pagination,
    });
  },

  conflict(res: Response, message: string = "conflict") {
    res.status(409).json({
      meta: { status: 409, message },
      data: null,
    });
  },

  errors(res: Response, error: unknown, message: string, status = 500) {
    if (error instanceof Yup.ValidationError) {
      return res.status(400).json({
        meta: { status: 400, message },
        data: { [`${error.path}`]: error.errors[0] },
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({
        meta: { status: 400, message: error.message },
        data: error.meta,
      });
    }

    return res.status(status).json({
      meta: { status, message },
      data: error,
    });
  },
};
