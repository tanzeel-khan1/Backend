const Campaign = require("../models/Campaign");
const mongoose = require("mongoose");

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
      return res.status(400).json({
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

    const campaign = await Campaign.create(campaignData);

    return res.status(201).json({
      message: "Campaign created successfully",
      data: campaign,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 20;

    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;

    const campaigns = await Campaign.find({})
      .select(
        "campaignName client status budget spend impressions clicks conversions createdAt updatedAt"
      )
      // `_id` is indexed by default in MongoDB, which avoids expensive
      // sorts if the `createdAt` index is not present in production yet.
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .maxTimeMS(3000)
      .exec();

    return res.status(200).json({
      page,
      limit,
      count: campaigns.length,
      data: campaigns,
    });
  } catch (error) {
    const isTimeout = error?.code === 50;

    return res.status(isTimeout ? 504 : 500).json({
      message: isTimeout
        ? "Database query timed out. Please try again."
        : error.message,
    });
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    return res.status(200).json(campaign);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const campaign = await Campaign.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    return res.status(200).json(campaign);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const campaign = await Campaign.findByIdAndDelete(id);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    return res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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

    return res.status(201).json({
      message: `${count} dummy campaigns created`,
      data: created,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
