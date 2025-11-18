import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = axios.create({ baseURL: "http://localhost:5000" });

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "";
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [editingId, setEditingId] = useState(null); // To track editing

  // -------------------- FETCH PRODUCTS --------------------
  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // -------------------- CREATE OR UPDATE PRODUCT --------------------
  const handleSubmit = async () => {
    if (!name || !price || !description || !category || !stock) {
      return alert("Enter all values");
    }

    try {
      if (editingId) {
        // UPDATE
        await API.put(
          `/products/${editingId}`,
          { name, price, description, category, stock },
          { headers: { role } }
        );
        setEditingId(null);
      } else {
        // CREATE
        await API.post(
          "/products",
          { name, price, description, category, stock },
          { headers: { role } }
        );
      }
      // Reset form
      setName(""); setPrice(""); setDescription(""); setCategory(""); setStock("");
      fetchProducts();
    } catch (err) {
      alert("Error saving product");
    }
  };

  // -------------------- EDIT PRODUCT --------------------
  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description);
    setCategory(product.category);
    setStock(product.stock);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
  };

  // -------------------- DELETE PRODUCT --------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await API.delete(`/products/${id}`, { headers: { role } });
      fetchProducts();
    } catch (err) {
      alert("Error deleting product");
    }
  };

  // -------------------- LOGOUT --------------------
  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2>
          <span style={{ color: "#007bff" }}>Welcome </span>
          <span style={styles.roleGradient}>
            {role === "Admin" ? "Admin" : role === "Employee" ? "Employee" : "User"}
          </span>
        </h2>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      {/* ADD / EDIT PRODUCT FORM */}
      {(role === "Admin" || role === "Employee") && (
        <div style={styles.form}>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
          <input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={styles.input} />
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={styles.input} />
          <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} style={styles.input} />
          <input placeholder="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} style={styles.input} />
          <button style={styles.addBtn} onClick={handleSubmit}>
            {editingId ? "Update Product" : "Add Product"}
          </button>
        </div>
      )}

      {/* PRODUCTS TABLE */}
      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Stock</th>
              {role !== "User" && <th style={styles.th}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={styles.tr}>
                <td style={styles.td}>{p.id}</td>
                <td style={styles.td}>{p.name}</td>
                <td style={styles.td}>{p.price}</td>
                <td style={styles.td}>{p.description}</td>
                <td style={styles.td}>{p.category}</td>
                <td style={styles.td}>{p.stock}</td>
                {role !== "User" && (
                  <td style={styles.actionTd}>
                    {(role === "Admin" || role === "Employee") && (
                      <button style={styles.editBtn} onClick={() => handleEdit(p)}>Edit</button>
                    )}
                    {role === "Admin" && (
                      <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>Delete</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// -------------------- STYLES --------------------
const styles = {
  container: { maxWidth: "1100px", margin: "50px auto", padding: "20px", fontFamily: "Arial" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  logoutBtn: { padding: "8px 16px", borderRadius: "5px", border: "none", backgroundColor: "#dc3545", color: "#fff", cursor: "pointer" },

  // Gradient for role
  roleGradient: {
    background: "linear-gradient(90deg, #ff7e5f, #feb47b, #86a8e7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "bold"
  },

  form: { marginBottom: "30px", display: "grid", gridTemplateColumns: "repeat(5, 1fr) auto", gap: "10px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  addBtn: { padding: "10px 15px", borderRadius: "5px", border: "none", backgroundColor: "#28a745", color: "#fff", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", boxShadow: "0 0 5px rgba(0,0,0,0.1)" },
  th: { padding: "12px", textAlign: "left", backgroundColor: "#007bff", color: "#fff", borderBottom: "2px solid #ddd" },
  td: { padding: "12px", borderBottom: "1px solid #ddd" },
  tr: { "&:hover": { backgroundColor: "#f5f5f5" } },
  actionTd: { display: "flex", gap: "10px", padding: "8px" },
  editBtn: { padding: "5px 10px", borderRadius: "5px", border: "none", backgroundColor: "#ffc107", color: "#fff", cursor: "pointer" },
  deleteBtn: { padding: "5px 10px", borderRadius: "5px", border: "none", backgroundColor: "#dc3545", color: "#fff", cursor: "pointer" },
};

export default Dashboard;
