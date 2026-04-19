const connectDB = require("../../config/db");
const Campaign = require("../../models/Campaign");

const allowedOrigins = [
  "http://localhost:3000",
  "https://campaign-dashboard-mauve.vercel.app",
  ...(process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
    : []),
];

const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  if (isAllowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("X-Content-Type-Options", "nosniff");
};

const withTimeout = (promise, ms, message) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);

module.exports = async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await withTimeout(connectDB(), 5000, "Database connection timed out");

    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 20;

    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;

    const campaigns = await withTimeout(
      Campaign.find({})
        .select(
          "campaignName client status budget spend impressions clicks conversions createdAt updatedAt"
        )
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .maxTimeMS(4000)
        .exec(),
      5000,
      "Fetching campaigns timed out"
    );

    return res.status(200).json({
      page,
      limit,
      count: campaigns.length,
      data: campaigns,
    });
  } catch (error) {
    const statusCode =
      error.message.includes("timed out") || error.code === 50 ? 504 : 500;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
};
