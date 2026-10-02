
import { useEffect, useState } from "react";
import api from "../services/api";

function AdminCategories() {
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentCategory: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [editingId, setEditingId] = useState(null);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.categories);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load categories");
      setMessageType("danger");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      parentCategory: "",
    });

    setEditingId(null);
  };

  // Add or Update Category
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const data = {
        name: formData.name.trim(),
        description: formData.description,
        parentCategory: formData.parentCategory || null,
      };

      if (editingId) {
        await api.put(`/categories/${editingId}`, data);

        setMessage("Category updated successfully!");
        setMessageType("success");
      } else {
        await api.post("/categories", data);

        setMessage("Category added successfully!");
        setMessageType("success");
      }

      resetForm();

      await fetchCategories();

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Something went wrong"
      );
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  // Edit Category
  const handleEdit = (category) => {
    setEditingId(category._id);

    setFormData({
      name: category.name,
      description: category.description || "",
      parentCategory: category.parentCategory?._id || "",
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete Category
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/categories/${id}`);

      setMessage("Category deleted successfully!");
      setMessageType("success");

      if (editingId === id) {
        resetForm();
      }

      await fetchCategories();

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Delete failed"
      );
      setMessageType("danger");
    }
  };

  // Main Categories
  const mainCategories = categories.filter(
    (category) => !category.parentCategory
  );

  return (
    <div className="container-fluid py-4">

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold">Category Management</h2>

          <p className="text-muted mb-0">
            Manage main categories and subcategories
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          Total: {categories.length}
        </span>

      </div>

      {/* Success / Error Message */}
      {message && (
        <div
          className={`alert alert-${messageType} alert-dismissible fade show`}
          role="alert"
        >
          {message}

          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage("")}
          ></button>
        </div>
      )}

      {/* Category Form */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-header bg-white py-3">

          <h5 className="mb-0 fw-bold">
            {editingId ? "Edit Category" : "Add New Category"}
          </h5>

        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="row">

              {/* Category Name */}
              <div className="col-md-4 mb-3">

                <label className="form-label fw-semibold">
                  Category Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  required
                />

              </div>

              {/* Parent Category */}
              <div className="col-md-4 mb-3">

                <label className="form-label fw-semibold">
                  Parent Category
                </label>

                <select
                  className="form-select"
                  name="parentCategory"
                  value={formData.parentCategory}
                  onChange={handleChange}
                >

                  <option value="">
                    Main Category
                  </option>

                  {mainCategories
                    .filter((category) => category._id !== editingId)
                    .map((category) => (
                      <option
                        key={category._id}
                        value={category._id}
                      >
                        {category.name}
                      </option>
                    ))}

                </select>

                <small className="text-muted">
                  Select a parent to create a subcategory.
                </small>

              </div>

              {/* Description */}
              <div className="col-md-4 mb-3">

                <label className="form-label fw-semibold">
                  Description
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                />

              </div>

            </div>

            {/* Buttons */}
            <div className="d-flex gap-2">

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Category"
                  : "Add Category"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </div>
      </div>

      {/* Category Table */}
      <div className="card shadow-sm border-0">

        <div className="card-header bg-white py-3">

          <h5 className="mb-0 fw-bold">
            All Categories
          </h5>

        </div>

        <div className="card-body">

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-light">

                <tr>
                  <th>#</th>
                  <th>Category Name</th>
                  <th>Parent Category</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {categories.length === 0 ? (

                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-4 text-muted"
                    >
                      No categories found. Add your first category.
                    </td>
                  </tr>

                ) : (

                  categories.map((category, index) => (

                    <tr key={category._id}>

                      <td>{index + 1}</td>

                      <td className="fw-semibold">
                        {category.name}
                      </td>

                      <td>
                        {category.parentCategory?.name || (
                          <span className="badge bg-primary">
                            Main Category
                          </span>
                        )}
                      </td>

                      <td>
                        {category.description || "-"}
                      </td>

                      <td>

                        <div className="d-flex gap-2">

                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(category)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(category._id)}
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

export default AdminCategories;