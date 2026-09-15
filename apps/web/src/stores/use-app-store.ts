import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface AppState {
  theme: 'light' | 'dark' | 'system';
  isSidebarOpen: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  immer((set) => ({
    theme: 'light',
    isSidebarOpen: true,
    setTheme: (theme) =>
      set((state) => {
        state.theme = theme;
      }),
    toggleSidebar: () =>
      set((state) => {
        state.isSidebarOpen = !state.isSidebarOpen;
      }),
    setSidebarOpen: (open) =>
      set((state) => {
        state.isSidebarOpen = open;
      }),
  }))
);
