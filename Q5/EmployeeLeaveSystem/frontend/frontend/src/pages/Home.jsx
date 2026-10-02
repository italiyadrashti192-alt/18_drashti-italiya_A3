import { Link, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const employee = JSON.parse(localStorage.getItem("employee") || "{}");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div>
      <h1>Employee Home Page</h1>
      <h3>Welcome, {employee.name}</h3>

      <Link to="/profile">Page 1 - Employee Profile</Link>
      <br /><br />

      <Link to="/leave">Page 2 - Apply for Leave</Link>
      <br /><br />

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Home;