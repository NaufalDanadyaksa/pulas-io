import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link,
} from '@tanstack/react-router';
import { Button, Badge } from '@pulas/ui';
import { Palette, Sparkles, Layout, Users, Shield } from 'lucide-react';

const rootRoute = createRootRoute({
  component: () => (
    <div id="pulas-app-root" className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header id="main-header" className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <Palette className="h-5 w-5" />
          </div>
          <Link to="/" className="text-lg font-bold tracking-tight">
            pulas<span className="text-indigo-600">.io</span>
          </Link>
          <Badge variant="secondary" className="ml-2">MVP v0.1</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" id="btn-docs">
            Docs
          </Button>
          <Button variant="default" size="sm" id="btn-start-drawing">
            <Sparkles className="h-4 w-4" />
            New Canvas
          </Button>
        </div>
      </header>

      <main id="main-content" className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div id="landing-container" className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/70 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
        <Sparkles className="h-4 w-4 text-indigo-600" />
        Hand-drawn Aesthetics • Real-time Collaboration • Multi-Project
      </div>

      <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
        Collaborative Visual Whiteboard for <span className="text-indigo-600 underline decoration-indigo-400 decoration-wavy">Creatives</span>
      </h1>

      <p className="mt-4 max-w-xl text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
        Create diagrams, wireframes, and sketches with a rich hand-drawn feel. Organize projects, share canvases, and collaborate in real-time.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button size="lg" id="cta-create-canvas" className="shadow-md">
          Start Drawing Now
        </Button>
        <Button variant="outline" size="lg" id="cta-view-projects">
          Browse Projects
        </Button>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl text-left">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50">
            <Layout className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">Project → Canvas Hierarchy</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Organize work across multiple projects and nested canvases without losing historical revisions.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">CRDT Realtime Collaboration</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Yjs conflict-free replication with live colored cursor presence and instant broadcast updates.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">Enterprise Access Control</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Granular Row Level Security (RLS) with viewer, editor, and admin role enforcement.
          </p>
        </div>
      </div>
    </div>
  ),
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
