import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { register, login, fetchMe, getToken } from '../lib/api';

export default function Landing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLDivElement>(null);
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

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="lp">
      {/* Hero */}
      <section className="lp-hero" id="hero">
        <div className="lp-hero-inner">
          <span className="lp-badge">💬 Anonymous messaging</span>
          <h1 className="lp-hero-title">
            Get honest messages<br />from your friends
          </h1>
          <p className="lp-hero-sub">
            Create your personal Sema link, share it anywhere, and receive
            completely anonymous messages. No names, no tracking.
          </p>
          <div className="lp-hero-actions">
            <button className="btn-fill lp-hero-cta" onClick={scrollToForm} id="hero-cta">
              Create my link
            </button>
            <a href="#how" className="lp-hero-link">See how it works ↓</a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="lp-section" id="how">
        <h2 className="lp-section-title">How it works</h2>
        <p className="lp-section-sub">Three simple steps to start receiving anonymous messages</p>

        <div className="lp-steps">
          <div className="lp-step">
            <div className="lp-step-num">1</div>
            <h3>Create your link</h3>
            <p>Pick a username and get your personal Sema link in seconds.</p>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">2</div>
            <h3>Share it</h3>
            <p>Post your link on social media, bios, or send it to friends directly.</p>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">3</div>
            <h3>Get messages</h3>
            <p>Receive anonymous messages in your inbox. Read, favorite, or delete them.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="lp-section lp-section--alt" id="features">
        <h2 className="lp-section-title">Why Sema?</h2>
        <p className="lp-section-sub">Built for honesty, designed for simplicity</p>

        <div className="lp-features">
          <div className="lp-feature">
            <div className="lp-feature-icon">🔒</div>
            <h3>Completely anonymous</h3>
            <p>Senders are never tracked. No IPs, no cookies, no logs. True anonymity.</p>
          </div>
          <div className="lp-feature">
            <div className="lp-feature-icon">✨</div>
            <h3>Custom prompts</h3>
            <p>Choose from 10 conversation starters to encourage different types of messages.</p>
          </div>
          <div className="lp-feature">
            <div className="lp-feature-icon">📥</div>
            <h3>Real-time inbox</h3>
            <p>Messages appear instantly. Star your favorites, mark as read, or clean up.</p>
          </div>
          <div className="lp-feature">
            <div className="lp-feature-icon">📱</div>
            <h3>Works everywhere</h3>
            <p>No app to download. Your link works on any device, any browser.</p>
          </div>
          <div className="lp-feature">
            <div className="lp-feature-icon">⚡</div>
            <h3>Fast & simple</h3>
            <p>Create your link in under 10 seconds. Simple email signup.</p>
          </div>
          <div className="lp-feature">
            <div className="lp-feature-icon">🎤</div>
            <h3>Share anywhere</h3>
            <p>One-tap copy. Drop it in your IG bio, X profile, WhatsApp status, or TikTok.</p>
          </div>
        </div>
      </section>

      {/* CTA / Auth */}
      <section className="lp-section" id="signup" ref={formRef}>
        <h2 className="lp-section-title">
          {isLogin ? 'Welcome back' : 'Ready to get started?'}
        </h2>
        <p className="lp-section-sub">
          {isLogin
            ? 'Log in to check your messages'
            : 'Create your link in seconds — completely free'}
        </p>

        <div className="lp-form-wrap">
          <form onSubmit={handleSubmit} id="landing-form" className="lp-form">
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
              id="landing-submit"
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
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <span className="lp-footer-brand">💬 Sema</span>
          <span className="lp-footer-copy">Get honest. Stay anonymous.</span>
        </div>
      </footer>
    </div>
  );
}
