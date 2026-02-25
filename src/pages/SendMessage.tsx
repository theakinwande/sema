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

  const sendMutation = useMutation({
    mutationFn: () => sendMessage(username, content.trim(), profile!.activePrompt),
    onSuccess: () => {
      setSent(true);
      setContent('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && profile) {
      sendMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="page-center">
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-center">
        <div className="not-found">
          <div className="not-found-code">404</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            This user doesn't exist yet
          </p>
          <Link to="/" className="landing-btn" style={{ display: 'inline-block', width: 'auto', padding: '12px 32px' }}>
            Create your own Sema link
          </Link>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="page-center">
        <div className="sent-success">
          <div className="sent-icon">✅</div>
          <h2 className="sent-title">Message Sent!</h2>
          <p className="sent-sub">Your anonymous message has been delivered to {profile.displayName}.</p>

          <button
            className="landing-btn"
            style={{ maxWidth: '300px', margin: '0 auto var(--space-md)' }}
            onClick={() => setSent(false)}
          >
            Send another
          </button>

          <div className="send-footer">
            <p>Want your own anonymous messages?</p>
            <Link to="/" className="send-footer-cta">
              💬 Create your Sema link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-center">
      <div className="profile-page" style={{ width: '100%', maxWidth: 'var(--max-width)' }}>
        <div className="profile-avatar">
          {profile.displayName.charAt(0).toUpperCase()}
        </div>
        <h1 className="profile-name">{profile.displayName}</h1>
        <p className="profile-username">@{profile.username}</p>
        <p className="profile-prompt">{profile.activePrompt}</p>

        <form className="send-form" onSubmit={handleSubmit} id="send-form">
          <textarea
            className="send-textarea"
            placeholder="Type your anonymous message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            id="message-textarea"
          />

          <button
            type="submit"
            className="send-btn"
            disabled={!content.trim() || sendMutation.isPending}
            id="send-submit"
          >
            {sendMutation.isPending ? 'Sending...' : '🔒 Send Anonymously'}
          </button>
        </form>

        <div className="send-footer">
          <p>👀 Your identity is completely hidden</p>
          <Link to="/" className="send-footer-cta">
            💬 Create your own Sema link
          </Link>
        </div>
      </div>
    </div>
  );
}
