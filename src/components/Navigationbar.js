import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Navbar({ cartCount = 0 }) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navigationbar">
      <h1 className="logo">StreamList</h1>

      <div className="navigationlinks">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Home
        </NavLink>

        <NavLink
          to="/movies"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Movies
        </NavLink>

        <NavLink
          to="/subscriptions"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Subscriptions
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          {isAuthenticated ? `Cart (${cartCount})` : "Cart"}
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Orders
        </NavLink>

        <NavLink
          to="/cards"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Cards
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          About
        </NavLink>

        {isAuthenticated && (
          <button
            type="button"
            className="btn-danger"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;