const express = require("express");
const router = express.Router();
const {
  getGoals,
  getGoalProgress,
  createGoal,
  updateGoal,
  deleteGoal,
} = require("../controllers/goalController");
const { verifyToken } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/progress", getGoalProgress);  // MUST be before "/:id" catch-all
router.get("/", getGoals);
router.post("/", createGoal);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

module.exports = router;
