import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { fetchMe, getToken } from '../lib/api';

export default function Landing() {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!getToken(),
  });

  if (user) {
    navigate({ to: '/inbox' });
    return null;
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
            <Link to="/auth" className="btn-fill lp-hero-cta" id="hero-cta">
              Create my link
            </Link>
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
            <h3>Fast & secure</h3>
            <p>Sign up in seconds with email. Password reset built in. Your account stays safe.</p>
          </div>
          <div className="lp-feature">
            <div className="lp-feature-icon">🎤</div>
            <h3>Share anywhere</h3>
            <p>One-tap copy. Drop it in your IG bio, X profile, WhatsApp status, or TikTok.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-section" id="cta">
        <div className="lp-cta-block">
          <h2 className="lp-section-title">Ready to hear the truth?</h2>
          <p className="lp-section-sub">Create your link in seconds — completely free</p>
          <Link to="/auth" className="btn-fill lp-hero-cta" id="cta-btn">
            Get started
          </Link>
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
