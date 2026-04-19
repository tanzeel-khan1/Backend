const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const REQUEST_TIMEOUT_MS = 10000;

app.disable("x-powered-by");
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",
  "https://campaign-dashboard-mauve.vercel.app",
  ...(process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
    : []),
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  if (isAllowedOrigin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") {
    if (isAllowedOrigin || !origin) {
      return res.sendStatus(204);
    }

    return res.status(403).json({ message: "CORS not allowed for this origin" });
  }

  return next();
});

app.use((req, res, next) => {
  req.timedout = false;

  const timeoutId = setTimeout(() => {
    req.timedout = true;

    if (!res.headersSent) {
      res.status(504).json({
        message: "Request timed out after 10 seconds",
      });
    }
  }, REQUEST_TIMEOUT_MS);

  const clear = () => clearTimeout(timeoutId);
  res.on("finish", clear);
  res.on("close", clear);

  return next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/campaigns", require("./routes/campaignRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

app.get("/", (req, res) => {
  return res.send("API is running 🚀");
});

app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  const connectDB = require("./config/db");

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
