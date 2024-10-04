import cors from "cors";
import express, { type Express } from "express";
import { pino } from "pino";

import { ENV } from "@/common/utils/env";
import { createEndpointRateLimiter } from "@/common/utils/rate-limiter";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));

// Routes

// Apply rate limiting to the /one endpoint
const oneEndpointLimiter = createEndpointRateLimiter({
  maxRequests: 5,
});

app.use("/one", oneEndpointLimiter, (req, res) => {
  res.send({ msg: "one" });
});

app.post("/two", async (req, res) => {
  res.send({ msg: "two" });
});

export { app, logger };
