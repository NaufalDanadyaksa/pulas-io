---
description: Workflow untuk mengimplementasikan Supabase Authentication (Email, Google OAuth, GitHub OAuth) dan sistem RLS berbasis session. Gunakan setiap kali mengerjakan fitur auth, profil pengguna, atau proteksi route.
---

# Workflow: Authentication & Authorization

## Kapan Digunakan
- Implementasi login/register (Email, Google, GitHub)
- Proteksi route dengan auth guard
- Implementasi profil pengguna
- Mengubah atau menambah RLS policy

## Langkah-langkah

### 1. Setup Supabase Auth Client
```typescript
// apps/web/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@pulas/types/database.types';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,          // simpan session di localStorage
      autoRefreshToken: true,        // refresh token otomatis
      detectSessionInUrl: true,      // handle OAuth callback dari URL
    },
  }
);
```

### 2. Auth Store (Zustand)
```typescript
// apps/web/src/stores/authStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  // Actions
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  session: null,
  isLoading: true,

  initialize: async () => {
    // Ambil session dari storage (tidak trigger network request)
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user ?? null, session, isLoading: false });

    // Subscribe ke perubahan auth state
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, session });
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
```

### 3. Form Login/Register dengan Zod Validation
```typescript
// apps/web/src/features/auth/schemas/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export const registerSchema = loginSchema.extend({
  displayName: z.string().min(2, 'Nama minimal 2 karakter').max(50),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak sama',
  path: ['confirmPassword'],
});
```

```tsx
// apps/web/src/features/auth/components/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
      // Tampilkan error ke user — jangan silent
      toast.error(error.message);
    }
  };

  return (
    <form id="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <input
        id="login-email"
        type="email"
        aria-label="Alamat email"
        aria-describedby={errors.email ? 'login-email-error' : undefined}
        aria-invalid={!!errors.email}
        {...register('email')}
      />
      {errors.email && (
        <span id="login-email-error" role="alert">{errors.email.message}</span>
      )}
      {/* ... password field ... */}
      <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

### 4. OAuth Login
```typescript
// Google OAuth
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) toast.error('Gagal login dengan Google');
};

// GitHub OAuth
const signInWithGitHub = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) toast.error('Gagal login dengan GitHub');
};
```

### 5. Auth Callback Handler (setelah OAuth redirect)
```typescript
// apps/web/src/routes/auth/callback.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase akan handle token dari URL hash secara otomatis
    // onAuthStateChange akan fire, cukup redirect ke dashboard
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate({ to: '/dashboard' });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return <div>Memproses login...</div>;
}
```

### 6. Protected Route Guard
```typescript
// apps/web/src/routes/_authenticated.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: '/login' });
    }
  },
});
```

### 7. Auto-create Profile setelah Registrasi
```sql
-- supabase/migrations/xxx_create_profile_trigger.sql
-- Trigger: buat profil otomatis saat user baru register
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Aturan Auth

- **Jangan simpan token di state manual** — biarkan Supabase Auth manage session
- **Selalu gunakan `anon key`** di client — jangan expose `service_role` key
- **RLS adalah garis pertahanan terakhir** — jangan andalkan auth guard client saja
- **Redirect setelah auth** — selalu redirect ke dashboard atau halaman sebelumnya

## Checklist Auth Feature
- [ ] Login, register, OAuth Google, OAuth GitHub berjalan
- [ ] Form divalidasi dengan Zod sebelum dikirim
- [ ] Error auth ditampilkan ke user (bukan silent)
- [ ] Auth callback `/auth/callback` menangani redirect OAuth
- [ ] Protected routes redirect ke `/login` jika tidak autentikasi
- [ ] Profile auto-created via trigger setelah register
- [ ] RLS policy memproteksi data dari akses tidak sah
