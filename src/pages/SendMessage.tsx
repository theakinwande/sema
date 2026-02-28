import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, Link } from '@tanstack/react-router';
import { fetchProfile, sendMessage } from '../lib/api';

export default function SendMessage() {
  const { username } = useParams({ from: '/u/$username' });
  const [content, setContent] = useState('');
  const [sent, setSent] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetchProfile(username),
  });

  const sendMut = useMutation({
    mutationFn: () => sendMessage(username, content.trim(), profile?.activePrompt || ''),
    onSuccess: () => { setSent(true); setContent(''); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && profile) sendMut.mutate();
  };

  if (isLoading) {
    return <div className="center-page"><div className="loader"><div className="spin" /></div></div>;
  }

  if (!profile) {
    return (
      <div className="center-page">
        <div className="four04">
          <div className="four04-num">404</div>
          <p className="four04-text">This user doesn't exist</p>
          <Link to="/" className="btn-fill" style={{ display: 'inline-block', width: 'auto', padding: '11px 28px' }}>
            Create your own
          </Link>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="center-page">
        <div className="sent">
          <div className="sent-icon">✓</div>
          <h2>Sent!</h2>
          <p>Your anonymous message was delivered to {profile.displayName}.</p>
          <div className="sent-actions">
            <button className="btn-accent" style={{ width: 'auto', padding: '11px 28px' }} onClick={() => setSent(false)}>
              Send another
            </button>
            <Link to="/" className="btn-outline">Create your own Sema</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="center-page">
      <div className="send-page">
        <div className="avatar">{profile.displayName.charAt(0).toUpperCase()}</div>
        <h1>{profile.displayName}</h1>
        <p className="send-username">@{profile.username}</p>
        <p className="send-prompt">{profile.activePrompt}</p>

        {profile.isExpiringMode && (
          <div style={{ background: 'var(--gray-5)', padding: '8px 16px', borderRadius: '999px', fontSize: '13px', color: 'var(--gray-1)', marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>⏳</span> Messages disappear after 24 hours
          </div>
        )}

        <div className="send-card">
          <form onSubmit={handleSubmit} id="send-form">
            <textarea
              className="send-textarea"
              placeholder="Type your anonymous message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              id="message-textarea"
            />

            {sendMut.isError && (
              <p className="form-error" style={{ marginBottom: '10px' }}>{sendMut.error.message}</p>
            )}

            <button
              type="submit"
              className="btn-accent"
              disabled={!content.trim() || sendMut.isPending}
              id="send-submit"
            >
              {sendMut.isPending ? 'Sending...' : 'Send anonymously'}
            </button>
          </form>
          <p className="send-note">🔒 completely anonymous</p>
        </div>

        <div className="send-footer">
          <p>Want your own anonymous messages?</p>
          <Link to="/" className="link-pill">💬 Create your Sema</Link>
        </div>
      </div>
    </div>
  );
}
