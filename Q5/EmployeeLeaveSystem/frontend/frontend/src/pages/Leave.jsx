import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Leave() {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaves, setLeaves] = useState([]);

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const fetchLeaves = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/leaves",
        config
      );
      setLeaves(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/leaves",
        { date, reason },
        config
      );

      alert("Leave Applied Successfully!");
      setDate("");
      setReason("");
      fetchLeaves();
    } catch (error) {
      alert("Failed to apply leave");
    }
  };

  return (
    <div>
      <h2>Application for Leave</h2>

      <form onSubmit={handleSubmit}>
        <label>Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <br /><br />

        <label>Reason:</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">Apply Leave</button>
      </form>

      <h2>Leave Applications</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Date</th>
            <th>Reason</th>
            <th>Grant</th>
          </tr>
        </thead>

        <tbody>
          {leaves.map((leave) => (
            <tr key={leave._id}>
              <td>{new Date(leave.date).toLocaleDateString()}</td>
              <td>{leave.reason}</td>
              <td>{leave.grant}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />
      <Link to="/home">Back to Home</Link>
    </div>
  );
}

export default Leave;