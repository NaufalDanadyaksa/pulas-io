import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider, ToastViewport } from '@pulas/ui';
import { router } from './routes/router';
import { queryClient } from './lib/query-client';
import { useAuthStore } from './stores/authStore';
import './index.css';

// Initialize Supabase auth session listener on start
useAuthStore.getState().initialize();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
        <ToastViewport />
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
