import { useState } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { resetPassword } from '../lib/api';

type ResetPasswordSearch = {
  token?: string;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

export default function ResetPassword() {
  const search = useSearch({ from: '/reset-password' }) as ResetPasswordSearch;
  const token = search.token || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="center-page">
        <div className="four04">
          <div className="four04-num">🔗</div>
          <p className="four04-text">Invalid or missing reset link</p>
          <Link to="/forgot-password" className="btn-fill" style={{ display: 'inline-block', width: 'auto', padding: '11px 28px' }}>
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="center-page">
      <div className="landing">
        {done ? (
          <>
            <div className="landing-icon">✅</div>
            <h1>Password reset!</h1>
            <p className="landing-sub">Your password has been changed. You can now log in with your new password.</p>
            <Link to="/" className="btn-fill" style={{ display: 'inline-block', width: 'auto', padding: '11px 28px' }}>
              Log in
            </Link>
          </>
        ) : (
          <>
            <div className="landing-icon">🔒</div>
            <h1>Set new password</h1>
            <p className="landing-sub">Enter your new password below</p>

            <form onSubmit={handleSubmit} id="reset-form">
              <div className="form-group">
                <input
                  type="password"
                  className="form-input"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  id="reset-password"
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                  id="reset-confirm"
                  autoComplete="new-password"
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <button
                type="submit"
                className="btn-fill"
                disabled={!password || !confirm || loading}
                id="reset-submit"
              >
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
