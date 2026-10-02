
import { useEffect, useState } from "react";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const [ordersRes, productsRes, categoriesRes] =
          await Promise.all([
            fetch("http://localhost:5000/api/orders", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://localhost:5000/api/products"),
            fetch("http://localhost:5000/api/categories"),
          ]);

        if (!ordersRes.ok || !productsRes.ok || !categoriesRes.ok) {
          throw new Error("Unable to load dashboard data");
        }

        const orders = await ordersRes.json();
        const products = await productsRes.json();
        const categories = await categoriesRes.json();

        const revenue = orders
          .filter((order) => order.status !== "Cancelled")
          .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

        setStats({
          totalOrders: orders.length,
          totalProducts: products.length,
          totalCategories: categories.length,
          totalRevenue: revenue,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: "📦",
      color: "primary",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: "🛍️",
      color: "success",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      icon: "📂",
      color: "warning",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      icon: "💰",
      color: "info",
    },
  ];

  return (
    <div className="container-fluid p-4">
      <h2 className="fw-bold mb-1">Admin Dashboard</h2>
      <p className="text-muted mb-4">
        Welcome to your ShopEase management panel.
      </p>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" />
          <p className="mt-2">Loading dashboard...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="row g-4">
          {cards.map((card) => (
            <div className="col-12 col-sm-6 col-xl-3" key={card.title}>
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-2">{card.title}</p>
                    <h3 className="fw-bold mb-0">{card.value}</h3>
                  </div>

                  <div
                    className={`bg-${card.color}-subtle rounded-circle p-3 fs-3`}
                  >
                    {card.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">
          <h5 className="fw-bold">ShopEase Management</h5>
          <p className="text-muted mb-0">
            Manage products, categories, customer orders, and store activity
            from the navigation menu.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
