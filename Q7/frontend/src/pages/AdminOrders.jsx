
import { useEffect, useState } from "react";
import api from "../services/api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const statuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await api.get("/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data.orders || res.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch Orders Error:", error.response?.data || error);
      alert(error.response?.data?.message || "Unable to fetch orders!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdating(true);

      const token = localStorage.getItem("token");

      await api.put(
        `/orders/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === id ? { ...order, status } : order
        )
      );

      setSelectedOrder((prev) =>
        prev?._id === id ? { ...prev, status } : prev
      );

      alert("Order status updated successfully!");
    } catch (error) {
      console.error("Update Status Error:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
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

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning" />
        <p className="mt-3 text-muted">Loading customer orders...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-semibold mb-1">Order Management</h2>
          <p className="text-muted mb-0">
            View customer orders and manage delivery status.
          </p>
        </div>

        <button
          className="btn btn-dark"
          onClick={fetchOrders}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh Orders
        </button>
      </div>

      {/* Status Summary */}
      <div className="row g-3 mb-4">
        {statuses.map((status) => (
          <div className="col-6 col-md-4 col-xl" key={status}>
            <div className="card h-100">
              <div className="card-body">
                <p className="text-muted small mb-2">{status}</p>
                <h3 className="fw-semibold mb-0">
                  {orders.filter((order) => order.status === status).length}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-header py-3">
          <h5 className="mb-0 fw-semibold">
            All Customer Orders ({orders.length})
          </h5>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Total Amount</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <p className="text-muted mb-1">No orders available</p>
                    <small className="text-muted">
                      Customer orders will appear here.
                    </small>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td className="fw-semibold">
                      {order.orderId}
                    </td>

                    <td>
                      <div className="fw-semibold">
                        {order.customerName}
                      </div>
                      <small className="text-muted">
                        {order.email}
                      </small>
                    </td>

                    <td>{order.items?.length || 0} items</td>

                    <td className="fw-semibold">
                      ₹{Number(order.totalAmount || 0).toFixed(2)}
                    </td>

                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-IN")
                        : "N/A"}
                    </td>

                    <td>
                      <span className={`badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View / Track
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title fw-semibold">
                  Order Details & Tracking
                </h5>

                <button
                  className="btn-close"
                  onClick={() => setSelectedOrder(null)}
                />
              </div>

              <div className="modal-body">

                <h6 className="fw-semibold mb-3">
                  Customer Information
                </h6>

                <div className="row g-3">
                  <div className="col-md-6">
                    <small className="text-muted">Order ID</small>
                    <div className="fw-semibold">
                      {selectedOrder.orderId}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">Customer Name</small>
                    <div className="fw-semibold">
                      {selectedOrder.customerName}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">Email</small>
                    <div>{selectedOrder.email}</div>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">Phone</small>
                    <div>{selectedOrder.phone}</div>
                  </div>

                  <div className="col-12">
                    <small className="text-muted">Address</small>
                    <div>{selectedOrder.address}</div>
                  </div>
                </div>

                <hr />

                <h6 className="fw-semibold mb-3">
                  Ordered Products
                </h6>

                {selectedOrder.items?.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="d-flex justify-content-between align-items-center border-bottom py-3"
                  >
                    <div>
                      <div className="fw-semibold">{item.name}</div>
                      <small className="text-muted">
                        Quantity: {item.quantity}
                      </small>
                    </div>

                    <strong>
                      ₹
                      {(
                        Number(item.price || 0) *
                        Number(item.quantity || 0)
                      ).toFixed(2)}
                    </strong>
                  </div>
                ))}

                <h5 className="text-end fw-semibold mt-3">
                  Total: ₹
                  {Number(selectedOrder.totalAmount || 0).toFixed(2)}
                </h5>

                <hr />

                <h6 className="fw-semibold mb-3">
                  Order Tracking
                </h6>

                <div className="mb-3">
                  <span className="text-muted me-2">
                    Current Status:
                  </span>

                  <span className={`badge ${getStatusClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                <label className="form-label fw-semibold">
                  Update Delivery Status
                </label>

                <select
                  className="form-select"
                  value={selectedOrder.status}
                  disabled={updating}
                  onChange={(e) =>
                    updateStatus(selectedOrder._id, e.target.value)
                  }
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {updating && (
                  <small className="text-muted d-block mt-2">
                    Updating order status...
                  </small>
                )}

              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminOrders;