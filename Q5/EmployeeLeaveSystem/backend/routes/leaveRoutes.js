const express = require("express");
const Leave = require("../models/Leave");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Add Leave
router.post("/", protect, async (req, res) => {
  try {
    const { date, reason } = req.body;

    const leave = await Leave.create({
      employee: req.employeeId,
      date,
      reason
    });

    res.status(201).json({
      message: "Leave applied successfully",
      leave
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List Employee Leaves
router.get("/", protect, async (req, res) => {
  try {
    const leaves = await Leave.find({
      employee: req.employeeId
    }).sort({ date: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;