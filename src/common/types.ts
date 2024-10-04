import type { Request } from "express";

export type RequestWithUser = Request & {
  user?: { id: string; username: string };
};
