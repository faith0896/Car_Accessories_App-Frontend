// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import logo from "../Images/logo.jpg";

export default function Navbar({ onLoginClick, isLoggedIn, onLogoutClick }) {
  const [popupMessage, setPopupMessage] = useState("");
  const { cartCount } = useCart();
  const { isAdmin, isSuperAdmin } = useAuth();

  const handleProtectedClick = (e, page) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setPopupMessage(
          `Cannot access ${page.charAt(0).toUpperCase() + page.slice(1)} without signing in, please login.`
      );
    }
  };

  return (
      <>
        <nav className="navbar">
          <div className="left-section">
            <div className="logo-box">
              <img src={logo} alt="Logo" className="logo-img" />
            </div>
          </div>

          <Link to="/" className="site-name">
            Car Accessories
          </Link>

          <div className="right-links">
            <Link to="/shop" className="tooltip-container">
              Shop
              <span className="tooltip-text">Shop</span>
            </Link>

            {isLoggedIn && (
                <Link
                    to="/cart"
                    onClick={(e) => handleProtectedClick(e, "cart")}
                    className="tooltip-container cart-link"
                >
                  Cart
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  <span className="tooltip-text">Cart</span>
                </Link>
            )}

            <Link
                to="/orders"
                onClick={(e) => handleProtectedClick(e, "orders")}
                className="tooltip-container"
            >
              Orders
              <span className="tooltip-text">Orders</span>
            </Link>

            {(isAdmin() || isSuperAdmin()) && (
                <Link to="/admin-dashboard" className="tooltip-container">
                  Admin Dashboard
                  <span className="tooltip-text">Admin Dashboard</span>
                </Link>
            )}

            {isSuperAdmin() && (
                <Link to="/super-admin-dashboard" className="tooltip-container">
                  Super Admin Dashboard
                  <span className="tooltip-text">Super Admin Dashboard</span>
                </Link>
            )}

            <div className="nav-divider"></div>

            {isLoggedIn ? (
                <span
                    onClick={onLogoutClick}
                    className="tooltip-container logout-link"
                    style={{ cursor: "pointer" }}
                >
              Logout
              <span className="tooltip-text">Logout</span>
            </span>
            ) : (
                <span
                    onClick={onLoginClick}
                    className="tooltip-container login-link"
                    style={{ cursor: "pointer" }}
                >
              Login
              <span className="tooltip-text">Login</span>
            </span>
            )}
          </div>
        </nav>

        {popupMessage && (
            <div className="popup-overlay" onClick={() => setPopupMessage("")}>
              <div className="popup-box" onClick={(e) => e.stopPropagation()}>
                <p>{popupMessage}</p>
                <div className="popup-actions">
                  <button className="close-btn" onClick={() => setPopupMessage("")}>
                    Close
                  </button>
                  <button
                      className="login-btn"
                      onClick={() => {
                        setPopupMessage("");
                        onLoginClick();
                      }}
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
        )}

        <style>{`
        :root {
          --nav-height: 84px;
        }

        body {
          margin: 0;
          padding-top: var(--nav-height);
        }

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--nav-height);
          background: #001f3f;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          z-index: 1000;
        }

        .left-section {
          display: flex;
          align-items: center;
        }

        .logo-box {
          width: 200px;
          height: auto;
          display: flex;
          align-items: center;
        }

        .logo-img {
          width: 100%;
          height: auto;
          object-fit: contain;
        }

        .site-name {
          font-size: 1.8rem;
          font-weight: bold;
          text-decoration: none;
          color: white;
          flex-grow: 1;
          text-align: center;
          user-select: none;
        }

        .right-links {
          display: flex;
          align-items: center;
          gap: 20px;
          font-size: 1rem;
          font-weight: 500;
        }

        .right-links a, .right-links span {
          color: white;
          text-decoration: none;
          cursor: pointer;
          position: relative;
          padding: 5px 8px;
          border-radius: 4px;
          transition: background-color 0.3s ease, color 0.3s ease;
          user-select: none;
        }

        .right-links a:hover, .right-links span:hover {
          background-color: #003366;
          color: white;
        }

        .cart-badge {
          background: #003366;
          color: white;
          font-size: 12px;
          font-weight: bold;
          border-radius: 50%;
          padding: 2px 6px;
          margin-left: 6px;
          vertical-align: top;
        }

        .tooltip-container {
          position: relative;
          display: inline-block;
        }

        .tooltip-text {
          visibility: hidden;
          opacity: 0;
          position: absolute;
          bottom: -28px;
          left: 50%;
          transform: translateX(-50%);
          background: #003366;
          color: white;
          font-size: 0.8rem;
          padding: 4px 8px;
          border-radius: 6px;
          white-space: nowrap;
          transition: opacity 0.3s;
          pointer-events: none;
          user-select: none;
          z-index: 1500;
        }

        .tooltip-container:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }

        .nav-divider {
          height: 28px;
          width: 1px;
          background: #bbb;
          margin: 0 12px;
        }

        .popup-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .popup-box {
          background: white;
          padding: 20px;
          border-radius: 12px;
          max-width: 350px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .popup-box p {
          margin-bottom: 16px;
          font-size: 1rem;
          color: #333;
        }

        .popup-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .close-btn, .login-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .close-btn {
          background: #ccc;
          color: #222;
        }

        .close-btn:hover {
          background: #aaa;
        }

        .login-btn {
          background: #001f3f;
          color: white;
        }

        .login-btn:hover {
          background: #003366;
        }
      `}</style>
      </>
  );
}
