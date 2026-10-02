
import { useState } from "react";

import AdminCategories from "./pages/AdminCategories";
import ProductManagement from "./pages/ProductManagement";
import CustomerShop from "./pages/CustomerShop";
import AdminOrders from "./pages/AdminOrders";
import MyOrders from "./pages/MyOrders";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [activePage, setActivePage] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));

      return savedUser?.role === "admin" ? "products" : "shop";
    } catch {
      return "shop";
    }
  });

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);

    if (loggedInUser.role === "admin") {
      setActivePage("products");
    } else {
      setActivePage("shop");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setActivePage("shop");
  };

  return (
    <div className="bg-light min-vh-100">

      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark px-4 py-3">

        <span
          className="navbar-brand fw-bold"
          style={{ cursor: "pointer" }}
          onClick={() =>
            setActivePage(user?.role === "admin" ? "products" : "shop")
          }
        >
          ShopEase
        </span>

        <div className="d-flex gap-2 flex-wrap align-items-center">

          {user?.role === "admin" ? (
            <>
              {/* Admin Orders */}
              <button
                className={`btn ${
                  activePage === "orders"
                    ? "btn-warning"
                    : "btn-outline-light"
                }`}
                onClick={() => setActivePage("orders")}
              >
                Orders
              </button>

              {/* Admin Categories */}
              <button
                className={`btn ${
                  activePage === "categories"
                    ? "btn-warning"
                    : "btn-outline-light"
                }`}
                onClick={() => setActivePage("categories")}
              >
                Categories
              </button>

              {/* Admin Products */}
              <button
                className={`btn ${
                  activePage === "products"
                    ? "btn-warning"
                    : "btn-outline-light"
                }`}
                onClick={() => setActivePage("products")}
              >
                Products
              </button>

              <span className="text-white ms-2">
                Hi, {user.name}
              </span>

              <button
                className="btn btn-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : user?.role === "customer" ? (
            <>
              {/* Customer Shop */}
              <button
                className={`btn ${
                  activePage === "shop"
                    ? "btn-warning"
                    : "btn-outline-light"
                }`}
                onClick={() => setActivePage("shop")}
              >
                Shop
              </button>

              {/* Customer Orders */}
              <button
                className={`btn ${
                  activePage === "myorders"
                    ? "btn-warning"
                    : "btn-outline-light"
                }`}
                onClick={() => setActivePage("myorders")}
              >
                My Orders
              </button>

              <span className="text-white ms-2">
                Hi, {user.name}
              </span>

              <button
                className="btn btn-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className={`btn ${
                  activePage === "login"
                    ? "btn-warning"
                    : "btn-outline-light"
                }`}
                onClick={() => setActivePage("login")}
              >
                Login
              </button>

              <button
                className={`btn ${
                  activePage === "register"
                    ? "btn-warning"
                    : "btn-outline-light"
                }`}
                onClick={() => setActivePage("register")}
              >
                Register
              </button>
            </>
          )}

        </div>
      </nav>

      {/* Admin Pages */}
      {user?.role === "admin" ? (
        activePage === "orders" ? (
          <AdminOrders />
        ) : activePage === "categories" ? (
          <AdminCategories />
        ) : (
          <ProductManagement />
        )
      ) : user?.role === "customer" ? (
        activePage === "myorders" ? (
          <MyOrders />
        ) : (
          <CustomerShop />
        )
      ) : activePage === "login" ? (
        <Login
          onRegisterClick={() => setActivePage("register")}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : activePage === "register" ? (
        <Register
          onLoginClick={() => setActivePage("login")}
          onRegisterSuccess={() => setActivePage("login")}
        />
      ) : (
        <Login
          onRegisterClick={() => setActivePage("register")}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

    </div>
  );
}

export default App;