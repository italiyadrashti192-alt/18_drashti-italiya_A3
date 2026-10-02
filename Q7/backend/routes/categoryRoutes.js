const express = require("express");

const router = express.Router();

const {
  addCategory,
  getCategories,
  getMainCategories,
  getSubcategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// Get Main Categories - Public
router.get("/main", getMainCategories);

// Get All Categories - Public
router.get("/", getCategories);

// Get Subcategories - Public
router.get("/:id/subcategories", getSubcategories);

// Add Category - Admin Only
router.post("/", protect, adminOnly, addCategory);

// Update Category - Admin Only
router.put("/:id", protect, adminOnly, updateCategory);

// Delete Category - Admin Only
router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;