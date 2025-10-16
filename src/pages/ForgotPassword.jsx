import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/passwordResetApi';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await requestPasswordReset(email);

            if (response.success) {
                setMessage(response.message);
                setSubmitted(true);
            } else {
                setError(response.error || 'Failed to send reset email');
            }
        } catch (err) {
            console.error('Password reset error:', err);
            if (err.response?.status === 429) {
                setError('Too many requests. Please wait before trying again.');
            } else {
                setError('An error occurred. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    if (submitted) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    {/* Removed envelope icon container */}
                    {/* <div style={styles.iconContainer}>
                        <span style={styles.successIcon}>✉️</span>
                    </div> */}
                    <h1 style={styles.title}>Check Your Email</h1>
                    <p style={styles.message}>{message}</p>
                    <div style={styles.instructions}>
                        <h3>What's next?</h3>
                        <ul style={styles.instructionList}>
                            <li>Check your email inbox (and spam folder)</li>
                            <li>Click the reset link in the email</li>
                            <li>The link will expire in 15 minutes</li>
                            <li>Create a new secure password</li>
                        </ul>
                    </div>
                    <div style={styles.actions}>
                        <button
                            style={styles.secondaryButton}
                            onClick={() => {
                                setSubmitted(false);
                                setEmail('');
                                setMessage('');
                            }}
                        >
                            Send Another Email
                        </button>
                        <Link to="/login" style={styles.linkButton}>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Removed lock icon container */}
                {/* <div style={styles.iconContainer}>
                    <span style={styles.icon}>🔒</span>
                </div> */}
                <h1 style={styles.title}>Forgot Password?</h1>
                <p style={styles.subtitle}>
                    No worries! Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && <div style={styles.error}>{error}</div>}
                {message && <div style={styles.success}>{message}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            style={styles.input}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email}
                        style={{
                            ...styles.button,
                            opacity: (loading || !email) ? 0.6 : 1,
                            cursor: (loading || !email) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p>
                        Remember your password?{' '}
                        <Link to="/login" style={styles.link}>
                            Back to Login
                        </Link>
                    </p>
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" style={styles.link}>
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF',
        padding: '20px',
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        textAlign: 'center',
    },
    iconContainer: {
        marginBottom: '20px',
    },
    icon: {
        fontSize: '48px',
    },
    successIcon: {
        fontSize: '48px',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#666',
        marginBottom: '30px',
        lineHeight: '1.5',
    },
    form: {
        marginBottom: '30px',
    },
    inputGroup: {
        marginBottom: '20px',
        textAlign: 'left',
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        border: '2px solid #e1e5e9',
        borderRadius: '8px',
        fontSize: '16px',
        transition: 'border-color 0.3s ease',
        outline: 'none',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '14px',
        background: '#007BFF',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'transform 0.2s ease',
        cursor: 'pointer',
    },
    secondaryButton: {
        padding: '10px 20px',
        background: 'transparent',
        color: '#007BFF',
        border: '2px solid #007BFF',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        marginRight: '10px',
        transition: 'all 0.3s ease',
    },
    linkButton: {
        padding: '10px 20px',
        background: '#0056b3',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        textDecoration: 'none',
        display: 'inline-block',
        transition: 'background 0.3s ease',
    },
    footer: {
        borderTop: '1px solid #e1e5e9',
        paddingTop: '20px',
        fontSize: '14px',
        color: '#666',
    },
    link: {
        color: '#007BFF',
        textDecoration: 'none',
        fontWeight: '600',
    },
    error: {
        background: '#fee',
        color: '#c33',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #fcc',
    },
    success: {
        background: '#efe',
        color: '#007BFF',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #cfc',
    },
    message: {
        fontSize: '16px',
        color: '#333',
        marginBottom: '20px',
        lineHeight: '1.5',
    },
    instructions: {
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'left',
    },
    instructionList: {
        margin: '10px 0',
        paddingLeft: '20px',
    },
    actions: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        flexWrap: 'wrap',
    },
};
