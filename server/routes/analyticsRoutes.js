const express = require("express");
const router = express.Router();
const {
  getWeeklySummary,
  getHeatmap,
  getMonthlySummary,
} = require("../controllers/analyticsController");
const { verifyToken } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/week", getWeeklySummary);
router.get("/heatmap", getHeatmap);
router.get("/month", getMonthlySummary);

module.exports = router;
