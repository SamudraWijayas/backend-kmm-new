import { Request, Response, NextFunction } from "express";
import { getUserData } from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";

export default function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token missing" });
  }

  const user = getUserData(token);
  if (!user) {
    return response.unauthorized(res);
  }

  (req as IReqUser).user = user;
  next();
}
