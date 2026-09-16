# Walkthrough — Fase 1.3: Authentication

**Tanggal Selesai:** 2026-09-16  
**Fase yang Dikerjakan:** Fase 1.3 (Authentication)

---

## Ringkasan Perubahan

### File Baru
1. **`apps/web/src/lib/supabase.ts`**:
   - Inisialisasi Supabase client dengan typed `Database` dari `@pulas/types`.
   - Konfigurasi `persistSession: true`, `autoRefreshToken: true`, dan `detectSessionInUrl: true`.
2. **`apps/web/src/stores/authStore.ts`**:
   - Zustand store untuk mengelola state autentikasi: `user`, `session`, `isLoading`, `isInitialized`.
   - Actions: `initialize()`, `signOut()`.
   - Subscription ke `supabase.auth.onAuthStateChange` untuk sinkronisasi state login secara otomatis.
3. **`apps/web/src/features/auth/schemas/auth.schema.ts`**:
   - Validasi schema menggunakan Zod: `loginSchema`, `registerSchema` (dengan password match refinement), `resetPasswordSchema`, dan `updatePasswordSchema`.
   - Ekspor TypeScript types yang terinferensi (`LoginInput`, `RegisterInput`, dll.).
4. **`apps/web/src/features/auth/components/OAuthButtons.tsx`**:
   - Komponen tombol OAuth untuk Google dan GitHub yang terhubung dengan `supabase.auth.signInWithOAuth`.
   - Callback error handling dan accessible icon SVG & aria attributes.
5. **`apps/web/src/features/auth/components/LoginForm.tsx`**:
   - Form masuk dengan React Hook Form + Zod resolver.
   - Indikator loading, error alert banner, dan link ke reset password.
6. **`apps/web/src/features/auth/components/RegisterForm.tsx`**:
   - Form pendaftaran akun dengan konfirmasi kata sandi dan pengiriman metadata `full_name` agar auto-create row di tabel `profiles` melalui trigger database Supabase.
   - Status banner cek email jika akun membutuhkan verifikasi email.
7. **`apps/web/src/features/auth/components/ForgotPasswordDialog.tsx`**:
   - Modal dialog Radix UI untuk pengiriman email reset password via `supabase.auth.resetPasswordForEmail`.
8. **`apps/web/src/features/auth/pages/LoginPage.tsx` & `RegisterPage.tsx`**:
   - Halaman auth modern dengan kartu estetika premium, integrasi OAuth, form credentials, dan tautan navigasi.
9. **`apps/web/src/features/auth/pages/AuthCallbackPage.tsx` & `apps/web/src/routes/auth/callback.tsx`**:
   - Handler callback OAuth dan konfirmasi email untuk redirect otomatis ke `/dashboard`.
10. **`apps/web/src/routes/_authenticated.tsx`**:
    - Layout guard autentikasi (`requireAuthGuard`) yang memproteksi rute privat dan mengalihkan akses tanpa sesi ke `/login`.
11. **`apps/web/src/features/dashboard/pages/DashboardPage.tsx`**:
    - Halaman dashboard awal terautentikasi: menampilkan profil pengguna, status sesi Supabase, badge verifikasi, metrik cepat, dan tombol logout.
12. **Suite Pengujian Unit & Komponen**:
    - `apps/web/src/features/auth/__tests__/auth.schema.test.ts` (10 tests)
    - `apps/web/src/features/auth/__tests__/authStore.test.ts` (3 tests)
    - `apps/web/src/features/auth/__tests__/LoginForm.test.tsx` (4 tests)
    - `apps/web/src/features/auth/__tests__/RegisterForm.test.tsx` (4 tests)
    - `apps/web/src/features/auth/__tests__/OAuthButtons.test.tsx` (4 tests)
    - `apps/web/src/routes/__tests__/routeGuards.test.ts` (2 tests)

