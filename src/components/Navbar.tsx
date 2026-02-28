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
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="nav-logo">💬</span>
          <span>Sema</span>
        </Link>

        <div className="nav-right">
          {user ? (
            <>
              <Link
                to="/inbox"
                className={`nav-link ${currentPath === '/inbox' ? '' : ''}`}
                id="nav-inbox"
              >
                Inbox
                {unread != null && unread > 0 && (
                  <span className="nav-link-badge">{unread > 9 ? '9+' : unread}</span>
                )}
              </Link>
              <Link to="/inbox" className="nav-cta" id="nav-share">
                Share
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth" className="nav-link" id="nav-login">
                Log in
              </Link>
              <Link to="/auth" className="nav-cta" id="nav-signup">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
