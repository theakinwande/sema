import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  fetchMe, getToken, fetchInbox, toggleFavorite,
  deleteMessage, markAsRead, updatePrompt, logout,
} from '../lib/api';
import { PROMPTS, formatTimeAgo } from '../lib/types';

export default function Inbox() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'all' | 'fav'>('all');
  const [copied, setCopied] = useState(false);
  const token = getToken();

  const { data: user, isLoading: authLoad } = useQuery({
    queryKey: ['me'], queryFn: fetchMe, enabled: !!token,
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['inbox'], queryFn: fetchInbox, enabled: !!user, refetchInterval: 5000,
  });

  const favMut = useMutation({
    mutationFn: (id: string) => toggleFavorite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inbox'] }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inbox'] }); qc.invalidateQueries({ queryKey: ['unread'] }); },
  });

  const promptMut = useMutation({
    mutationFn: (p: string) => updatePrompt(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });

  const handleCopy = useCallback(() => {
    if (!user) return;
    navigator.clipboard.writeText(`${window.location.origin}/u/${user.username}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [user]);

  const handleRead = useCallback((id: string) => {
    markAsRead(id).then(() => {
      qc.invalidateQueries({ queryKey: ['inbox'] });
      qc.invalidateQueries({ queryKey: ['unread'] });
    });
  }, [qc]);

  const handleLogout = () => { logout(); qc.clear(); navigate({ to: '/' }); };

  if (authLoad) {
    return <div className="page"><div className="loader"><div className="spin" /></div></div>;
  }

  if (!token || !user) { navigate({ to: '/' }); return null; }

  const list = messages?.filter((m) => tab === 'fav' ? m.isFavorite : true);
  const link = `${window.location.origin}/u/${user.username}`;

  return (
    <div className="page">
      <div className="share-bar">
        <span className="share-link">{link}</span>
        <button className={`copy-btn ${copied ? 'copy-btn--done' : ''}`} onClick={handleCopy} id="copy-btn">
          {copied ? '✓ Copied' : 'Copy link'}
        </button>
      </div>

      <div className="prompts">
        <p className="prompts-label">Active prompt</p>
        <div className="prompts-row" id="prompts">
          {PROMPTS.map((p) => (
            <button key={p} className={`chip ${user.activePrompt === p ? 'chip--on' : ''}`} onClick={() => promptMut.mutate(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="inbox-top">
        <h1 className="inbox-title">Inbox</h1>
        <div className="inbox-meta">
          <span>{messages?.length || 0} messages</span>
          <button className="logout-link" onClick={handleLogout} id="logout">Log out</button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'all' ? 'tab--on' : ''}`} onClick={() => setTab('all')}>All</button>
        <button className={`tab ${tab === 'fav' ? 'tab--on' : ''}`} onClick={() => setTab('fav')}>Favorites</button>
      </div>

      {isLoading ? (
        <div className="loader"><div className="spin" /><span className="loader-text">Loading...</span></div>
      ) : list && list.length > 0 ? (
        <div className="msg-list" id="messages">
          {list.map((m) => (
            <div
              key={m._id}
              className={`msg ${!m.isRead ? 'msg--new' : ''}`}
              onClick={() => !m.isRead && handleRead(m._id)}
              id={`msg-${m._id}`}
            >
              <p className="msg-text">{m.content}</p>
              <div className="msg-row">
                <div className="msg-info">
                  <span className="msg-time">{formatTimeAgo(m.createdAt)}</span>
                  {m.prompt && <span className="msg-tag">{m.prompt}</span>}
                </div>
                <div className="msg-btns">
                  <button
                    className={`msg-btn ${m.isFavorite ? 'msg-btn--fav' : ''}`}
                    onClick={(e) => { e.stopPropagation(); favMut.mutate(m._id); }}
                  >
                    {m.isFavorite ? '★' : '☆'}
                  </button>
                  <button
                    className="msg-btn msg-btn--del"
                    onClick={(e) => { e.stopPropagation(); delMut.mutate(m._id); }}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <p className="empty-title">{tab === 'fav' ? 'No favorites' : 'No messages yet'}</p>
          <p className="empty-sub">{tab === 'fav' ? 'Star messages to save them' : 'Share your link to get started'}</p>
          {tab === 'all' && <button className="copy-btn" onClick={handleCopy}>Copy link</button>}
        </div>
      )}
    </div>
  );
}
