import React, { useState } from "react";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [students, setStudents] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [student, setStudent] = useState({
    name: "",
    age: "",
    course: "",
    year: ""
  });

  // Handle input changes
  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value
    });
  };

  // Save new student or update existing student
  const handleSave = (e) => {
    e.preventDefault();

    if (editIndex !== null) {
      const updatedStudents = [...students];

      updatedStudents[editIndex] = student;

      setStudents(updatedStudents);
    } else {
      setStudents([...students, student]);
    }

    setStudent({
      name: "",
      age: "",
      course: "",
      year: ""
    });

    setEditIndex(null);
    setShowForm(false);
  };

  // Edit student
  const handleEdit = (index) => {
    setStudent({ ...students[index] });
    setEditIndex(index);
    setShowForm(true);
  };

  // Delete student
  const handleDelete = (index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (confirmDelete) {
      setStudents(students.filter((_, i) => i !== index));
    }
  };

  // Open Add Student form
  const handleAdd = () => {
    setStudent({
      name: "",
      age: "",
      course: "",
      year: ""
    });

    setEditIndex(null);
    setShowForm(true);
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditIndex(null);

    setStudent({
      name: "",
      age: "",
      course: "",
      year: ""
    });
  };

  return (
    <div>
      <h1>Student CRUD</h1>

      {/* STUDENT TABLE */}

      <h2>Students</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Course</th>
            <th>Year</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s, index) => (
            <tr key={index}>
              <td>{s.name}</td>
              <td>{s.age}</td>
              <td>{s.course}</td>
              <td>{s.year}</td>

              <td>
                <button onClick={() => handleEdit(index)}>
                  Edit
                </button>

                {" "}

                <button onClick={() => handleDelete(index)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />

      {/* ADD STUDENT LINK BELOW TABLE */}

      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleAdd();
        }}
      >
        Add Student
      </a>

      {/* STUDENT FORM */}

      {showForm && (
        <div>
          <h2>
            {editIndex !== null ? "Edit Student" : "Add Student"}
          </h2>

          <form onSubmit={handleSave}>
            <label>Name</label>
            <br />

            <input
              type="text"
              name="name"
              value={student.name}
              onChange={handleChange}
              required
            />

            <br /><br />

            <label>Age</label>
            <br />

            <input
              type="number"
              name="age"
              value={student.age}
              onChange={handleChange}
              required
            />

            <br /><br />

            <label>Course</label>
            <br />

            <input
              type="text"
              name="course"
              value={student.course}
              onChange={handleChange}
              required
            />

            <br /><br />

            <label>Year</label>
            <br />

            <input
              type="number"
              name="year"
              value={student.year}
              onChange={handleChange}
              required
            />

            <br /><br />

            <button type="submit">
              {editIndex !== null ? "Update" : "Save"}
            </button>

            {" "}

            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;