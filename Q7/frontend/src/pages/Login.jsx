import { useState } from "react";
import axios from "axios";

function Login({ onRegisterClick, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage("Login successful!");

      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center py-5">
      <div
        className="card shadow-lg border-0 p-4"
        style={{ width: "100%", maxWidth: "450px" }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold text-warning">ShopEase</h2>
          <h4>Welcome Back!</h4>
          <p className="text-muted">Login to your account</p>
        </div>

        {message && (
          <div className="alert alert-info">{message}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-warning w-100 fw-bold"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          Don't have an account?{" "}
          <button
            className="btn btn-link text-warning fw-bold p-0"
            onClick={onRegisterClick}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;