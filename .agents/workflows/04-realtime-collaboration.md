---
description: Workflow untuk mengimplementasikan fitur kolaborasi real-time menggunakan Yjs (CRDT) dan Supabase Realtime Broadcast. Gunakan setiap kali mengerjakan fitur multi-user editing, cursor presence, atau conflict resolution.
---

# Workflow: Real-time Collaboration (Yjs + Supabase Realtime)

## Kapan Digunakan
- Implementasi multi-user canvas editing
- Implementasi cursor presence (live cursor)
- Implementasi collaborative undo/redo
- Implementasi indikator "siapa yang sedang online"

## Arsitektur Kolaborasi

```
User A (Editor)                  Supabase Realtime              User B (Editor)
     │                                   │                            │
     │  Yjs local doc update             │                            │
     │  (encodes CRDT binary update)     │                            │
     │──────────────────────────────────►│                            │
     │                        Broadcast ke channel:                   │
     │                        canvas:{canvasId}                       │
     │                                   │───────────────────────────►│
     │                                   │            Yjs decode update│
     │                                   │            apply ke local doc
     │                                   │            re-render canvas │
     │◄──────────────────────────────────│                            │
     │    Presence update                │◄───────────────────────────│
     │    (cursor User B)                │    cursor move B           │
```

## Setup Yjs + Supabase

### 1. Inisialisasi Yjs Document per Canvas
```typescript
// apps/web/src/lib/yjs.ts
import * as Y from 'yjs';
import { supabase } from './supabase';
import type { CanvasElement } from '@pulas/types';

// Map: canvasId → YDoc (singleton per canvas session)
const yjsDocs = new Map<string, Y.Doc>();

export function getOrCreateYDoc(canvasId: string): Y.Doc {
  if (yjsDocs.has(canvasId)) return yjsDocs.get(canvasId)!;

  const doc = new Y.Doc();
  yjsDocs.set(canvasId, doc);
  return doc;
}

export function destroyYDoc(canvasId: string) {
  const doc = yjsDocs.get(canvasId);
  doc?.destroy();
  yjsDocs.delete(canvasId);
}
```

### 2. Hook Kolaborasi Utama
```typescript
// apps/web/src/features/canvas/hooks/useCollaboration.ts
import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { getOrCreateYDoc, destroyYDoc } from '@/lib/yjs';
import { supabase } from '@/lib/supabase';
import { useCanvasStore } from '../stores/canvasStore';

interface CollabUser {
  userId: string;
  displayName: string;
  color: string;
  cursor: { x: number; y: number } | null;
}

export function useCollaboration(canvasId: string, userId: string) {
  const channelRef = useRef<ReturnType<typeof supabase.channel>>();
  const setCollabUsers = useCanvasStore((s) => s.setCollabUsers);

  useEffect(() => {
    const doc = getOrCreateYDoc(canvasId);
    const yElements = doc.getArray<CanvasElement>('elements');

    // Subscribe ke Supabase Realtime channel
    const channel = supabase.channel(`canvas:${canvasId}`, {
      config: { broadcast: { self: false } }, // jangan terima update sendiri
    });
    channelRef.current = channel;

    // 1. Terima update CRDT dari user lain
    channel.on('broadcast', { event: 'yjs-update' }, ({ payload }) => {
      const update = new Uint8Array(payload.update);
      Y.applyUpdate(doc, update);
    });

    // 2. Terima cursor presence dari user lain
    channel.on('broadcast', { event: 'cursor-move' }, ({ payload }) => {
      setCollabUsers((prev) => ({
        ...prev,
        [payload.userId]: {
          ...prev[payload.userId],
          cursor: payload.cursor,
        },
      }));
    });

    // 3. Kirim Yjs update saat dokumen lokal berubah
    doc.on('update', (update: Uint8Array, origin: string) => {
      if (origin === 'remote') return; // hindari echo loop
      channel.send({
        type: 'broadcast',
        event: 'yjs-update',
        payload: { update: Array.from(update) },
      });
    });

    // 4. Presence: track siapa yang online
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<CollabUser>();
      const users = Object.values(state).flat();
      setCollabUsers(
        Object.fromEntries(users.map((u) => [u.userId, u]))
      );
    });

    channel
      .subscribe()
      .track({ userId, displayName: 'User', color: generateUserColor(userId), cursor: null });

    return () => {
      channel.unsubscribe();
      destroyYDoc(canvasId);
    };
  }, [canvasId, userId]);

  return { channelRef };
}

// Deterministik: user yang sama selalu dapat warna yang sama
function generateUserColor(userId: string): string {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
  const index = userId.charCodeAt(0) % colors.length;
  return colors[index];
}
```

### 3. Kirim Cursor Position
```typescript
// Panggil ini saat mouse move di canvas
export function useCursorBroadcast(canvasId: string, userId: string) {
  const channelRef = useCollaborationChannel(canvasId);
  const throttleRef = useRef<ReturnType<typeof setTimeout>>();

  const broadcastCursor = useCallback((x: number, y: number) => {
    // Throttle 50ms agar tidak flood channel (max 20 update/detik)
    clearTimeout(throttleRef.current);
    throttleRef.current = setTimeout(() => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'cursor-move',
        payload: { userId, cursor: { x, y } },
      });
    }, 50);
  }, [userId]);

  return { broadcastCursor };
}
```

## Aturan Kolaborasi

1. **Jangan kirim seluruh state canvas** — hanya kirim Yjs binary update (delta, sangat kecil)
2. **Throttle cursor broadcast** — maksimal 20 update/detik (50ms throttle)
3. **`self: false`** — channel tidak menerima broadcast dari diri sendiri
4. **Origin check** — tandai update sebagai `'remote'` saat apply dari network, cegah echo loop
5. **Cleanup wajib** — `channel.unsubscribe()` dan `destroyYDoc()` di effect cleanup
6. **Conflict resolution** — sepenuhnya ditangani Yjs (CRDT); tidak perlu "last write wins"

## Checklist Collaboration Feature
- [ ] Yjs doc di-destroy saat user menutup canvas (memory leak prevention)
- [ ] Cursor broadcast di-throttle (≤ 20 updates/detik)
- [ ] Tidak ada echo loop (origin check atau `self: false`)
- [ ] Presence state di-cleanup saat user disconnect
- [ ] Test: dua tab browser berbeda bisa edit canvas bersamaan
- [ ] Test: cursor user lain terlihat bergerak real-time
