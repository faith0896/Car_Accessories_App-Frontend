// src/components/Footer.jsx
import React from "react";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-section">
                <h4>Contact Us</h4>
                <p>Email: info@caraccessories.com</p>
                <p>Phone: +1 (123) 456-7890</p>
            </div>
            <div className="footer-section">
                <h4>Location</h4>
                <p>123 Car Street, Auto City, CA 90210</p>
            </div>
            <div className="footer-section">
                <h4>Services</h4>
                <ul>
                    <li>Product Sales</li>
                    <li>Installation</li>
                    <li>Maintenance Tips</li>
                </ul>
            </div>
            <div className="footer-section">
                <h4>Follow Us</h4>
                <div className="social-links">
                    <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
                    <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
                    <a href="#" target="_blank" rel="noopener noreferrer">TikTok</a>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Car Accessories. All rights reserved.</p>
            </div>

            <style>{`
        .footer {
          background: #001f3f;
          color: white;
          padding: 40px 24px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-around;
          align-items: flex-start;
          gap: 30px;
          font-size: 0.9rem;
          margin-top: 60px;
        }
        .footer-section {
          flex: 1;
          min-width: 200px;
          margin-bottom: 20px;
        }
        .footer-section h4 {
          color: #fff;
          margin-bottom: 15px;
          font-size: 1.1rem;
          border-bottom: 1px solid #003366;
          padding-bottom: 5px;
        }
        .footer-section p,
        .footer-section ul {
          margin: 0;
          padding: 0;
          list-style: none;
          line-height: 1.8;
        }
        .footer-section ul li {
          margin-bottom: 5px;
        }
        .footer-section a {
          color: white;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .footer-section a:hover {
          color: #007bff;
        }
        .social-links a {
          display: inline-block;
          margin-right: 15px;
          font-size: 1.2rem;
        }
        .footer-bottom {
          width: 100%;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #003366;
          margin-top: 20px;
          font-size: 0.8rem;
        }
      `}</style>
        </footer>
    );
}
