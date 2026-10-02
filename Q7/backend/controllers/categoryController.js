const Category = require("../models/Category");

// 1. Add Category
const addCategory = async (req, res) => {
  try {
    const { name, description, image, parentCategory } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check parent category
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent category not found",
        });
      }

      if (parent.parentCategory) {
        return res.status(400).json({
          success: false,
          message: "Only two category levels are allowed",
        });
      }
    }

    // Check duplicate category under same parent
    const existingCategory = await Category.findOne({
      name: name.trim(),
      parentCategory: parentCategory || null,
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      image,
      parentCategory: parentCategory || null,
    });

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      category,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 2. Get All Categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("parentCategory", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 3. Get Main Categories
const getMainCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      parentCategory: null,
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 4. Get Subcategories
const getSubcategories = async (req, res) => {
  try {
    const { id } = req.params;

    const categories = await Category.find({
      parentCategory: id,
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 5. Update Category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 6. Delete Category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Prevent deleting a parent that has subcategories
    const hasChildren = await Category.exists({
      parentCategory: id,
    });

    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: "Delete subcategories first",
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  addCategory,
  getCategories,
  getMainCategories,
  getSubcategories,
  updateCategory,
  deleteCategory,
};