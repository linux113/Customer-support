require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const ticketRoutes = require("./routes/ticketRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const isProd = process.env.NODE_ENV === "production";
const isVercel = Boolean(process.env.VERCEL);
const frontendUrl = (process.env.FRONTEND_URL || "").trim();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    frameguard: { action: isProd ? "sameorigin" : "sameorigin" },
    hsts: isProd ? { maxAge: 15552000, includeSubDomains: true } : false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

function resolveCorsOrigin() {
  if (!isProd) return true;
  if (isVercel && !frontendUrl) return true;
  if (!frontendUrl || frontendUrl === "*") {
    console.warn("[cors] FRONTEND_URL is open or missing. Set it to your app origin.");
    return isVercel ? true : false;
  }
  return frontendUrl.split(",").map((value) => value.trim()).filter(Boolean);
}

app.use(
  cors({
    origin: resolveCorsOrigin(),
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Write-Key"],
    maxAge: 600,
  })
);

app.use(express.json({ limit: "32kb" }));

const readLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too Many Requests",
    message: "Slow down a little and try again in a minute.",
  },
});

const writeLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too Many Requests",
    message: "Too many writes. Please wait a minute.",
  },
});

app.use("/api", (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    return writeLimit(req, res, next);
  }
  return readLimit(req, res, next);
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "ganesh-support-crm",
    time: new Date().toISOString(),
  });
});

app.use("/api/tickets", ticketRoutes);

const frontendDist = path.join(__dirname, "../../frontend/dist");
if (!isVercel && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
