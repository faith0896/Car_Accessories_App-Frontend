import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register({ onClose }) {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        address: "",
        phoneNumber: "",
        role: "BUYER", // fixed role to BUYER
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const { name, email, password, role, address, phoneNumber } = formData;

        if (!name || !email || !password || !role || !address || !phoneNumber) {
            setError("Please fill in all required fields.");
            return;
        }

        // Ensure role is always BUYER for frontend safety
        if (role !== "BUYER") {
            setError("Invalid role. You can only register as a Buyer.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await register(formData);

            alert("Registration successful! Please login.");
            onClose?.();
            navigate("/login");
        } catch (err) {
            console.error("Registration error:", err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.registerBox}>
                <button style={styles.closeBtn} onClick={() => onClose?.()}>
                    ×
                </button>
                <h2 style={styles.title}>Register</h2>

                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleRegister}>
                    <input
                        style={styles.input}
                        name="name"
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <input
                        style={styles.input}
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <input
                        style={styles.input}
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <input
                        style={styles.input}
                        name="address"
                        type="text"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleChange}
                    />
                    <input
                        style={styles.input}
                        name="phoneNumber"
                        type="text"
                        placeholder="Phone Number"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                    />
                    {/* Role is fixed to BUYER and disabled */}
                    <select
                        style={styles.input}
                        name="role"
                        value="BUYER"
                        disabled
                        onChange={handleChange}
                    >
                        <option value="BUYER">Buyer</option>
                    </select>

                    {/* Removed adminCode input */}

                    <button
                        style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                        type="submit"
                        disabled={loading}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#003366")}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "#001f3f")}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p style={styles.switchText}>
                    Already have an account?{" "}
                    <span
                        style={styles.link}
                        onClick={() => {
                            onClose?.();
                            navigate("/login");
                        }}
                    >
                        Login here
                    </span>
                </p>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
    },
    registerBox: {
        position: "relative",
        background: "#fff",
        padding: "30px",
        borderRadius: "12px",
        width: "400px",
        textAlign: "center",
        boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
        borderTop: "6px solid #001f3f",
        color: "#000",
    },
    title: {
        marginBottom: "20px",
        color: "#000",
    },
    input: {
        width: "100%",
        padding: "12px",
        marginBottom: "15px",
        border: "1px solid #000",
        borderRadius: "8px",
        fontSize: "1rem",
        color: "#000",
        backgroundColor: "#fff",
    },
    button: {
        width: "100%",
        padding: "12px",
        background: "#001f3f",
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        fontSize: "1rem",
        cursor: "pointer",
        transition: "0.3s",
        color: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    },
    switchText: {
        marginTop: "1rem",
        fontSize: "0.9rem",
        color: "#000",
    },
    link: {
        fontWeight: "bold",
        cursor: "pointer",
        textDecoration: "underline",
        color: "#000",
    },
    error: {
        color: "red",
        fontSize: "0.85rem",
        marginBottom: "1rem",
    },
    closeBtn: {
        position: "absolute",
        top: "10px",
        right: "12px",
        fontSize: "1.5rem",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#000",
    },
};
