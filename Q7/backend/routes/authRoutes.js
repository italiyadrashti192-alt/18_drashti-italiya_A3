const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

// Customer Registration
router.post("/register", registerUser);

// Customer Login
router.post("/login", loginUser);

module.exports = router;