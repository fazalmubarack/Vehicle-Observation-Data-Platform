import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Lock, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Alert from '../components/common/Alert';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoFill = () => {
    setEmail('demo.analyst@example.com');
    setPassword('InterviewDemo123!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to sign in. Please check your credentials.'
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
            Sign in to access datasets, analytics, and spatial histograms
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-card-top">
            <h2 className="auth-card-title">Sign in to your account</h2>
            <button
              type="button"
              className="demo-autofill-btn"
              onClick={handleDemoFill}
              title="Autofill evaluation demo credentials"
            >
              <Sparkles size={14} />
              <span>Fill Demo Credentials</span>
            </button>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

          <form onSubmit={handleSubmit} className="auth-form">
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
                Password
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
                  autoComplete="current-password"
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span className="auth-footer-text">Don't have an account yet?</span>
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

