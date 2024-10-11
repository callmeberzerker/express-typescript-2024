import type { NextFunction, Request, Response } from "express";

const user = (
  req: Request & { user: { id: string; username: string } },
  res: Response,
  next: NextFunction
) => {
  // check if the user is authenticated
  // if the user is authenticated, set the user object on the request object
  // if the user is not authenticated, return a status code 401 with a message "Unauthorized"

  if (req.headers.authorization === "Bearer AUTH_TOKEN") {
    req.user = { id: "1", username: "user1" };
    next();
  } else {
    return res.status(401).send("Unauthorized");
  }
};

export default user;
