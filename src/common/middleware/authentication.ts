import { ENV } from "@/common/utils/env";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const user = (
  req: Request & { user: { id: string; username: string } },
  res: Response,
  next: NextFunction
) => {
  // check if the user is authenticated
  // if the user is authenticated, set the user object on the request object
  // if the user is not authenticated, return a status code 403 with a message "Unauthorized"

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, ENV.JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export default user;
