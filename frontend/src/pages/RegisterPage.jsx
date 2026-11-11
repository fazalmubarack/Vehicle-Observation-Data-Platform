import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import Alert from '../components/common/Alert';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError('Please complete all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to register account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Car size={26} color="#ffffff" />
          </div>
          <h1 className="auth-title">Vehicle Observation Data Platform</h1>
          <p className="auth-subtitle">
            Create an analyst account to upload and explore observations
          </p>
        </div>

        <div className="auth-card">
          <h2 className="auth-card-title">Register an analyst account</h2>

          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full name
              </label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="analyst@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password (min. 6 characters)
              </label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-control"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span className="auth-footer-text">Already registered?</span>
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

