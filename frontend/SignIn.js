import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000" });

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await API.post("/auth/signin", formData);
      setLoading(false);
      setMessage(res.data.message);

      // Navigate to login page after sign in
      navigate("/login", { state: { username: formData.username } });
    } catch (err) {
      setMessage(err.response?.data?.message || "Error");
      setLoading(false);
    }
  };
  

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "30px", border: "1px solid #ccc", borderRadius: "10px", boxShadow: "0 0 15px rgba(0,0,0,0.1)", backgroundColor: "#f9f9f9" }}>
      <h2 style={{ textAlign: "center", marginBottom: "25px" }}>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", borderRadius: "5px", border: "none", backgroundColor: "#007bff", color: "#fff", fontWeight: "bold", cursor: "pointer" }}>
          {loading ? "Processing..." : "Sign In / Register"}
        </button>
      </form>
      {message && <p style={{ color: "green", textAlign: "center", marginTop: "15px" }}>{message}</p>}

      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Already have an account? <span style={{ color: "#007bff", cursor: "pointer" }} onClick={() => navigate("/login")}>Login</span>
      </p>
    </div>
  );
};

export default SignIn;
