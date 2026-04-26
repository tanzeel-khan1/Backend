const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

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
  analytics: {
    clicks: Number,
    impressions: Number,
    conversions: Number,
    ctr: Number,
    cpc: Number,
  },
  startDate: Date,
  endDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

campaignSchema.pre("save", function () {
  if (this.budget == null) {
    this.budget = faker.number.int({ min: 5000, max: 100000 });
  }

  if (this.spend == null) {
    this.spend = faker.number.int({ min: 1000, max: 90000 });
  }

  if (this.impressions == null) {
    this.impressions = faker.number.int({ min: 10000, max: 5000000 });
  }

  if (this.clicks == null) {
    this.clicks = faker.number.int({ min: 100, max: 50000 });
  }

  if (this.conversions == null) {
    this.conversions = faker.number.int({ min: 10, max: 5000 });
  }

  if (!this.startDate) {
    this.startDate = this.createdAt || new Date();
  }

  if (!this.endDate) {
    this.endDate = new Date(this.startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  const impressions = this.impressions || 1;
  const clicks = this.clicks || 1;

  if (!this.analytics || Object.keys(this.analytics).length === 0) {
    this.analytics = {
      clicks: this.clicks,
      impressions: this.impressions,
      conversions: this.conversions,
      ctr: Number(((clicks / impressions) * 100).toFixed(2)),
      cpc: Number((this.spend / Math.max(clicks, 1)).toFixed(2)),
    };
  }
});

module.exports = mongoose.model("Campaign", campaignSchema);

// const mongoose = require("mongoose");
// const { addThirtyDays, getCampaignExpiryDate } = require("../utils/campaignStatus");

// const campaignSchema = new mongoose.Schema(
//   {
//     campaignName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     client: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     status: {
//       type: String,
//       enum: ["active", "paused", "completed"],
//       default: "active",
//       index: true, // ✅ useful for filtering later
//     },
//     budget: Number,
//     spend: Number,
//     impressions: Number,
//     clicks: Number,
//     conversions: Number,
//     startDate: Date,
//     endDate: Date,
//   },
//   {
//     timestamps: true, // ✅ auto adds createdAt + updatedAt
//   }
// );

// // 🔥 MOST IMPORTANT FIX
// campaignSchema.index({ createdAt: -1 });

// campaignSchema.pre("save", function syncCampaignDates(next) {
//   const baseDate = this.startDate ? new Date(this.startDate) : this.createdAt || new Date();

//   if (!this.startDate) {
//     this.startDate = baseDate;
//   }

//   if (!this.endDate) {
//     this.endDate = addThirtyDays(baseDate);
//   }

//   if (this.status !== "completed" && getCampaignExpiryDate(this) <= new Date()) {
//     this.status = "completed";
//   }

//   next();
// });

// module.exports = mongoose.model("Campaign", campaignSchema);
