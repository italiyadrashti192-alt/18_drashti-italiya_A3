const Order = require("../models/Order");
const Product = require("../models/Product");

// ========================================
// 1. Place Order
// ========================================
const placeOrder = async (req, res) => {
  try {
    const { customerName, phone, address, items } = req.body;

    if (
      !customerName ||
      !phone ||
      !address ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all customer details and add products",
      });
    }

    // Get email from authenticated user
    const email = req.user.email;

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        product.stock < item.quantity
      ) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });

      totalAmount += product.price * item.quantity;
    }

    const orderId = "ORD" + Date.now();

    const order = await Order.create({
      orderId,
      customerName,
      email,
      phone,
      address,
      items: orderItems,
      totalAmount,
    });

    // Reduce product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// 2. Get All Orders - Admin
// ========================================
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// 3. Get Single Order - Admin
// ========================================
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// 4. Update Order Status - Admin
// ========================================
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// 5. Get Customer Orders - Own Account Only
// ========================================
const getCustomerOrders = async (req, res) => {
  try {
    const email = req.user.email;

    const orders = await Order.find({ email })
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Export All Functions
// ========================================
module.exports = {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getCustomerOrders,
};