import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { homePathFor } from '../../utils/roles';
import './Auth.css';

function loginErrorMessage(err) {
    if (!err?.response) return 'Could not reach the server. Please try again.';
    return err.response.data?.message || 'Could not sign in. Please try again.';
}

export default function Login() {
    const { isAuthenticated, user, login } = useAuth();
    const location = useLocation();
    // Back to where they were headed, otherwise to the right home page for their role
    const from = location.state?.from?.pathname || homePathFor(user);

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Already logged in (or just logged in): send them on to where they were headed
    if (isAuthenticated) return <Navigate to={from} replace />;

    function set(field, value) {
        setForm(f => ({ ...f, [field]: value }));
        setErrors(e => ({ ...e, [field]: '', submit: '' }));
    }

    function validate() {
        const e = {};
        if (!form.email.trim()) e.email = 'Email is required';
        if (!form.password) e.password = 'Password is required';
        return e;
    }

    async function handleSubmit(ev) {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }

        setSubmitting(true);
        try {
            await login(form.email.trim(), form.password);
            // isAuthenticated is now true, so the <Navigate> above takes over
        } catch (err) {
            setErrors({ submit: loginErrorMessage(err) });
            setSubmitting(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="auth-brand-icon"><i className="ti ti-heart-rate-monitor" /></div>
                    <div>
                        <div className="auth-brand-name">AllCare HMS</div>
                        <div className="auth-brand-sub">Hospital Management System</div>
                    </div>
                </div>

                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to your account to continue.</p>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {errors.submit && (
                        <div className="auth-error-banner">
                            <i className="ti ti-alert-triangle" />
                            <span>{errors.submit}</span>
                        </div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@allcare.com"
                            value={form.email}
                            onChange={e => set('email', e.target.value)}
                            className="auth-input"
                            data-error={!!errors.email}
                        />
                        {errors.email && (
                            <span className="auth-field-error"><i className="ti ti-alert-circle" />{errors.email}</span>
                        )}
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <div className="auth-password-wrap">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder="Your password"
                                value={form.password}
                                onChange={e => set('password', e.target.value)}
                                className="auth-input"
                                data-error={!!errors.password}
                            />
                            <button
                                type="button"
                                className="auth-password-toggle"
                                onClick={() => setShowPassword(s => !s)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                <i className={`ti ti-${showPassword ? 'eye-off' : 'eye'}`} />
                            </button>
                        </div>
                        {errors.password && (
                            <span className="auth-field-error"><i className="ti ti-alert-circle" />{errors.password}</span>
                        )}
                    </div>

                    <button type="submit" disabled={submitting} className="auth-submit">
                        {submitting
                            ? <><i className="ti ti-loader-2 auth-spinner" /> Signing in...</>
                            : <><i className="ti ti-login" /> Sign In</>}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Register</Link>
                </div>
            </div>
        </div>
    );
}
