const Campaign = require("../models/Campaign");
const mongoose = require("mongoose");
const {
  addThirtyDays,
  applyCompletedStatus,
  buildExpiredCampaignFilter,
} = require("../utils/campaignStatus");

const respondJson = (req, res, statusCode, payload) => {
  if (req?.timedout || res.headersSent) {
    return;
  }

  return res.status(statusCode).json(payload);
};

const withTimeout = (promise, ms, message = "Operation timed out", statusCode = 504) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        const error = new Error(message);
        error.status = statusCode;
        reject(error);
      }, ms);
    }),
  ]);

exports.createCampaign = async (req, res) => {
  try {
    const { faker } = await import("@faker-js/faker");

    const {
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
    } = req.body;

    if (!campaignName || !client) {
      return respondJson(req, res, 400, {
        message: "campaignName and client are required",
      });
    }

    const campaignData = {
      campaignName,
      client,
      status: status || "active",
      budget: budget || faker.number.int({ min: 5000, max: 100000 }),
      spend: spend || faker.number.int({ min: 1000, max: 90000 }),
      impressions: impressions || faker.number.int({ min: 10000, max: 5000000 }),
      clicks: clicks || faker.number.int({ min: 100, max: 50000 }),
      conversions: conversions || faker.number.int({ min: 10, max: 5000 }),
      startDate: startDate || faker.date.past(),
      endDate: endDate || faker.date.future(),
    };

    if (!campaignData.endDate) {
      campaignData.endDate = addThirtyDays(new Date(campaignData.startDate));
    }

    const campaign = await Campaign.create(campaignData);

    return respondJson(req, res, 201, {
      message: "Campaign created successfully",
      data: campaign,
    });
  } catch (error) {
    return respondJson(req, res, error.status || 500, { message: error.message });
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    await Campaign.updateMany(buildExpiredCampaignFilter(), {
      $set: { status: "completed" },
    });

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
        // `_id` is indexed by default in MongoDB, which avoids expensive
        // sorts if the `createdAt` index is not present in production yet.
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .maxTimeMS(8000)
        .exec(),
      9000,
      "Fetching campaigns timed out after 9 seconds",
      504
    );

    return respondJson(req, res, 200, {
      page,
      limit,
      count: campaigns.length,
      data: campaigns.map((campaign) => applyCompletedStatus(campaign)),
    });
  } catch (error) {
    const isTimeout = error?.code === 50 || error?.status === 504;

    return respondJson(req, res, isTimeout ? 504 : 500, {
      message: isTimeout
        ? error.message || "Database query timed out. Please try again."
        : error.message,
    });
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return respondJson(req, res, 400, { message: "Invalid campaign ID" });
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return respondJson(req, res, 404, { message: "Campaign not found" });
    }

    if (campaign.status !== "completed" && applyCompletedStatus(campaign.toObject()).status === "completed") {
      campaign.status = "completed";
      if (!campaign.endDate) {
        campaign.endDate = addThirtyDays(campaign.startDate || campaign.createdAt || new Date());
      }
      await campaign.save();
    }

    return respondJson(req, res, 200, campaign);
  } catch (error) {
    return respondJson(req, res, error.status || 500, { message: error.message });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return respondJson(req, res, 400, { message: "Invalid campaign ID" });
    }

    const campaign = await Campaign.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!campaign) {
      return respondJson(req, res, 404, { message: "Campaign not found" });
    }

    return respondJson(req, res, 200, campaign);
  } catch (error) {
    return respondJson(req, res, error.status || 500, { message: error.message });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return respondJson(req, res, 400, { message: "Invalid campaign ID" });
    }

    const campaign = await Campaign.findByIdAndDelete(id);

    if (!campaign) {
      return respondJson(req, res, 404, { message: "Campaign not found" });
    }

    return respondJson(req, res, 200, { message: "Campaign deleted successfully" });
  } catch (error) {
    return respondJson(req, res, error.status || 500, { message: error.message });
  }
};

exports.generateDummyCampaigns = async (req, res) => {
  try {
    const { faker } = await import("@faker-js/faker");
    const requestedCount = Number(req.query.count);
    const count = Number.isFinite(requestedCount)
      ? Math.min(Math.max(requestedCount, 1), 100)
      : 10;

    const campaigns = [];

    for (let i = 0; i < count; i += 1) {
      campaigns.push({
        campaignName: faker.company.catchPhrase(),
        client: faker.company.name(),
        status: faker.helpers.arrayElement(["active", "paused", "completed"]),
        budget: faker.number.int({ min: 5000, max: 100000 }),
        spend: faker.number.int({ min: 1000, max: 90000 }),
        impressions: faker.number.int({ min: 10000, max: 5000000 }),
        clicks: faker.number.int({ min: 100, max: 50000 }),
        conversions: faker.number.int({ min: 10, max: 5000 }),
        startDate: faker.date.past(),
        endDate: faker.date.future(),
      });
    }

    const created = await Campaign.insertMany(campaigns);

    return respondJson(req, res, 201, {
      message: `${count} dummy campaigns created`,
      data: created,
    });
  } catch (error) {
    return respondJson(req, res, error.status || 500, { message: error.message });
  }
};
