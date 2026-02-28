import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { register, login, fetchMe, getToken } from '../lib/api';

export default function Auth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { data: user, isLoading: checking } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!getToken(),
  });

  if (user) {
    navigate({ to: '/inbox' });
    return null;
  }

  const registerMut = useMutation({
    mutationFn: () => register(username, email, displayName, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate({ to: '/inbox' });
    },
    onError: (err: Error) => setError(err.message),
  });

  const loginMut = useMutation({
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
    isLogin ? loginMut.mutate() : registerMut.mutate();
  };

  const pending = registerMut.isPending || loginMut.isPending;

  if (checking) {
    return (
      <div className="center-page">
        <div className="loader"><div className="spin" /></div>
      </div>
    );
  }

  return (
    <div className="center-page">
      <div className="landing">
        <img src="/logo-mark.svg" alt="Sema Logo" className="landing-icon" style={{ height: '48px', width: 'auto', marginBottom: '24px' }} />
        <h1>{isLogin ? 'Welcome back' : 'Create your Sema'}</h1>
        <p className="landing-sub">
          {isLogin
            ? 'Log in to check your anonymous messages'
            : 'Get your personal link and start receiving anonymous messages'}
        </p>

        <form onSubmit={handleSubmit} id="auth-form">
          <div className="form-group">
            <span className="form-prefix">sema.link/</span>
            <input
              type="text"
              className="form-input form-input--prefixed"
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
            <div className="form-group">
              <input
                type="email"
                className="form-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                id="email-input"
                autoComplete="email"
              />
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="Display name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={30}
                id="display-name-input"
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder={isLogin ? 'Password' : 'Create a password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              id="password-input"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn-fill"
            disabled={!username.trim() || !password || (!isLogin && !email.trim()) || pending}
            id="auth-submit"
          >
            {pending
              ? isLogin ? 'Logging in...' : 'Creating...'
              : isLogin ? 'Log in' : 'Create my link'}
          </button>
        </form>

        <p className="landing-toggle">
          {isLogin ? (
            <>New here? <button onClick={() => { setIsLogin(false); setError(''); }}>Create an account</button></>
          ) : (
            <>Have an account? <button onClick={() => { setIsLogin(true); setError(''); }}>Log in</button></>
          )}
        </p>

        {isLogin && (
          <p className="landing-toggle" style={{ marginTop: '8px' }}>
            <Link to="/forgot-password" style={{ color: 'var(--gray-2)', fontSize: '13px' }}>Forgot password?</Link>
          </p>
        )}
      </div>
    </div>
  );
}
