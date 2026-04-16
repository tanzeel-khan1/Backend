// const serverless = require("serverless-http");
// const app = require("../server");
// const connectDB = require("../config/db");

// let isConnected = false;

// module.exports = async (req, res) => {
//   if (!isConnected) {
//     await connectDB();
//     isConnected = true;
//   }

//   return serverless(app)(req, res);
// };
const serverless = require("serverless-http");
const app = require("../server");
const connectDB = require("../config/db");

let dbReady = false;

module.exports = async (req, res) => {
  try {
    if (!dbReady) {
      await connectDB();
      dbReady = true;
    }
  } catch (error) {
    // Ensure frontend still receives a readable response instead of function crash.
    const allowedOrigins = [
      "http://localhost:3000",
      "https://campaign-dashboard-mauve.vercel.app",
      ...(process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
        : [])
    ];
    const requestOrigin = req.headers.origin;
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.setHeader("Access-Control-Allow-Origin", requestOrigin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    return res.status(503).json({
      message: "Database unavailable. Check MongoDB Atlas Network Access/IP whitelist."
    });
  }

  return serverless(app)(req, res);
};