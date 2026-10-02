import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Leave from "./pages/Leave";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/home"
          element={token ? <Home /> : <Navigate to="/" />}
        />

        <Route
          path="/profile"
          element={token ? <Profile /> : <Navigate to="/" />}
        />

        <Route
          path="/leave"
          element={token ? <Leave /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;