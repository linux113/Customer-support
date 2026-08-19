require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const ticketRoutes = require("./routes/ticketRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { ensurePostgresSchema } = require("./db/connection");
const { seedIfEmpty } = require("./db/seed");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const frontendUrl = process.env.FRONTEND_URL || "*";

const corsOrigin =
  frontendUrl === "*"
    ? true
    : frontendUrl.split(",").map((value) => value.trim());

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    frameguard: false,
  })
);
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "ALLOWALL");
  next();
});

app.use(
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "100kb" }));

app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: 180,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too Many Requests",
      message: "Slow down a little and try again in a minute.",
    },
  })
);

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "datastraw-support-crm",
    time: new Date().toISOString(),
  });
});

app.use("/api/tickets", ticketRoutes);

const frontendDist = path.join(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await ensurePostgresSchema();
    await seedIfEmpty();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Datastraw CRM API listening on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();

module.exports = app;
