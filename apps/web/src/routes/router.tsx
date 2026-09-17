import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link,
  useNavigate,
  redirect,
} from '@tanstack/react-router';
import { Button, Badge, Avatar, AvatarFallback, AvatarImage } from '@pulas/ui';
import { Palette, Sparkles, Layout, Users, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { AuthCallbackPage } from '@/features/auth/pages/AuthCallbackPage';
import { AuthenticatedLayout, requireAuthGuard } from './_authenticated';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';

function RootHeader() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/login' });
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      id="main-header"
      className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
          <Palette className="h-5 w-5" />
        </div>
        <Link to="/" className="text-lg font-bold tracking-tight">
          pulas<span className="text-indigo-600">.io</span>
        </Link>
        <Badge variant="secondary" className="ml-2">
          MVP v0.1
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" id="nav-btn-dashboard">
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2 border-l border-zinc-200 pl-3 dark:border-zinc-800">
              <Avatar className="h-8 w-8 border border-zinc-200 shadow-2xs dark:border-zinc-700">
                <AvatarImage
                  src={user.user_metadata?.avatar_url}
                  alt={displayName}
                />
                <AvatarFallback className="bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                id="nav-btn-signout"
                onClick={handleSignOut}
                className="text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
              >
                Keluar
              </Button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost" size="sm" id="nav-btn-login">
                Masuk
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="default" size="sm" id="nav-btn-register">
                Daftar Gratis
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <div
      id="pulas-app-root"
      className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
    >
      <RootHeader />
      <main id="main-content" className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    const { user } = useAuthStore();

    return (
      <div
        id="landing-container"
        className="flex flex-col items-center justify-center px-4 py-16 text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/70 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          Hand-drawn Aesthetics • Real-time Collaboration • Multi-Project
        </div>

        <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          Collaborative Visual Whiteboard for{' '}
          <span className="text-indigo-600 underline decoration-indigo-400 decoration-wavy">
            Creatives
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
          Create diagrams, wireframes, and sketches with a rich hand-drawn feel.
          Organize projects, share canvases, and collaborate in real-time.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to={user ? '/dashboard' : '/register'}>
            <Button size="lg" id="cta-create-canvas" className="shadow-md">
              Mulai Menggambar Sekarang
            </Button>
          </Link>
          <Link to={user ? '/dashboard' : '/login'}>
            <Button variant="outline" size="lg" id="cta-view-projects">
              Buka Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl text-left">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50">
              <Layout className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">
              Project → Canvas Hierarchy
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Organize work across multiple projects and nested canvases without losing historical revisions.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">
              CRDT Realtime Collaboration
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Yjs conflict-free replication with live colored cursor presence and instant broadcast updates.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">
              Enterprise Access Control
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Granular Row Level Security (RLS) with viewer, editor, and admin role enforcement.
            </p>
          </div>
        </div>
      </div>
    );
  },
});

const redirectIfAuthenticated = async () => {
  const authStore = useAuthStore.getState();
  if (!authStore.isInitialized) {
    await authStore.initialize();
  }
  if (useAuthStore.getState().user) {
    throw redirect({ to: '/dashboard' });
  }
};

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: redirectIfAuthenticated,
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  beforeLoad: redirectIfAuthenticated,
  component: RegisterPage,
});

const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  component: AuthCallbackPage,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_authenticated',
  beforeLoad: requireAuthGuard,
  component: AuthenticatedLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const projectDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/projects/$projectId',
  component: () => (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h2 className="text-xl font-bold">Project Detail View</h2>
      <p className="text-sm text-zinc-500 mt-2">
        Fitur manajemen canvas dalam project akan hadir di Fase 1.5.
      </p>
    </div>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  authCallbackRoute,
  authenticatedRoute.addChildren([dashboardRoute, projectDetailRoute]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
