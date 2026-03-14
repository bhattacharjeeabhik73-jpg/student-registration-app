// server.js

const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Render provides a PORT automatically
const PORT = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Home route (loads index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


// ---------------- DATABASE INIT ----------------

async function initDB() {
  try {

    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        country TEXT NOT NULL,
        subject TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL
      )
    `);

    console.log("Students table ready");

  } catch (err) {

    console.error("Database init error:", err);

  }
}


// ---------------- ROUTES ----------------

// Register student
app.post("/register", async (req, res) => {

  const { username, password, country, subject, address, phone } = req.body;

  if (!username || !password || !country || !subject || !address || !phone) {
    return res.status(400).send("All fields are required.");
  }

  try {

    await pool.query(
      `INSERT INTO students
      (username, password, country, subject, address, phone)
      VALUES ($1,$2,$3,$4,$5,$6)`,
      [username, password, country, subject, address, phone]
    );

    res.send("Student Registered Successfully!");

  } catch (err) {

    console.error(err);
    res.status(500).send("Database error.");

  }

});


// Show all students
app.get("/students", async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT id, username, country, subject, address, phone FROM students`
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: err.message });

  }

});


// Delete student
app.post("/delete-student", async (req, res) => {

  const { id } = req.body;

  try {

    await pool.query(
      `DELETE FROM students WHERE id=$1`,
      [id]
    );

    res.send("Student Deleted Successfully!");

  } catch (err) {

    console.error(err);
    res.status(500).send(err.message);

  }

});


// ---------------- START SERVER ----------------

async function startServer() {

  await initDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

}

startServer();