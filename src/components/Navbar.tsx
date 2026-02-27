import { useQuery } from '@tanstack/react-query';
import { Link, useRouterState } from '@tanstack/react-router';
import { fetchMe, getToken, getUnreadCount } from '../lib/api';

export default function Navbar() {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const token = getToken();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!token,
  });

  const { data: unread } = useQuery({
    queryKey: ['unread'],
    queryFn: getUnreadCount,
    enabled: !!token && !!user,
    refetchInterval: 5000,
  });

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-icon">💬</div>
          <span>Sema</span>
        </Link>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link
                to="/inbox"
                className={`nav-btn ${currentPath === '/inbox' ? 'active' : ''}`}
                id="nav-inbox"
              >
                📥 Inbox
                {unread != null && unread > 0 && (
                  <span className="nav-btn-badge">{unread > 9 ? '9+' : unread}</span>
                )}
              </Link>
              <Link to="/inbox" className="nav-btn nav-btn-primary" id="nav-share">
                Share Link
              </Link>
            </>
          ) : (
            <Link to="/" className="nav-btn nav-btn-primary" id="nav-get-started">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
