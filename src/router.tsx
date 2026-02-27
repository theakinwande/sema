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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

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

const forgotRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: ForgotPassword,
});

const resetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: ResetPassword,
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || '',
  }),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  sendRoute,
  inboxRoute,
  forgotRoute,
  resetRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
