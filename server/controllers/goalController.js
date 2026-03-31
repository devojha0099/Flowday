const Goal = require("../models/Goal");
const Entry = require("../models/Entry");

// @route GET /api/goals
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id });
    res.json({ success: true, goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/goals/progress
const getGoalProgress = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id, isActive: true });

    // Calculate progress for each goal
    const progress = await Promise.all(
      goals.map(async (goal) => {
        // Get entries from last 7 days for this category
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const entries = await Entry.find({
          userId: req.user._id,
          category: goal.category,
          actualStart: { $gte: sevenDaysAgo },
        });

        // Calculate total hours
        const totalMinutes = entries.reduce((sum, entry) => {
          if (entry.actualEnd) {
            const diff =
              new Date(entry.actualEnd) - new Date(entry.actualStart);
            return sum + diff / (1000 * 60);
          }
          return sum;
        }, 0);

        const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

        return {
          _id: goal._id,
          title: goal.title,
          category: goal.category,
          targetHours: goal.targetHours,
          actualHours: totalHours,
          completionPct: Math.round((totalHours / goal.targetHours) * 100),
        };
      }),
    );

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/goals
const createGoal = async (req, res) => {
  try {
    const { title, description, targetHours, category } = req.body;
    const goal = await Goal.create({
      userId: req.user._id,
      title,
      description,
      targetHours,
      category,
    });
    res.status(201).json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  try {
    const result = await Goal.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    res.json({ success: true, message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGoals,
  getGoalProgress,
  createGoal,
  updateGoal,
  deleteGoal,
};
