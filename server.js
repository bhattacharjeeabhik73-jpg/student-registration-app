// server.js

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Render provides a PORT automatically
const PORT = process.env.PORT || 3000;


//  Serve static files (HTML, images, CSS, JS)
app.use(express.static(__dirname));


// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//  Home route (loads index.html)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// SQLite database connection
const db = new sqlite3.Database("./students.db", (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});


//  Create students table
db.run(`
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        country TEXT NOT NULL,
        subject TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL
    )
`);


//  POST route to register student
app.post("/register", (req, res) => {

    const { username, password, country, subject, address, phone } = req.body;

    if (!username || !password || !country || !subject || !address || !phone) {
        return res.status(400).send("All fields are required.");
    }

    const sql = `
        INSERT INTO students
        (username, password, country, subject, address, phone)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [username, password, country, subject, address, phone], function(err) {

        if (err) {
            console.error(err.message);
            return res.status(500).send("Database error.");
        }

        res.send("Student Registered Successfully!");
    });

});
//  Route to display all students
app.get("/students", (req, res) => {

    const sql = "SELECT * FROM students";

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        res.json(rows);
    });

});

//  Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});