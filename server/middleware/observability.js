import { logger } from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Track response finish
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("Request processed", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      latency: `${duration}ms`,
      userId: req.user?.uid || "anonymous",
      ip: req.ip,
      userAgent: req.get("user-agent")
    });
  });

  next();
};

export const globalErrorHandler = (err, req, res, next) => {
  logger.error("Unhandled Exception", {
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    userId: req.user?.uid
  });

  res.status(err.status || 500).json({
    error: "Internal Server Error",
    requestId: req.id // If using a request ID middleware
  });
};
