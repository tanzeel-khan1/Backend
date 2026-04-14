const Campaign = require("../models/Campaign");
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

exports.createCampaign = async (req, res) => {
  try {
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

    // ❌ agar client ya campaignName missing ho
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

    res.status(201).json({
      message: "Campaign created successfully",
      data: campaign,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🟢 GET Single Campaign
exports.getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ ID validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🟢 UPDATE Campaign
exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const campaign = await Campaign.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🟢 DELETE Campaign
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

    res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🟣 GENERATE DUMMY CAMPAIGNS (Faker API)
exports.generateDummyCampaigns = async (req, res) => {
  try {
    const count = req.query.count || 10;

    const campaigns = [];

    for (let i = 0; i < count; i++) {
      campaigns.push({
        name: faker.company.catchPhrase(),
        client: faker.company.name(),
        status: faker.helpers.arrayElement([
          "active",
          "paused",
          "completed",
        ]),
        budget: faker.number.int({ min: 5000, max: 100000 }),
        impressions: faker.number.int({ min: 10000, max: 5000000 }),
        clicks: faker.number.int({ min: 100, max: 50000 }),
        startDate: faker.date.past(),
        endDate: faker.date.future(),
      });
    }

    const created = await Campaign.insertMany(campaigns);

    res.status(201).json({
      message: `${count} dummy campaigns created`,
      data: created,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};