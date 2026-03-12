import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { clerkMiddleware } from "@clerk/express";
import { registerRoutes } from "./routes";
import { globalRateLimiter } from "./middleware/rateLimiter";
import { logger } from "./logger";

const app = express();

// --- Security headers (must be first) ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://clerk.com", "https://*.clerk.accounts.dev"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.open-meteo.com", "https://air-quality-api.open-meteo.com", "https://geocoding-api.open-meteo.com", "https://clerk.com", "https://*.clerk.accounts.dev"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for Clerk
}));

// --- CORS ---
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5000", "http://localhost:3000"];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// --- Compression ---
app.use(compression());

// --- Auth middleware ---
app.use(clerkMiddleware());

// --- Global rate limiter ---
app.use(globalRateLimiter);

// --- Body parsing with size limit ---
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}
app.use(express.json({
  limit: "100kb",
  verify: (req, _res, buf) => { req.rawBody = buf; },
}));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

// --- Structured request logging ---
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      logger.info("http_request", {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Date.now() - start,
        ip: req.ip,
      });
    }
  });
  next();
});

// --- Health check (before other routes) ---
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), ts: new Date().toISOString() });
});

// --- Register API routes ---
registerRoutes(app);

// --- Error handler ---
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" && status === 500
    ? "Internal Server Error"
    : err.message || "Internal Server Error";
  logger.error("unhandled_error", { status, message: err.message, stack: err.stack });
  res.status(status).json({ message });
});

export default app;
