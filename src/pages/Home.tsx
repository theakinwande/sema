import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { register, login, fetchMe, getToken } from '../lib/api';
import { PROMPTS } from '../lib/types';

export default function Landing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Check if already logged in
  const { data: user, isLoading: checkingAuth } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!getToken(),
  });

  if (user) {
    navigate({ to: '/inbox' });
    return null;
  }

  const registerMutation = useMutation({
    mutationFn: () => register(username, displayName, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate({ to: '/inbox' });
    },
    onError: (err: Error) => setError(err.message),
  });

  const loginMutation = useMutation({
    mutationFn: () => login(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate({ to: '/inbox' });
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      loginMutation.mutate();
    } else {
      registerMutation.mutate();
    }
  };

  const isPending = registerMutation.isPending || loginMutation.isPending;

  // Scrolling marquee items
  const marqueeItems = [...PROMPTS, ...PROMPTS];

  if (checkingAuth) {
    return (
      <div className="page-center">
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

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
              <div key={i} className="marquee-item">{prompt}</div>
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
              autoComplete="username"
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

          <input
            type="password"
            className="landing-input landing-input-simple"
            placeholder={isLogin ? 'Password' : 'Create a password (min 6 chars)'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            id="password-input"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />

          {error && <p className="landing-error">{error}</p>}

          <button
            type="submit"
            className="landing-btn"
            disabled={!username.trim() || !password || isPending}
            id="landing-submit"
          >
            {isPending
              ? isLogin ? 'Logging in...' : 'Creating...'
              : isLogin ? '→ Log In' : '✦ Create My Link'}
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
