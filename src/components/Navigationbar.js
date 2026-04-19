import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ConfirmDialog from "./ConfirmDialog";

function Navbar({ cartCount = 0 }) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setLogoutDialogOpen(false);
    navigate("/login");
  };

  const cancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <nav className="navigationbar">
      <ConfirmDialog
        isOpen={logoutDialogOpen}
        title="Logout?"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />

      <h1 className="logo">StreamList</h1>

      <div className="navigationlinks">
        <NavLink
          to="/streamlist"
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
            onClick={handleLogoutClick}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;