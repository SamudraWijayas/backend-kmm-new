import { Request, Response, NextFunction } from "express";
import { prisma } from "../libs/prisma";

export default async function maintenanceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // endpoint yang tidak boleh diblok
    if (req.path === "/" || req.path.startsWith("/api/maintenance")) {
      return next();
    }

    const setting = await prisma.setting.findFirst();

    if (setting?.maintenanceMode) {
      return res.status(503).json({
        message: setting.maintenanceMsg || "Server sedang maintenance",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}