### File Dimodifikasi
- **`apps/web/src/routes/router.tsx`**:
  - Konfigurasi TanStack Router dengan rute `/login`, `/register`, `/auth/callback`, serta nested layout `_authenticated` yang memproteksi rute `/dashboard`.
  - Integrasi header dinamis di root route (menampilkan menu Masuk/Daftar jika unauthenticated, atau Avatar + Dashboard + Logout jika authenticated).
- **`apps/web/src/main.tsx`**:
  - Panggilan `useAuthStore.getState().initialize()` saat startup aplikasi.
- **`apps/web/vite.config.ts` & `apps/web/tsconfig.json`**:
  - Konfigurasi alias `@/*` mengarah ke `./src/*`.
- **`apps/web/package.json`**:
  - Penambahan script `"test": "vitest run"` dan dependencies testing (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`).
- **`turbo.json`**:
  - Penyesuaian output task `test` untuk integrasi Turborepo cache yang optimal.
- **`.agents/task.md`**:
  - Pembaruan seluruh checklist Fase 1.3 menjadi selesai (`[x]`).

---

## Langkah Pengujian Manual

1. **Jalankan Aplikasi Web Secara Lokal**:
   ```bash
   pnpm --filter @pulas/web dev
   ```
   Buka `http://localhost:5173`.
   - **Expected result:** Header landing page menampilkan tombol "Masuk" dan "Daftar Gratis".

2. **Coba Akses Rute Terproteksi Langsung**:
   Ketik `http://localhost:5173/dashboard` di address bar browser.
   - **Expected result:** Rute langsung di-redirect ke `http://localhost:5173/login`.

3. **Pengujian Halaman Login & Registrasi**:
   - Buka `http://localhost:5173/login`.
   - Coba submit form kosong: error validasi field muncul ("Email wajib diisi", "Password minimal 8 karakter").
   - Klik "Lupa sandi?": modal `ForgotPasswordDialog` terbuka dengan input email pemulihan.
   - Klik "Daftar sekarang": navigasi berpindah ke `http://localhost:5173/register`.
   - Isi form register dengan konfirmasi password tidak sama: muncul pesan "Konfirmasi password tidak sesuai".

4. **Pengujian OAuth Buttons**:
   - Pada halaman login/register, tombol "Lanjutkan dengan Google" dan "Lanjutkan dengan GitHub" tersedia dengan SVG icon resmi dan status loading saat diklik.

---

## Pengujian Otomatis

### 1. Typecheck Monorepo (TypeScript Strict Mode)
```bash
pnpm run typecheck
```
- **Hasil:** 5 dari 5 paket lulus validasi tanpa error (`@pulas/types`, `@pulas/utils`, `@pulas/canvas-core`, `@pulas/ui`, `@pulas/web`).

### 2. Unit & Component Test Suite
```bash
pnpm run test
```
- **Hasil:** 49 test passing (22 di packages canvas-core & utils + 27 di apps/web).
  - 10 tests `auth.schema.test.ts`
  - 4 tests `LoginForm.test.tsx`
  - 4 tests `RegisterForm.test.tsx`
  - 4 tests `OAuthButtons.test.tsx`
  - 3 tests `authStore.test.ts`
  - 2 tests `routeGuards.test.ts`

### 3. Production Build
```bash
pnpm run build
```
- **Hasil:** Bundling Vite & tsc berhasil tanpa error, file output siap di `apps/web/dist/`.

---

## Known Issues / Catatan
- Provider OAuth (Google Console & GitHub App) memerlukan konfigurasi Client ID & Secret di dashboard project Supabase (`kdewomubuegtahadzihz.supabase.co`) dan redirect URI `https://<project-ref>.supabase.co/auth/v1/callback` serta origin lokal `http://localhost:5173/auth/callback`.
- Fitur auto-create profile di tabel `profiles` telah terintegrasi dengan trigger database `handle_new_user()` yang membaca `full_name` dari metadata registrasi.
