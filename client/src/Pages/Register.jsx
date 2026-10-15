import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { homePathFor } from '../../utils/roles';
import './Auth.css';

// Turns whatever the API sent back into one readable sentence.
function registerErrorMessage(err) {
    const data = err?.response?.data;
    if (!data) return 'Could not reach the server. Please try again.';
    if (Array.isArray(data.errors)) return data.errors.join(' ');                       // Identity errors
    if (data.errors && typeof data.errors === 'object') return Object.values(data.errors).flat().join(' '); // model validation
    return data.message || data.title || 'Registration failed. Please try again.';
}

export default function Register() {
    const { isAuthenticated, user, register } = useAuth();

    const [form, setForm] = useState({
        fullName: '', email: '', dateOfBirth: '', gender: '', phone: '', password: '', confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    if (isAuthenticated) return <Navigate to={homePathFor(user)} replace />;

    // Local date (not UTC) so "today" is right in every time zone
    const today = new Date().toLocaleDateString('en-CA');

    function set(field, value) {
        setForm(f => ({ ...f, [field]: value }));
        setErrors(e => ({ ...e, [field]: '', submit: '' }));
    }

    // Mirrors the server's password rules (8+ characters, upper, lower, digit) so errors show instantly
    function validate() {
        const e = {};
        if (!form.fullName.trim()) e.fullName = 'Full name is required';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address';

        if (!form.dateOfBirth) e.dateOfBirth = 'Date of birth is required';
        else if (form.dateOfBirth > today) e.dateOfBirth = 'Date of birth cannot be in the future';
        if (!form.gender) e.gender = 'Please select a gender';
        if (form.phone && !/^[0-9+()\-\s]{6,20}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number';

        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 8) e.password = 'Use at least 8 characters';
        else if (!/[A-Z]/.test(form.password)) e.password = 'Include an uppercase letter';
        else if (!/[a-z]/.test(form.password)) e.password = 'Include a lowercase letter';
        else if (!/\d/.test(form.password)) e.password = 'Include a number';

        if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
        return e;
    }

    async function handleSubmit(ev) {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }

        setSubmitting(true);
        try {
            await register({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                dateOfBirth: form.dateOfBirth,
                gender: form.gender,
                phone: form.phone.trim(),
                password: form.password,
            });
            // registering also logs you in, so the <Navigate> above takes over
        } catch (err) {
            setErrors({ submit: registerErrorMessage(err) });
            setSubmitting(false);
        }
    }

    function fieldError(name) {
        return errors[name] && (
            <span className="auth-field-error"><i className="ti ti-alert-circle" />{errors[name]}</span>
        );
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

                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">Register as a patient to book and manage your own appointments.</p>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {errors.submit && (
                        <div className="auth-error-banner">
                            <i className="ti ti-alert-triangle" />
                            <span>{errors.submit}</span>
                        </div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="fullName">Full name</label>
                        <input
                            id="fullName"
                            type="text"
                            autoComplete="name"
                            placeholder="e.g. Sita Sharma"
                            value={form.fullName}
                            onChange={e => set('fullName', e.target.value)}
                            className="auth-input"
                            data-error={!!errors.fullName}
                        />
                        {fieldError('fullName')}
                    </div>

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
                        {fieldError('email')}
                    </div>

                    <div className="auth-row">
                        <div className="auth-field">
                            <label htmlFor="dateOfBirth">Date of birth</label>
                            <input
                                id="dateOfBirth"
                                type="date"
                                max={today}
                                autoComplete="bday"
                                value={form.dateOfBirth}
                                onChange={e => set('dateOfBirth', e.target.value)}
                                className="auth-input"
                                data-error={!!errors.dateOfBirth}
                            />
                            {fieldError('dateOfBirth')}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="gender">Gender</label>
                            <select
                                id="gender"
                                value={form.gender}
                                onChange={e => set('gender', e.target.value)}
                                className="auth-input"
                                data-error={!!errors.gender}
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {fieldError('gender')}
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="phone">Phone <span className="auth-optional">(optional)</span></label>
                        <input
                            id="phone"
                            type="tel"
                            autoComplete="tel"
                            placeholder="e.g. 9800000000"
                            value={form.phone}
                            onChange={e => set('phone', e.target.value)}
                            className="auth-input"
                            data-error={!!errors.phone}
                        />
                        {fieldError('phone')}
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <div className="auth-password-wrap">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Create a password"
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
                        {fieldError('password') || (
                            <span className="auth-hint">At least 8 characters, with upper and lower case letters and a number.</span>
                        )}
                    </div>

                    <div className="auth-field">
                        <label htmlFor="confirmPassword">Confirm password</label>
                        <input
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Repeat your password"
                            value={form.confirmPassword}
                            onChange={e => set('confirmPassword', e.target.value)}
                            className="auth-input"
                            data-error={!!errors.confirmPassword}
                        />
                        {fieldError('confirmPassword')}
                    </div>

                    <button type="submit" disabled={submitting} className="auth-submit">
                        {submitting
                            ? <><i className="ti ti-loader-2 auth-spinner" /> Creating account...</>
                            : <><i className="ti ti-user-plus" /> Create Account</>}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
