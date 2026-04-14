const express = require("express");
const router = express.Router();
const {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  generateDummyCampaigns
} = require("../controllers/campaignController");

router.post("/", createCampaign);
router.get("/getall", getCampaigns);
router.post("/dummy", generateDummyCampaigns);
router.get("/:id", getCampaignById);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);

module.exports = router;