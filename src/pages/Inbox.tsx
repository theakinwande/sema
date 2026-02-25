import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  getCurrentUser,
  fetchInbox,
  fetchProfile,
  toggleFavorite,
  deleteMessage,
  markAsRead,
  updatePrompt,
  logoutUser,
} from '../lib/api';
import { PROMPTS, formatTimeAgo } from '../lib/types';

export default function Inbox() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const [tab, setTab] = useState<'all' | 'favorites'>('all');
  const [copied, setCopied] = useState(false);

  // Redirect if not logged in
  if (!currentUser) {
    navigate({ to: '/' });
    return null;
  }

  const { data: profile } = useQuery({
    queryKey: ['profile', currentUser],
    queryFn: () => fetchProfile(currentUser),
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['inbox', currentUser],
    queryFn: () => fetchInbox(currentUser),
    refetchInterval: 5000,
  });

  const favMutation = useMutation({
    mutationFn: (id: string) => toggleFavorite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });

  const promptMutation = useMutation({
    mutationFn: (prompt: string) => updatePrompt(currentUser, prompt),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  const handleCopy = useCallback(() => {
    const link = `${window.location.origin}/u/${currentUser}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [currentUser]);

  const handleMarkRead = useCallback(
    (id: string) => {
      markAsRead(id).then(() => {
        queryClient.invalidateQueries({ queryKey: ['inbox'] });
        queryClient.invalidateQueries({ queryKey: ['unread'] });
      });
    },
    [queryClient]
  );

  const handleLogout = () => {
    logoutUser();
    navigate({ to: '/' });
  };

  const filteredMessages = messages?.filter((m) =>
    tab === 'favorites' ? m.isFavorite : true
  );

  const shareLink = `${window.location.origin}/u/${currentUser}`;

  return (
    <div className="page-container">
      {/* Share bar */}
      <div className="inbox-share-bar" id="share-bar">
        <span className="inbox-share-link">{shareLink}</span>
        <button
          className={`share-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          id="copy-link-btn"
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>

      {/* Prompt selector */}
      <div className="prompt-section">
        <p className="prompt-label">Your active prompt:</p>
        <div className="prompt-selector" id="prompt-selector">
          {PROMPTS.map((prompt) => (
            <button
              key={prompt}
              className={`prompt-chip ${profile?.activePrompt === prompt ? 'active' : ''}`}
              onClick={() => promptMutation.mutate(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="inbox-header">
        <h1 className="inbox-title">Inbox</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="inbox-count">
            {messages?.length || 0} message{messages?.length !== 1 ? 's' : ''}
          </span>
          <button className="nav-btn nav-btn-ghost" onClick={handleLogout} id="logout-btn">
            Log out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" id="inbox-tabs">
        <button
          className={`tab-btn ${tab === 'all' ? 'active' : ''}`}
          onClick={() => setTab('all')}
        >
          All
        </button>
        <button
          className={`tab-btn ${tab === 'favorites' ? 'active' : ''}`}
          onClick={() => setTab('favorites')}
        >
          ⭐ Favorites
        </button>
      </div>

      {/* Messages */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Loading messages...</span>
        </div>
      ) : filteredMessages && filteredMessages.length > 0 ? (
        <div className="message-list" id="message-list">
          {filteredMessages.map((msg, i) => (
            <div
              key={msg.id}
              className={`message-card ${!msg.isRead ? 'unread' : ''}`}
              style={{ animationDelay: `${i * 50}ms` } as React.CSSProperties}
              onClick={() => !msg.isRead && handleMarkRead(msg.id)}
              id={`message-${msg.id}`}
            >
              <p className="message-content">{msg.content}</p>
              <div className="message-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="message-time">{formatTimeAgo(msg.createdAt)}</span>
                  <span className="message-prompt-tag">{msg.prompt}</span>
                </div>
                <div className="message-actions">
                  <button
                    className={`message-action-btn ${msg.isFavorite ? 'fav-active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      favMutation.mutate(msg.id);
                    }}
                    title="Favorite"
                  >
                    {msg.isFavorite ? '★' : '☆'}
                  </button>
                  <button
                    className="message-action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(msg.id);
                    }}
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p className="empty-title">
            {tab === 'favorites' ? 'No favorites yet' : 'No messages yet'}
          </p>
          <p className="empty-sub">
            {tab === 'favorites'
              ? 'Star messages to add them here'
              : 'Share your link with friends to start receiving anonymous messages!'}
          </p>
          {tab === 'all' && (
            <button className="share-btn" onClick={handleCopy}>
              📋 Copy your link
            </button>
          )}
        </div>
      )}
    </div>
  );
}
