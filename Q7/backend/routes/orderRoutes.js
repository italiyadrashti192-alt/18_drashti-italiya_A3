const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getCustomerOrders,
} = require("../controllers/orderController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// Customer routes
router.post("/", protect, placeOrder);
router.get("/customer/me", protect, getCustomerOrders);

// Admin routes
router.get("/", protect, adminOnly, getOrders);
router.get("/:id", protect, adminOnly, getOrderById);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;