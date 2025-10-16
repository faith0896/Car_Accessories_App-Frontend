import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login({ onLogin, onClose }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Please enter both email and password");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const userData = await login(email, password);

            if (!userData.role) {
                setError("User role not found. Please contact support.");
                return;
            }

            onLogin && onLogin(userData); // call onLogin if provided
            onClose?.(); // <-- safe call here

            // Redirect based on role
            const role = userData.role.toUpperCase();
            if (role === "SUPER_ADMIN") {
                navigate("/superadmin");
            } else if (role === "ADMIN") {
                navigate("/admin");
            } else if (role === "BUYER") {
                navigate("/");
            } else {
                setError("Unauthorized role");
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                setError("Invalid email or password");
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.loginBox}>
                <button style={styles.closeBtn} onClick={() => onClose?.()}>×</button>

                <h2 style={styles.title}>Login</h2>
                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        style={styles.input}
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        style={styles.input}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        style={{...styles.button, opacity: loading ? 0.7 : 1}}
                        type="submit"
                        disabled={loading}
                        onMouseEnter={e => !loading && (e.currentTarget.style.background = "#003366")}
                        onMouseLeave={e => !loading && (e.currentTarget.style.background = "#001f3f")}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div style={styles.forgotPassword}>
                    <span
                        style={styles.link}
                        onClick={() => {
                            onClose?.();
                            navigate("/forgot-password");
                        }}
                    >
                        Forgot Password?
                    </span>
                </div>

                <p style={styles.switchText}>
                    Don't have an account?{" "}
                    <span
                        style={styles.link}
                        onClick={() => {
                            onClose?.();
                            window.dispatchEvent(new Event("open-register"));
                        }}
                    >
                        Register here
                    </span>
                </p>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
    },
    loginBox: {
        position: "relative",
        background: "#fff",
        padding: "30px",
        borderRadius: "12px",
        width: "350px",
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
        background: "#fff",
        color: "#000",
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
        marginTop: "15px",
        color: "#000",
    },
    link: {
        fontSize: "0.9rem",
        color: "#000",
        cursor: "pointer",
        fontWeight: "bold",
        textDecoration: "underline",
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
    forgotPassword: {
        marginTop: "10px",
        marginBottom: "10px",
        textAlign: "center",
    },
};
