import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import swaggerUi from "swagger-ui-express";
import basicAuth from "express-basic-auth";
import cookieParser from "cookie-parser";
import csurf from "csurf";

import apiRouter from "./routes";
import swaggerSpec from "./config/swagger";
import logger from "./utils/logger";
import path from "path";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 1000);
const NODE_ENV = process.env.NODE_ENV || "development";

// ---------- Basic Express hardening ----------
app.disable("x-powered-by");
app.set("trust proxy", NODE_ENV === "production" ? "loopback" : false);

// ---------- Parse / Body ----------
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ---------- Security Headers ----------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ---------- Additional Middleware ----------
app.use(compression());
app.use(hpp());

// ---------- CORS ----------
const allowedOriginsRaw = process.env.ALLOWED_ORIGINS || "";
const allowedOrigins = allowedOriginsRaw
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allowed?: boolean) => void
  ) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS policy: This origin is not allowed"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
};

if (allowedOrigins.length === 0) {
  logger.warn("ALLOWED_ORIGINS not set — CORS will reject browser requests.");
  app.use(cors());
} else {
  app.use(cors(corsOptions));
}

// ---------- Rate Limiting ----------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests, please try again later.",
  },
});
// Serve static files (CSS, JS, Images if needed)
app.use(express.static(path.join(__dirname, "../public")));

// Root route - serve index.html
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.use("/api", apiLimiter);

// ---------- Optional: CSRF Protection ----------
if (process.env.ENABLE_CSRF === "true") {
  const csrfProtection = csurf({
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      secure: NODE_ENV === "production",
    },
  });
  app.use(csrfProtection);

  app.get("/api/csrf-token", (req: Request, res: Response) => {
    res.json({ csrfToken: (req as any).csrfToken() });
  });
}

// ---------- Request Logging ----------
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
});

// ---------- Protect Swagger UI ----------
if (NODE_ENV === "production") {
  const swaggerUser = process.env.SWAGGER_USER || "admin";
  const swaggerPass = process.env.SWAGGER_PASSWORD || "changeme";

  app.use(
    "/api-docs",
    basicAuth({
      users: { [swaggerUser]: swaggerPass },
      challenge: true,
    }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { explorer: true })
  );
}

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

// ---------- Routes ----------
app.use("/api", apiRouter);

// ---------- 404 Handler ----------
app.use((req: Request, res: Response) => {
  logger.warn(
    `404 - Route Not Found - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  res.status(404).json({ error: "Not Found" });
});

// ---------- Global Error Handler ----------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(
    `${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );

  if (err instanceof Error && err.message.includes("CORS policy")) {
    return res.status(403).json({ error: "CORS Error: Origin not allowed" });
  }

  res.status(statusCode).json({
    error: message,
    stack: NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  if (NODE_ENV === "development") {
    logger.info(`Swagger docs: http://localhost:${PORT}/api-docs`);
  } else {
    logger.info("Running in production mode");
  }
});

export default app;
