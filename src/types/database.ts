export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          nickname: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          nickname?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nickname?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          category: Database['public']['Enums']['session_category'];
          title: string | null;
          total_tokens: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: Database['public']['Enums']['session_category'];
          title?: string | null;
          total_tokens?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: Database['public']['Enums']['session_category'];
          title?: string | null;
          total_tokens?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          session_id: string;
          role: Database['public']['Enums']['message_role'];
          content: string;
          tokens_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: Database['public']['Enums']['message_role'];
          content: string;
          tokens_used?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: Database['public']['Enums']['message_role'];
          content?: string;
          tokens_used?: number;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: Database['public']['Enums']['subscription_plan'];
          status: Database['public']['Enums']['subscription_status'];
          stripe_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: Database['public']['Enums']['subscription_plan'];
          status?: Database['public']['Enums']['subscription_status'];
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: Database['public']['Enums']['subscription_plan'];
          status?: Database['public']['Enums']['subscription_status'];
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_points: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          updated_at?: string;
        };
      };
      diagnoses: {
        Row: {
          id: string;
          user_id: string | null;
          type: string;
          answers: Json;
          result: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type: string;
          answers: Json;
          result: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          type?: string;
          answers?: Json;
          result?: Json;
          created_at?: string;
        };
      };
      knowledge: {
        Row: {
          id: string;
          content: string;
          embedding: unknown;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          embedding?: unknown;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          embedding?: unknown;
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      session_category: 'love' | 'life' | 'relationship';
      message_role: 'user' | 'assistant' | 'system';
      subscription_plan: 'free' | 'light' | 'premium';
      subscription_status: 'active' | 'canceled' | 'past_due';
    };
  };
};
