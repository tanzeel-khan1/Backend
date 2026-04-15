const serverless = require("serverless-http");
const app = require("../server");
const connectDB = require("../config/db");

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }

  return serverless(app)(req, res);
};