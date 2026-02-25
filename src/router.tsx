import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import Navbar from './components/Navbar';
import Landing from './pages/Home';
import SendMessage from './pages/SendMessage';
import Inbox from './pages/Inbox';

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Navbar />
      <Outlet />
    </>
  ),
});

// Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Landing,
});

const sendRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/u/$username',
  component: SendMessage,
});

const inboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inbox',
  component: Inbox,
});

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  sendRoute,
  inboxRoute,
]);

// Router
export const router = createRouter({ routeTree });

// Type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
