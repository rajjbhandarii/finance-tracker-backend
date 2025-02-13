const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const { take } = require("rxjs");

const app = express();
const transaction = new sqlite3.Database("./Transaction.db");

app.use(bodyParser.json());
app.use(cors());

// Create a table if not exists
transaction.run(`
  CREATE TABLE IF NOT EXISTS data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    description TEXT,
    amount INTEGER,
    category TEXT
  )
`);
transaction.run(`
  CREATE TABLE IF NOT EXISTS budget (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT ,
    amount INTEGER,
    spent INTEGER
  )
`);

// Add data to the database
app.post("/api/data", (req, res) => {
  const { date, description, amount, category } = req.body;
  transaction.run(
    "INSERT INTO data (date,description,amount,category) VALUES (?, ?, ?, ? )",
    [date, description, amount, category],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

// Get all data
app.get("/api/data", (req, res) => {
  transaction.all("SELECT * FROM data", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// remove data from database
app.delete("/api/data/:id", (req, res) => {
  transaction.run(
    `DELETE FROM data WHERE id = ?`,
    req.params.id,
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

// Add budget to the database
app.post("/api/budget", (req, res) => {
  const { category, amount, spent } = req.body;
  transaction.run(
    "INSERT INTO budget (category, amount, spent) VALUES (?, ?, ?)",
    [category, amount, spent],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

app.get("/api/budget", (req, res) => {
  transaction.all("SELECT * FROM budget", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.delete("/api/budget/:id", (req, res) => {
  transaction.run(
    `DELETE FROM budget WHERE id = ?`,
    req.params.id,
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ changes: this.changes });
      }
    }
  );
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
