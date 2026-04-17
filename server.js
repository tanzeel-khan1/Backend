const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ✅ Allowed Origins (env + defaults)
const allowedOrigins = [
  "http://localhost:3000",
  "https://campaign-dashboard-mauve.vercel.app",
  ...(process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
    : [])
];

// ✅ Production-safe CORS middleware (sets headers on every response)
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

  // Fast preflight response
  if (req.method === "OPTIONS") {
    if (isAllowedOrigin || !origin) {
      return res.sendStatus(204);
    }
    return res.status(403).json({ message: "CORS not allowed for this origin" });
  }

  return next();
});

// ✅ Body parser
app.use(express.json());

// ✅ Routes
app.use("/api/campaigns", require("./routes/campaignRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ✅ Not found handler (helps debug wrong routes)
app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  return res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;

// ✅ Local server only
if (process.env.NODE_ENV !== "production") {
  const connectDB = require("./config/db");

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

// ✅ Export for Vercel
module.exports = app;