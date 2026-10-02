import { useEffect, useState } from "react";
import api from "../services/api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await api.get("/orders/customer/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data.orders || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to fetch your orders"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      Pending: "bg-warning text-dark",
      Processing: "bg-info text-dark",
      Shipped: "bg-primary",
      Delivered: "bg-success",
      Cancelled: "bg-danger",
    };

    return classes[status] || "bg-secondary";
  };

  if (!localStorage.getItem("token")) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning text-center">
          Please login to view your orders.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold">My Orders</h2>
        <p className="text-muted">
          Track your ShopEase purchases.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning"></div>
          <p className="mt-2">Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : orders.length === 0 ? (
        <div className="alert alert-info text-center">
          <h5>No Orders Yet!</h5>
          <p className="mb-0">
            Start shopping to see your orders here.
          </p>
        </div>
      ) : (
        <>
          <h5 className="fw-bold mb-3">
            Your Orders ({orders.length})
          </h5>

          {orders.map((order) => (
            <div
              className="card shadow-sm border-0 mb-4"
              key={order._id}
            >
              <div className="card-header bg-white py-3">
                <div className="d-flex justify-content-between flex-wrap gap-2">
                  <div>
                    <strong>Order ID: {order.orderId}</strong>

                    <div className="small text-muted">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <span
                    className={`badge ${getStatusClass(order.status)} align-self-center`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="card-body">
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    className="d-flex justify-content-between border-bottom py-3"
                  >
                    <div>
                      <strong>{item.name}</strong>

                      <div className="text-muted small">
                        ₹{item.price} × {item.quantity}
                      </div>
                    </div>

                    <strong>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </strong>
                  </div>
                ))}

                <div className="text-end mt-3">
                  <h5 className="fw-bold">
                    Total: ₹{Number(order.totalAmount).toFixed(2)}
                  </h5>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default MyOrders;