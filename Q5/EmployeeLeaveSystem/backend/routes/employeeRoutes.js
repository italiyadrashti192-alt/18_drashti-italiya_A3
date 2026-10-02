const express = require("express");
const Employee = require("../models/Employee");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in employee profile
router.get("/profile", protect, async (req, res) => {
  try {
    const employee = await Employee.findById(req.employeeId).select("-password");

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;