import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const email = formData.email.trim();
    const password = formData.password.trim();

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    // Demo login for class project
    if (email === "student@uagc.edu" && password === "Password123") {
      login({
        name: "Student User",
        email,
      });

      navigate("/", { replace: true });
      return;
    }

    setError("Invalid email or password.");
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <p>Please sign in to access the application.</p>

      <form onSubmit={handleSubmit} className="checkout-form">
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        {error && <p className="checkout-error">{error}</p>}

        <button type="submit" className="btn-primary">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;