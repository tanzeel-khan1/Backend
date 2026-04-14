const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  campaignName: {
    type: String,
    required: true,
  },
  client: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "paused", "completed"],
    default: "active",
  },
  budget: Number,
  impressions: Number,
  clicks: Number,
  conversions: Number,
  startDate: Date,
  endDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Campaign", campaignSchema);
