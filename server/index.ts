import { createServer } from "http";
import { setupVite, serveStatic } from "./vite";
import { logger } from "./logger";
import app from "./app";

(async () => {
  const server = createServer(app);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    logger.info("server_started", { port, env: process.env.NODE_ENV || "development" });
  });

  const shutdown = () => {
    logger.info("graceful_shutdown_initiated");
    server.close(() => {
      logger.info("server_closed");
      process.exit(0);
    });
    setTimeout(() => {
      logger.error("shutdown_timeout_forced_exit");
      process.exit(1);
    }, 10000);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
})();
