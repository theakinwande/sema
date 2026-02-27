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

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Navbar />
      <Outlet />
    </>
  ),
});

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

const routeTree = rootRoute.addChildren([indexRoute, sendRoute, inboxRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
