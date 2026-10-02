const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(
  session({
    store: new FileStore({
      path: "./sessions",
    }),
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 30, // 30 minutes
      httpOnly: true,
    },
  })
);

// Load users
const users = JSON.parse(fs.readFileSync("./users.json", "utf8"));

// Login page
app.get("/login", (req, res) => {
  res.send(`
    <h2>Login</h2>

    <form method="POST" action="/login">
      <input
        type="text"
        name="username"
        placeholder="Username"
        required
      />
       <br><br>
      <input
        type="password"
        name="password"
        placeholder="Password"
        required
      />
      <br>
      <button type="submit">Login</button>
    </form>
  `);
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).send("Invalid username or password");
  }

  req.session.user = {
    id: user.id,
    username: user.username,
  };

  res.redirect("/dashboard");
});

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).send("Please login first");
  }
}

// Protected Route 1
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.send(`
    <h2>Dashboard</h2>
    <p>Welcome, ${req.session.user.username}!</p>

    <a href="/profile">Profile</a><br>
    <a href="/logout">Logout</a>
  `);
});

// Protected Route 2
app.get("/profile", isAuthenticated, (req, res) => {
  res.send(`
    <h2>Profile</h2>
    <p>User ID: ${req.session.user.id}</p>
    <p>Username: ${req.session.user.username}</p>

    <a href="/dashboard">Dashboard</a><br>
    <a href="/logout">Logout</a>
  `);
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Unable to logout");
    }

    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
