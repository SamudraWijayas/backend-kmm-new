  import { Request, Response, NextFunction } from "express";
  import { getMumiData } from "../utils/jwt";
  import { IReqMumi } from "../utils/interfaces";
  import response from "../utils/response";

  export default function authGenerus(req: Request, res: Response, next: NextFunction) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing" });
    }

    const user = getMumiData(token);
    if (!user) {
      return response.unauthorized(res);
    }

    (req as IReqMumi).user = user;
    next();
  }
