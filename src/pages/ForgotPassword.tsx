import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { forgotPassword } from '../lib/api';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-page">
      <div className="landing">
        {sent ? (
          <>
            <div className="landing-icon">✉️</div>
            <h1>Check your email</h1>
            <p className="landing-sub">
              If an account exists for <strong>{email}</strong>, we've sent password reset instructions.
            </p>
            <Link to="/" className="btn-fill" style={{ display: 'inline-block', width: 'auto', padding: '11px 28px' }}>
              Back to login
            </Link>
          </>
        ) : (
          <>
            <div className="landing-icon">🔑</div>
            <h1>Forgot password?</h1>
            <p className="landing-sub">
              Enter the email you registered with and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} id="forgot-form">
              <div className="form-group">
                <input
                  type="email"
                  className="form-input"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  id="forgot-email"
                  autoComplete="email"
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <button
                type="submit"
                className="btn-fill"
                disabled={!email.trim() || loading}
                id="forgot-submit"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <p className="landing-toggle" style={{ marginTop: '20px' }}>
              Remember it? <Link to="/" style={{ fontWeight: 600, textDecoration: 'underline' }}>Log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
