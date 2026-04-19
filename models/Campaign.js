// const mongoose = require("mongoose");

// const campaignSchema = new mongoose.Schema({
//   campaignName: {
//     type: String,
//     required: true,
//   },
//   client: {
//     type: String,
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ["active", "paused", "completed"],
//     default: "active",
//   },
//   budget: Number,
//   impressions: Number,
//   clicks: Number,
//   conversions: Number,
//   startDate: Date,
//   endDate: Date,
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("Campaign", campaignSchema);

const mongoose = require("mongoose");
const { addThirtyDays, getCampaignExpiryDate } = require("../utils/campaignStatus");

const campaignSchema = new mongoose.Schema(
  {
    campaignName: {
      type: String,
      required: true,
      trim: true,
    },
    client: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
      index: true, // ✅ useful for filtering later
    },
    budget: Number,
    spend: Number,
    impressions: Number,
    clicks: Number,
    conversions: Number,
    startDate: Date,
    endDate: Date,
  },
  {
    timestamps: true, // ✅ auto adds createdAt + updatedAt
  }
);

// 🔥 MOST IMPORTANT FIX
campaignSchema.index({ createdAt: -1 });

campaignSchema.pre("save", function syncCampaignDates(next) {
  const baseDate = this.startDate ? new Date(this.startDate) : this.createdAt || new Date();

  if (!this.startDate) {
    this.startDate = baseDate;
  }

  if (!this.endDate) {
    this.endDate = addThirtyDays(baseDate);
  }

  if (this.status !== "completed" && getCampaignExpiryDate(this) <= new Date()) {
    this.status = "completed";
  }

  next();
});

module.exports = mongoose.model("Campaign", campaignSchema);
