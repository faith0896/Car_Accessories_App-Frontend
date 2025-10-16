import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { validateResetToken, resetPassword } from '../services/passwordResetApi';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [expiryMinutes, setExpiryMinutes] = useState(0);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        const emailParam = searchParams.get('email');

        if (!tokenParam) {
            setError('Invalid reset link. Please request a new password reset.');
            setValidating(false);
            return;
        }

        setToken(tokenParam);
        setEmail(emailParam || '');
        validateToken(tokenParam);
    }, [searchParams]);

    const validateToken = async (tokenToValidate) => {
        try {
            const response = await validateResetToken(tokenToValidate);

            if (response.valid) {
                setTokenValid(true);
                setEmail(response.email);
                setUserName(response.name);
                setExpiryMinutes(response.expiryMinutes);
            } else {
                setError(response.error || 'Invalid or expired reset token');
                setTokenValid(false);
            }
        } catch (err) {
            console.error('Token validation error:', err);
            setError('Failed to validate reset token. Please try again.');
            setTokenValid(false);
        } finally {
            setValidating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const passwordValidation = validatePassword(newPassword);
        if (passwordValidation) {
            setError(passwordValidation);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await resetPassword(token, newPassword, confirmPassword);

            if (response.success) {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(response.error || 'Failed to reset password');
            }
        } catch (err) {
            console.error('Password reset error:', err);
            if (err.response?.status === 400) {
                setError('Invalid or expired reset token');
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const validatePassword = (password) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (!/(?=.*[a-z])/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/(?=.*\d)/.test(password)) {
            return 'Password must contain at least one number';
        }
        if (!/(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])/.test(password)) {
            return 'Password must contain at least one special character';
        }
        return null;
    };

    const getPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/(?=.*[a-z])/.test(password)) strength++;
        if (/(?=.*[A-Z])/.test(password)) strength++;
        if (/(?=.*\d)/.test(password)) strength++;
        if (/(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])/.test(password)) strength++;

        if (strength <= 2) return { level: 'weak', color: '#ff4757' };
        if (strength <= 3) return { level: 'medium', color: '#ffa502' };
        if (strength <= 4) return { level: 'good', color: '#2ed573' };
        return { level: 'strong', color: '#2ed573' };
    };

    if (validating) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.iconContainer}>
                        <div style={styles.spinner}></div>
                    </div>
                    <h1 style={styles.title}>Validating Reset Link...</h1>
                    <p style={styles.subtitle}>Please wait while we verify your reset token.</p>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.iconContainer}>
                        <span style={styles.errorIcon}>❌</span>
                    </div>
                    <h1 style={styles.title}>Invalid Reset Link</h1>
                    <p style={styles.subtitle}>{error}</p>
                    <div style={styles.actions}>
                        <Link to="/forgot-password" style={styles.linkButton}>
                            Request New Reset Link
                        </Link>
                        <Link to="/login" style={styles.secondaryLinkButton}>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.iconContainer}>
                        <span style={styles.successIcon}>✅</span>
                    </div>
                    <h1 style={styles.title}>Password Reset Successful!</h1>
                    <p style={styles.subtitle}>
                        Your password has been successfully reset. You can now log in with your new password.
                    </p>
                    <p style={styles.redirectMessage}>
                        Redirecting to login page in 3 seconds...
                    </p>
                    <Link to="/login" style={styles.linkButton}>
                        Go to Login Now
                    </Link>
                </div>
            </div>
        );
    }

    const passwordStrength = newPassword ? getPasswordStrength(newPassword) : null;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.iconContainer}>
                    <span style={styles.icon}>🔐</span>
                </div>
                <h1 style={styles.title}>Reset Your Password</h1>
                <p style={styles.subtitle}>
                    Hello {userName}! Create a new secure password for your account.
                </p>

                {expiryMinutes > 0 && (
                    <div style={styles.expiryWarning}>
                        ⏰ This link expires in {expiryMinutes} minute{expiryMinutes !== 1 ? 's' : ''}
                    </div>
                )}

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            style={{...styles.input, ...styles.disabledInput}}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter your new password"
                            style={styles.input}
                            disabled={loading}
                        />
                        {passwordStrength && (
                            <div style={styles.passwordStrength}>
                                <div
                                    style={{
                                        ...styles.strengthBar,
                                        backgroundColor: passwordStrength.color,
                                        width: passwordStrength.level === 'weak' ? '25%' :
                                            passwordStrength.level === 'medium' ? '50%' :
                                                passwordStrength.level === 'good' ? '75%' : '100%'
                                    }}
                                ></div>
                                <span style={{color: passwordStrength.color}}>
                                    {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                            style={styles.input}
                            disabled={loading}
                        />
                        {confirmPassword && newPassword !== confirmPassword && (
                            <div style={styles.passwordMismatch}>
                                Passwords do not match
                            </div>
                        )}
                    </div>

                    <div style={styles.passwordRequirements}>
                        <h4>Password Requirements:</h4>
                        <ul>
                            <li>At least 8 characters long</li>
                            <li>One uppercase letter</li>
                            <li>One lowercase letter</li>
                            <li>One number</li>
                            <li>One special character</li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                        style={{
                            ...styles.button,
                            opacity: (loading || !newPassword || !confirmPassword || newPassword !== confirmPassword) ? 0.6 : 1,
                            cursor: (loading || !newPassword || !confirmPassword || newPassword !== confirmPassword) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <Link to="/login" style={styles.link}>
                        Back to Login
                    </Link>
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    errorIcon: {
        fontSize: '48px',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto',
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
        marginBottom: '20px',
        lineHeight: '1.5',
    },
    expiryWarning: {
        background: '#fff3cd',
        color: '#FFFFFF',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #ffeaa7',
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
    disabledInput: {
        backgroundColor: '#f8f9fa',
        color: '#faebeb',
        cursor: 'not-allowed',
    },
    button: {
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'transform 0.2s ease',
        cursor: 'pointer',
    },
    linkButton: {
        padding: '12px 24px',
        background: '#001386',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        textDecoration: 'none',
        display: 'inline-block',
        transition: 'background 0.3s ease',
        margin: '5px',
    },
    secondaryLinkButton: {
        padding: '12px 24px',
        background: 'transparent',
        color: '#000830',
        border: '2px solid #667eea',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        textDecoration: 'none',
        display: 'inline-block',
        transition: 'all 0.3s ease',
        margin: '5px',
    },
    footer: {
        borderTop: '1px solid #e1e5e9',
        paddingTop: '20px',
        fontSize: '14px',
        color: '#666',
    },
    link: {
        color: '#1039f6',
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
    passwordStrength: {
        marginTop: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    strengthBar: {
        height: '4px',
        borderRadius: '2px',
        transition: 'all 0.3s ease',
        flex: 1,
        backgroundColor: '#e1e5e9',
    },
    passwordMismatch: {
        color: '#c33',
        fontSize: '12px',
        marginTop: '4px',
    },
    passwordRequirements: {
        background: '#FFFFFF',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'left',
        fontSize: '14px',
    },
    redirectMessage: {
        fontSize: '14px',
        color: '#FFFFFF',
        fontStyle: 'italic',
        marginBottom: '20px',
    },
    actions: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        flexWrap: 'wrap',
    },
};
