const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

const addThirtyDays = (date) => new Date(date.getTime() + THIRTY_DAYS_IN_MS);

const getCampaignExpiryDate = (campaign) => {
  if (campaign?.endDate) {
    return new Date(campaign.endDate);
  }

  if (campaign?.startDate) {
    return addThirtyDays(new Date(campaign.startDate));
  }

  if (campaign?.createdAt) {
    return addThirtyDays(new Date(campaign.createdAt));
  }

  return addThirtyDays(new Date());
};

const buildExpiredCampaignFilter = (now = new Date()) => ({
  status: { $ne: "completed" },
  $or: [
    { endDate: { $lte: now } },
    {
      endDate: { $exists: false },
      startDate: { $lte: new Date(now.getTime() - THIRTY_DAYS_IN_MS) },
    },
    {
      endDate: { $exists: false },
      startDate: { $exists: false },
      createdAt: { $lte: new Date(now.getTime() - THIRTY_DAYS_IN_MS) },
    },
  ],
});

const applyCompletedStatus = (campaign, now = new Date()) => {
  if (!campaign) {
    return campaign;
  }

  const expiryDate = getCampaignExpiryDate(campaign);

  if (campaign.status !== "completed" && expiryDate <= now) {
    return {
      ...campaign,
      status: "completed",
      endDate: campaign.endDate || expiryDate,
    };
  }

  return campaign;
};

module.exports = {
  addThirtyDays,
  applyCompletedStatus,
  buildExpiredCampaignFilter,
  getCampaignExpiryDate,
};
