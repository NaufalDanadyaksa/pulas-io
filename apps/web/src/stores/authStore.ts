import { create } from 'zustand';
import type { User, Session, Subscription } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

let authSubscription: Subscription | null = null;

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      set({
        user: session?.user ?? null,
        session: session ?? null,
        isLoading: false,
        isInitialized: true,
      });

      if (authSubscription) {
        authSubscription.unsubscribe();
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        set({
          user: session?.user ?? null,
          session: session ?? null,
          isLoading: false,
        });
      });

      authSubscription = subscription;
    } catch (error) {
      console.error('Failed to initialize auth store:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
    } finally {
      set({ user: null, session: null, isLoading: false });
    }
  },
}));
