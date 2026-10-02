
import { useEffect, useState } from "react";
import api from "../services/api";

function CustomerShop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);

 const [customer, setCustomer] = useState({
  customerName: "",
  phone: "",
  address: "",
});

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.products || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error(error);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;

    const baseURL = api.defaults.baseURL.replace(/\/api\/?$/, "");
    return `${baseURL}${image}`;
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);

      if (existing) {
        if (existing.quantity >= product.stock) {
          alert("Maximum available stock reached!");
          return prev;
        }

        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      if (product.stock <= 0) {
        alert("Product is out of stock!");
        return prev;
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const changeQuantity = (id, amount) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === id
            ? {
                ...item,
                quantity: Math.min(item.stock, item.quantity + amount),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      product.category?._id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCustomerChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  const placeOrder = async (e) => {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login before placing an order.");
    return;
  }

  try {
    setLoading(true);

    const orderData = {
      customerName: customer.customerName,
      phone: customer.phone,
      address: customer.address,
      items: cart.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      })),
    };

    const res = await api.post("/orders", orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert(
      `Order placed successfully!\nOrder ID: ${
        res.data.order?.orderId || "Created"
      }`
    );

    setCart([]);
    setShowCheckout(false);

    setCustomer({
      customerName: "",
      phone: "",
      address: "",
    });

    await fetchProducts();
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Unable to place order. Please try again."
    );

    console.error(error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container-fluid py-4">
      <div className="text-center mb-4">
        <h1 className="fw-bold">Welcome to ShopEase</h1>
        <p className="text-muted">
          Discover products and enjoy shopping!
        </p>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-8 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>

            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products */}
      <h4 className="fw-bold mb-3">Explore Products</h4>

      <div className="row">
        {filteredProducts.length === 0 ? (
          <div className="col-12 text-center py-5">
            <h5>No products found</h5>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              className="col-sm-6 col-md-4 col-lg-3 mb-4"
              key={product._id}
            >
              <div className="card h-100 shadow-sm border-0">
                {product.image ? (
                  <img
                    src={getImageUrl(product.image)}
                    className="card-img-top"
                    alt={product.name}
                    style={{
                      height: "200px",
                      objectFit: "contain",
                      padding: "12px",
                    }}
                  />
                ) : (
                  <div
                    className="bg-light d-flex align-items-center justify-content-center"
                    style={{ height: "200px" }}
                  >
                    No Image
                  </div>
                )}

                <div className="card-body d-flex flex-column">
                  <h5 className="fw-bold">{product.name}</h5>

                  <p className="text-muted small">
                    {product.description}
                  </p>

                  <h5 className="text-primary fw-bold">
                    ₹{product.price}
                  </h5>

                  <p className="small">
                    {product.stock > 0
                      ? `In Stock: ${product.stock}`
                      : "Out of Stock"}
                  </p>

                  <button
                    className="btn btn-primary mt-auto"
                    disabled={product.stock <= 0}
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Shopping Cart */}
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-header bg-dark text-white py-3">
          <h5 className="mb-0">
            🛒 My Shopping Cart ({totalItems})
          </h5>
        </div>

        <div className="card-body">
          {cart.length === 0 ? (
            <p className="text-muted mb-0">
              Your cart is empty. Add some products!
            </p>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="d-flex justify-content-between align-items-center border-bottom py-3"
                >
                  <div>
                    <strong>{item.name}</strong>
                    <div className="text-muted">
                      ₹{item.price} × {item.quantity}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => changeQuantity(item._id, -1)}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      className="btn btn-sm btn-outline-secondary"
                      disabled={item.quantity >= item.stock}
                      onClick={() => changeQuantity(item._id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div className="text-end mt-3">
                <h4 className="fw-bold">
                  Total: ₹{totalPrice.toFixed(2)}
                </h4>

                <button
                  className="btn btn-success"
                  onClick={() => setShowCheckout(true)}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Checkout Form */}
      {showCheckout && (
        <div className="card shadow-sm border-0 mt-4">
          <div className="card-header bg-success text-white py-3">
            <h5 className="mb-0">Checkout Details</h5>
          </div>

          <div className="card-body">
            <form onSubmit={placeOrder}>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="customerName"
                  className="form-control"
                  value={customer.customerName}
                  onChange={handleCustomerChange}
                  required
                />
              </div>

              <div className="mb-3">
                
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={customer.email}
                  onChange={handleCustomerChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={customer.phone}
                  onChange={handleCustomerChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Delivery Address</label>
                <textarea
                  name="address"
                  className="form-control"
                  rows="3"
                  value={customer.address}
                  onChange={handleCustomerChange}
                  required
                />
              </div>

              <div className="alert alert-info">
                <strong>Order Total: ₹{totalPrice.toFixed(2)}</strong>
              </div>

              <button
                type="submit"
                className="btn btn-success me-2"
                disabled={loading}
              >
                {loading ? "Placing Order..." : "Confirm Order"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowCheckout(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerShop;