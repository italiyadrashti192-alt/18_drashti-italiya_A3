const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// Add product - Admin only
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  addProduct
);

// Get all products - Public
router.get("/", getProducts);

// Get single product - Public
router.get("/:id", getProductById);

// Update product - Admin only
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateProduct
);

// Delete product - Admin only
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteProduct
);

module.exports = router;