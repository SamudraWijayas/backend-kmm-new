import { prisma } from "../libs/prisma";
import { Response } from "express";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";

export const toggleMaintenance = async (req: IReqUser, res: Response) => {
  const { status, message } = req.body;

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {
      maintenanceMode: status,
      maintenanceMsg: message,
    },
    create: {
      id: 1,
      maintenanceMode: status,
      maintenanceMsg: message,
    },
  });

  response.success(res, null, "Maintenance updated");
};

export const getMaintenance = async (req: any, res: any) => {
  const setting = await prisma.setting.findFirst();

  res.json({
    maintenanceMode: setting?.maintenanceMode ?? false,
  });
};
