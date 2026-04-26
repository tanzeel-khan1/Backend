// const connectDB = require("../../config/db");
// const Campaign = require("../../models/Campaign");
// const { addThirtyDays } = require("../../utils/campaignStatus");

// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://campaign-dashboard-mauve.vercel.app",
//   ...(process.env.CORS_ORIGINS
//     ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
//     : []),
// ];

// const setCorsHeaders = (req, res) => {
//   const origin = req.headers.origin;
//   const isAllowedOrigin = origin && allowedOrigins.includes(origin);

//   if (isAllowedOrigin) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//     res.setHeader("Vary", "Origin");
//     res.setHeader("Access-Control-Allow-Credentials", "true");
//   }

//   res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.setHeader("X-Content-Type-Options", "nosniff");
// };

// const withTimeout = (promise, ms, message) =>
//   Promise.race([
//     promise,
//     new Promise((_, reject) => {
//       setTimeout(() => reject(new Error(message)), ms);
//     }),
//   ]);

// const readJsonBody = async (req) => {
//   if (req.body && typeof req.body === "object") {
//     return req.body;
//   }

//   if (typeof req.body === "string" && req.body.trim()) {
//     return JSON.parse(req.body);
//   }

//   const chunks = [];

//   for await (const chunk of req) {
//     chunks.push(chunk);
//   }

//   if (!chunks.length) {
//     return {};
//   }

//   return JSON.parse(Buffer.concat(chunks).toString("utf8"));
// };

// const toOptionalNumber = (value) => {
//   if (value === undefined || value === null || value === "") {
//     return undefined;
//   }

//   const parsed = Number(value);
//   return Number.isFinite(parsed) ? parsed : undefined;
// };

// const toOptionalDate = (value) => {
//   if (!value) {
//     return undefined;
//   }

//   const parsed = new Date(value);
//   return Number.isNaN(parsed.getTime()) ? undefined : parsed;
// };

// module.exports = async (req, res) => {
//   setCorsHeaders(req, res);

//   if (req.method === "OPTIONS") {
//     return res.status(204).end();
//   }

//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   try {
//     const body = await readJsonBody(req);
//     const campaignName = typeof body.campaignName === "string" ? body.campaignName.trim() : "";
//     const client = typeof body.client === "string" ? body.client.trim() : "";
//     const status =
//       body.status && ["active", "paused", "completed"].includes(body.status)
//         ? body.status
//         : "active";

//     if (!campaignName || !client) {
//       return res.status(400).json({
//         message: "campaignName and client are required",
//       });
//     }

//     await withTimeout(connectDB(), 5000, "Database connection timed out");

//     const payload = {
//       campaignName,
//       client,
//       status,
//       budget: toOptionalNumber(body.budget),
//       spend: toOptionalNumber(body.spend),
//       impressions: toOptionalNumber(body.impressions),
//       clicks: toOptionalNumber(body.clicks),
//       conversions: toOptionalNumber(body.conversions),
//       startDate: toOptionalDate(body.startDate),
//       endDate: toOptionalDate(body.endDate),
//     };

//     if (!payload.startDate) {
//       payload.startDate = new Date();
//     }

//     if (!payload.endDate) {
//       payload.endDate = addThirtyDays(payload.startDate);
//     }

//     const campaign = await withTimeout(
//       Campaign.create(payload),
//       5000,
//       "Creating campaign timed out"
//     );

//     return res.status(201).json({
//       message: "Campaign created fully",
//       data: campaign,
//     });
//   } catch (error) {
//     const isTimeout = error.message.includes("timed out");
//     const isBadJson = error instanceof SyntaxError;
//     console.error("Error processing request:", error);

//     return res.status(isBadJson ? 400 : isTimeout ? 504 : 500).json({
//       message: isBadJson ? "Invalid JSON body" : error.message,
//     });
//   }
// };
const connectDB = require("../../config/db");
const Campaign = require("../../models/Campaign");
const { addThirtyDays } = require("../../utils/campaignStatus");

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

  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
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

const readJsonBody = async (req) => {
  if (req.body && typeof req.body === "object") return req.body;

  if (typeof req.body === "string" && req.body.trim()) {
    return JSON.parse(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) return {};

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const toOptionalNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toOptionalDate = (value) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

module.exports = async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // ✅ Load faker only in development (ESM safe)
    let faker;
    if (process.env.NODE_ENV !== "production") {
      const fakerModule = await import("@faker-js/faker");
      faker = fakerModule.faker;
    }

    const body = await readJsonBody(req);

    const campaignName =
      typeof body.campaignName === "string" ? body.campaignName.trim() : "";
    const client =
      typeof body.client === "string" ? body.client.trim() : "";

    const status =
      body.status && ["active", "paused", "completed"].includes(body.status)
        ? body.status
        : "active";

    if (!campaignName || !client) {
      return res.status(400).json({
        message: "campaignName and client are required",
      });
    }

    await withTimeout(connectDB(), 5000, "Database connection timed out");

    // Base numbers
    let budget = toOptionalNumber(body.budget);
    let spend = toOptionalNumber(body.spend);
    let impressions = toOptionalNumber(body.impressions);
    let clicks = toOptionalNumber(body.clicks);
    let conversions = toOptionalNumber(body.conversions);

    // ✅ Dev mode fake generation
    if (process.env.NODE_ENV !== "production") {
      budget ??= faker.number.int({ min: 5000, max: 100000 });
      spend ??= faker.number.int({ min: 1000, max: budget });
      impressions ??= faker.number.int({ min: 10000, max: 5000000 });
      clicks ??= faker.number.int({ min: 100, max: impressions });
      conversions ??= faker.number.int({ min: 10, max: clicks });
    } else {
      // Production fallback
      budget ??= 0;
      spend ??= 0;
      impressions ??= 0;
      clicks ??= 0;
      conversions ??= 0;
    }

    const startDate = toOptionalDate(body.startDate) ?? new Date();
    const endDate =
      toOptionalDate(body.endDate) ?? addThirtyDays(startDate);

    const payload = {
      campaignName,
      client,
      status,
      budget,
      spend,
      impressions,
      clicks,
      conversions,
      startDate,
      endDate,
    };

    const campaign = await withTimeout(
      Campaign.create(payload),
      5000,
      "Creating campaign timed out"
    );

    return res.status(201).json({
      message: "Campaign created successfully",
      data: campaign,
    });
  } catch (error) {
    const isTimeout = error.message.includes("timed out");
    const isBadJson = error instanceof SyntaxError;

    console.error("Error processing request:", error);

    return res.status(isBadJson ? 400 : isTimeout ? 504 : 500).json({
      message: isBadJson ? "Invalid JSON body" : error.message,
    });
  }
};