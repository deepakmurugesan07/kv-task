const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// -------------------- DATABASE CONNECTION --------------------
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "roleauth"  // your DB
});

db.connect((err) => {
    if (err) console.log("DB Error:", err);
    else console.log("DB Connected");
});

// -------------------- SIGN-IN (AUTO ROLE ASSIGN) ----------------
app.post("/auth/signin", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) 
        return res.status(400).json({ message: "Username & password required" });

    let role = "User"; // default
    if (username === "deepak" && password === "1123") role = "Admin";

    const employeeList = ["siva", "surya", "monish", "prabu"];
    if (employeeList.includes(username)) role = "Employee";

    const query = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
    db.query(query, [username, password, role], (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).json({ message: "Username already exists" });
            }
            return res.status(500).json({ message: "DB error" });
        }
        res.json({ message: "User created", role });
    });
});

// -------------------- LOGIN ROUTE -----------------------------
app.post("/auth/login", (req, res) => {
    const { username, password } = req.body;

    const q = "SELECT * FROM users WHERE username = ?";
    db.query(q, [username], (err, result) => {
        if (err) return res.status(500).json({ message: "DB error" });
        if (result.length === 0) return res.status(401).json({ message: "User not found" });

        const user = result[0];
        if (user.password !== password) return res.status(401).json({ message: "Wrong password" });

        res.json({
            message: "Login success",
            role: user.role,
            token: "dummy-token"
        });
    });
});

// -------------------- CRUD OPERATIONS -------------------------

// READ (Everyone)
app.get("/products", (req, res) => {
    const query = "SELECT id, name, price, description, category, stock FROM products";
    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ message: "DB error" });
        res.json(result);
    });
});

// CREATE (Admin + Employee)
app.post("/products", (req, res) => {
    const { role } = req.headers;
    if (role === "User") return res.status(403).json({ message: "Not allowed" });

    const { name, price, description, category, stock } = req.body;
    if (!name || !price || !description || !category || !stock)
        return res.status(400).json({ message: "All fields are required" });

    const query = "INSERT INTO products (name, price, description, category, stock) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [name, price, description, category, stock], (err) => {
        if (err) return res.status(500).json({ message: "DB error" });
        res.json({ message: "Product added" });
    });
});

// UPDATE (Admin + Employee)
app.put("/products/:id", (req, res) => {
    const { role } = req.headers;
    if (role === "User") return res.status(403).json({ message: "Not allowed" });

    const { id } = req.params;
    const { name, price, description, category, stock } = req.body;
    if (!name || !price || !description || !category || !stock)
        return res.status(400).json({ message: "All fields are required" });

    const query = "UPDATE products SET name=?, price=?, description=?, category=?, stock=? WHERE id=?";
    db.query(query, [name, price, description, category, stock, id], (err) => {
        if (err) return res.status(500).json({ message: "DB error" });
        res.json({ message: "Product updated" });
    });
});

// DELETE (Admin only)
app.delete("/products/:id", (req, res) => {
    const { role } = req.headers;
    if (role !== "Admin") return res.status(403).json({ message: "Not allowed" });

    const { id } = req.params;
    db.query("DELETE FROM products WHERE id=?", [id], (err) => {
        if (err) return res.status(500).json({ message: "DB error" });
        res.json({ message: "Product deleted" });
    });
});

// -------------------- SERVER -------------------------
app.listen(5000, () => console.log("Server running on port 5000"));
