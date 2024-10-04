import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import rateLimiter from "@/common/middleware/rateLimiter";
import { ENV } from "@/common/utils/env";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Routes

app.use("/one", (req, res) => {
  res.send(" World");
});

export { app, logger };
