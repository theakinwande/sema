import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { createProfile, getCurrentUser, setCurrentUser } from '../lib/api';
import { PROMPTS } from '../lib/types';

export default function Landing() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  // Check if already logged in
  const currentUser = getCurrentUser();
  if (currentUser) {
    navigate({ to: '/inbox' });
    return null;
  }

  const createMutation = useMutation({
    mutationFn: () => createProfile(username, displayName),
    onSuccess: () => {
      navigate({ to: '/inbox' });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleLogin = () => {
    const normalized = username.toLowerCase().trim();
    if (!normalized) {
      setError('Enter your username');
      return;
    }
    // Check if profile exists in localStorage
    const profiles = JSON.parse(localStorage.getItem('sema_profiles') || '{}');
    if (profiles[normalized]) {
      setCurrentUser(normalized);
      navigate({ to: '/inbox' });
    } else {
      setError('Username not found. Create an account first!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      handleLogin();
    } else {
      createMutation.mutate();
    }
  };

  // Duplicate prompts for seamless marquee
  const marqueeItems = [...PROMPTS, ...PROMPTS];

  return (
    <div className="page-center">
      <div className="landing">
        <div className="landing-logo">💬</div>

        <h1 className="landing-title">
          Get honest.<br />
          <span>Stay anonymous.</span>
        </h1>

        <p className="landing-sub">
          Create your personal Sema link and share it with friends.
          Receive anonymous messages — no names, no filters.
        </p>

        <div className="marquee-wrapper">
          <div className="marquee-track">
            {marqueeItems.map((prompt, i) => (
              <div key={i} className="marquee-item">
                {prompt}
              </div>
            ))}
          </div>
        </div>

        <form className="landing-form" onSubmit={handleSubmit} id="landing-form">
          <div className="input-group">
            <span className="input-prefix">sema.link/</span>
            <input
              type="text"
              className="landing-input"
              placeholder="yourname"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                setError('');
              }}
              maxLength={20}
              id="username-input"
            />
          </div>

          {!isLogin && (
            <input
              type="text"
              className="landing-input landing-input-simple"
              placeholder="Display name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={30}
              id="display-name-input"
            />
          )}

          {error && <p className="landing-error">{error}</p>}

          <button
            type="submit"
            className="landing-btn"
            disabled={!username.trim() || createMutation.isPending}
            id="landing-submit"
          >
            {createMutation.isPending
              ? 'Creating...'
              : isLogin
              ? '→ Log In'
              : '✦ Create My Link'}
          </button>
        </form>

        <p className="landing-login-link">
          {isLogin ? (
            <>
              Don't have a link?{' '}
              <button onClick={() => { setIsLogin(false); setError(''); }}>Create one</button>
            </>
          ) : (
            <>
              Already have a link?{' '}
              <button onClick={() => { setIsLogin(true); setError(''); }}>Log in</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
