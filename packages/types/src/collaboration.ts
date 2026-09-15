import type { Point } from './canvas';

export interface UserPresence {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  color: string;
  cursor: Point | null;
  selectedElementIds: string[];
  lastActive: number;
}

export interface BroadcastMessage<T = unknown> {
  type: 'cursor' | 'presence' | 'sync' | 'awareness';
  senderId: string;
  payload: T;
  timestamp: number;
}
