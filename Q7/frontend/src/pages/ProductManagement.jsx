
import { useEffect, useState } from "react";
import api from "../services/api";

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data.products);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load products");
      setMessageType("danger");
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.categories);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle Input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Only JPG, PNG, and WEBP images are allowed");
      setMessageType("danger");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5 MB");
      setMessageType("danger");
      e.target.value = "";
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setMessage("");
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
    });

    setSelectedImage(null);
    setImagePreview("");
    setEditingId(null);

    const fileInput = document.getElementById("productImage");
    if (fileInput) fileInput.value = "";
  };

  // Add / Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();

      data.append("name", formData.name.trim());
      data.append("description", formData.description);
      data.append("price", Number(formData.price));
      data.append("stock", Number(formData.stock));
      data.append("category", formData.category);

      if (selectedImage) {
        data.append("image", selectedImage);
      }

      if (editingId) {
        await api.put(`/products/${editingId}`, data);
        setMessage("Product updated successfully!");
      } else {
        await api.post("/products", data);
        setMessage("Product added successfully!");
      }

      setMessageType("success");

      resetForm();
      await fetchProducts();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Something went wrong"
      );
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  // Image URL Helper
  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http")) return image;

    const baseURL = api.defaults.baseURL.replace(/\/api\/?$/, "");

    return `${baseURL}${image}`;
  };

  // Edit Product
  const handleEdit = (product) => {
    setEditingId(product._id);

    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category?._id || "",
    });

    setSelectedImage(null);
    setImagePreview(
      product.image ? getImageUrl(product.image) : ""
    );

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete Product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);

      setMessage("Product deleted successfully!");
      setMessageType("success");

      await fetchProducts();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Delete failed"
      );
      setMessageType("danger");
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Product Management</h2>
          <p className="text-muted mb-0">
            Manage your store products and inventory
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          Total Products: {products.length}
        </span>
      </div>

      {/* Message */}
      {message && (
        <div className={`alert alert-${messageType} alert-dismissible fade show`}>
          {message}

          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage("")}
          ></button>
        </div>
      )}

      {/* Product Form */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-header bg-white py-3">
          <h5 className="fw-bold mb-0">
            {editingId ? "Edit Product" : "Add New Product"}
          </h5>
        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="row">

              {/* Product Name */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Product Name *
                </label>

                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Category */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Category *
                </label>

                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.parentCategory?.name
                        ? `${category.parentCategory.name} → ${category.name}`
                        : category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Price (₹) *
                </label>

                <input
                  type="number"
                  name="price"
                  className="form-control"
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Stock */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Stock Quantity *
                </label>

                <input
                  type="number"
                  name="stock"
                  className="form-control"
                  placeholder="Enter stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="col-12 mb-3">
                <label className="form-label fw-semibold">
                  Product Image
                </label>

                <input
                  type="file"
                  id="productImage"
                  className="form-control"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />

                <small className="text-muted">
                  JPG, PNG, WEBP | Maximum size: 5 MB
                </small>

                {imagePreview && (
                  <div className="mt-3">
                    <p className="fw-semibold mb-2">Image Preview</p>

                    <img
                      src={imagePreview}
                      alt="Product Preview"
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="col-12 mb-3">
                <label className="form-label fw-semibold">
                  Description *
                </label>

                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Product"
                : "Add Product"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}

          </form>
        </div>
      </div>

      {/* Product Table */}
      <div className="card shadow-sm border-0">

        <div className="card-header bg-white py-3">
          <h5 className="fw-bold mb-0">All Products</h5>
        </div>

        <div className="card-body">

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No products found. Add your first product.
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr key={product._id}>

                      <td>{index + 1}</td>

                      <td>
                        {product.image ? (
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            style={{
                              width: "55px",
                              height: "55px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        ) : (
                          <span className="text-muted">No Image</span>
                        )}
                      </td>

                      <td className="fw-semibold">
                        {product.name}
                      </td>

                      <td>
                        {product.category?.name || "Unknown"}
                      </td>

                      <td>₹{product.price}</td>

                      <td>
                        <span
                          className={`badge ${
                            product.stock > 0
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex gap-2">

                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(product)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(product._id)}
                          >
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>

          </div>
        </div>
      </div>

    </div>
  );
}

export default ProductManagement;