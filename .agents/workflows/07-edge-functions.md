---
description: Workflow untuk membuat Supabase Edge Function (Deno) untuk business logic sensitif seperti thumbnail generation, email undangan, audit log, dan webhook handler. Gunakan setiap kali ada logic yang tidak boleh dijalankan di client-side.
---

# Workflow: Supabase Edge Functions

## Kapan Digunakan
- Menghasilkan thumbnail canvas (tidak bisa di client karena butuh server-side rendering)
- Mengirim email undangan ke anggota project
- Webhook handler (misalnya payment, notification)
- Audit log untuk aksi sensitif (hapus project, ubah peran)
- Validasi dan sanitasi data sebelum insert ke DB

## Kapan TIDAK Menggunakan Edge Function
- Data fetching biasa → gunakan Supabase client dari frontend
- Validasi form sederhana → gunakan Zod di frontend
- Operasi CRUD standar yang sudah terlindungi RLS

## Struktur Edge Function

```
supabase/functions/
├── _shared/                    # Shared utilities antar functions
│   ├── cors.ts                 # CORS headers
│   ├── auth.ts                 # Verifikasi JWT helper
│   └── supabase.ts             # Supabase admin client
├── invite-member/
│   └── index.ts                # Kirim email undangan
├── generate-thumbnail/
│   └── index.ts                # Generate canvas thumbnail
└── audit-log/
    └── index.ts                # Catat audit log
```

## Langkah-langkah

### 1. Buat Edge Function Baru
```bash
supabase functions new <nama-function>
# Contoh:
supabase functions new invite-member
supabase functions new generate-thumbnail
```

### 2. Shared: CORS Headers
```typescript
// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

### 3. Shared: Verifikasi Auth
```typescript
// supabase/functions/_shared/auth.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw new Error('Missing authorization header');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');

  return { user, supabase };
}
```

### 4. Contoh: Invite Member Edge Function
```typescript
// supabase/functions/invite-member/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { verifyAuth } from '../_shared/auth.ts';

interface InviteMemberPayload {
  projectId: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verifikasi user yang memanggil
    const { user } = await verifyAuth(req);

    // 2. Parse dan validasi payload
    const payload: InviteMemberPayload = await req.json();
    if (!payload.projectId || !payload.email || !payload.role) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Gunakan service_role untuk admin operations (HANYA di server)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 4. Verifikasi user pemanggil adalah Admin/Owner project
    const { data: membership } = await adminClient
      .from('project_members')
      .select('role')
      .eq('project_id', payload.projectId)
      .eq('user_id', user.id)
      .single();

    const { data: project } = await adminClient
      .from('projects')
      .select('owner_id')
      .eq('id', payload.projectId)
      .single();

    const isAuthorized =
      project?.owner_id === user.id || membership?.role === 'admin';

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Kirim undangan via Supabase Auth Admin
    const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      payload.email,
      { data: { projectId: payload.projectId, role: payload.role } }
    );

    if (inviteError) throw inviteError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### 5. Memanggil Edge Function dari Frontend
```typescript
// apps/web/src/features/project/hooks/useInviteMember.ts
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useInviteMember() {
  return useMutation({
    mutationFn: async ({ projectId, email, role }: InviteMemberPayload) => {
      const { data, error } = await supabase.functions.invoke('invite-member', {
        body: { projectId, email, role },
      });
      if (error) throw error;
      return data;
    },
  });
}
```

### 6. Deploy Edge Function
```bash
# Deploy ke Supabase (semua functions)
supabase functions deploy

# Deploy satu function
supabase functions deploy invite-member

# Set environment variables (secrets)
supabase secrets set RESEND_API_KEY=your-api-key
```

### 7. Test Edge Function Secara Lokal
```bash
# Jalankan functions server lokal
supabase functions serve

# Test dengan curl
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/invite-member' \
  --header 'Authorization: Bearer <JWT_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data '{"projectId":"...", "email":"user@example.com", "role":"editor"}'
```

## Aturan Edge Function

- **`service_role` key HANYA di server** — jangan kirim ke client
- **Selalu validasi auth** di awal setiap function
- **Selalu handle CORS** dengan OPTIONS preflight handler
- **Return HTTP status yang tepat**: 400 (bad input), 403 (forbidden), 500 (server error)
- **Jangan hardcode secrets** — gunakan `Deno.env.get()` dan `supabase secrets set`

## Checklist Edge Function
- [ ] CORS handler (`OPTIONS` preflight) ada
- [ ] Auth diverifikasi di awal function
- [ ] Otorisasi (role check) dilakukan di server, bukan client
- [ ] `service_role` key tidak pernah dikirim ke browser
- [ ] Test lokal dengan `supabase functions serve` berhasil
- [ ] Secrets diset via `supabase secrets set` (bukan di kode)
