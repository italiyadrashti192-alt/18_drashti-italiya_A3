import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Profile() {
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/employee/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        setEmployee(response.data);
      } catch (error) {
        alert("Unable to load profile");
      }
    };

    fetchProfile();
  }, []);

  if (!employee) return <h3>Loading Profile...</h3>;

  return (
    <div>
      <h2>Employee Profile</h2>

      <p><b>Name:</b> {employee.name}</p>
      <p><b>Email:</b> {employee.email}</p>
      <p><b>Department:</b> {employee.department}</p>
      <p><b>Designation:</b> {employee.designation}</p>

      <Link to="/home">Back to Home</Link>
    </div>
  );
}

export default Profile;