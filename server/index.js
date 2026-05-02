import "./config/trace.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

import { PORT, NODE_ENV, ALLOWED_ORIGIN } from "./config/constants.js";
import { logger } from "./utils/logger.js";
import { verifyToken } from "./middleware/auth.js";
import { requestLogger, globalErrorHandler } from "./middleware/observability.js";
import chatRouter from "./routes/chat.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "../dist");

// --- 🛡️ SECURITY ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "https://www.gstatic.com", "https://apis.google.com"],
      "connect-src": ["'self'", "https://generativelanguage.googleapis.com", "https://*.firebaseio.com", "https://*.googleapis.com"]
    }
  }
}));

app.use(cors({
  origin: NODE_ENV === "production" ? ALLOWED_ORIGIN : "*",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: "10kb" }));

// --- 📊 OBSERVABILITY ---
app.use(requestLogger);

// --- 🚀 STATIC & API ---
app.use(express.static(distPath));

// Health Check
app.get("/health", (req, res) => res.status(200).json({ status: "healthy", uptime: process.uptime() }));

// Protected API
app.use("/api/v1", verifyToken, chatRouter);

// SPA Fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// --- 🚨 ERROR HANDLING ---
app.use(globalErrorHandler);

// --- ⚡ STARTUP ---
const server = app.listen(PORT, () => {
  logger.info("Production Server Started", { port: PORT, env: NODE_ENV });
});

const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down...`);
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
