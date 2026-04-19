const serverless = require("serverless-http");
const app = require("../server");
const connectDB = require("../config/db");

const handler = serverless(app);

module.exports = async (req, res) => {
  try {
    await connectDB();
    return handler(req, res);
  } catch (error) {
    console.error("Server error:", error);

    return res.status(503).json({
      message: "Database unavailable",
      error: error.message,
    });
  }
};
