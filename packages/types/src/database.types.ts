export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProjectRole = 'viewer' | 'editor' | 'admin';
export type ShareAccess = 'view' | 'edit';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: ProjectRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role?: ProjectRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          role?: ProjectRole;
          created_at?: string;
        };
      };
      canvases: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          data: Json;
          thumbnail_url: string | null;
          order_index: number;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          name?: string;
          data?: Json;
          thumbnail_url?: string | null;
          order_index?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          data?: Json;
          thumbnail_url?: string | null;
          order_index?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      canvas_shares: {
        Row: {
          id: string;
          canvas_id: string;
          share_token: string;
          access: ShareAccess;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          canvas_id: string;
          share_token?: string;
          access?: ShareAccess;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          canvas_id?: string;
          share_token?: string;
          access?: ShareAccess;
          expires_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      project_role: ProjectRole;
      share_access: ShareAccess;
    };
  };
}
