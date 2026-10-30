export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      assignments: {
        Row: {
          created_at: string;
          created_by: string | null;
          date: string;
          id: string;
          member_id: string;
          shift_type_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          date: string;
          id?: string;
          member_id: string;
          shift_type_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          date?: string;
          id?: string;
          member_id?: string;
          shift_type_id?: string;
        };
        Relationships: [];
      };
      holidays: {
        Row: { date: string; name: string };
        Insert: { date: string; name: string };
        Update: { date?: string; name?: string };
        Relationships: [];
      };
      members: {
        Row: {
          color: string;
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          role: string;
          sort_order: number;
          user_id: string | null;
        };
        Insert: {
          color?: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          role?: string;
          sort_order?: number;
          user_id?: string | null;
        };
        Update: {
          color?: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          role?: string;
          sort_order?: number;
          user_id?: string | null;
        };
        Relationships: [];
      };
      shift_types: {
        Row: {
          color_token: string;
          id: string;
          label: string;
          period: string;
          short: string;
          sort_order: number;
        };
        Insert: {
          color_token: string;
          id: string;
          label: string;
          period: string;
          short: string;
          sort_order?: number;
        };
        Update: {
          color_token?: string;
          id?: string;
          label?: string;
          period?: string;
          short?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      swap_requests: {
        Row: {
          created_at: string;
          id: string;
          note: string | null;
          requester_date: string;
          requester_id: string;
          status: string;
          target_date: string | null;
          target_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          note?: string | null;
          requester_date: string;
          requester_id: string;
          status?: string;
          target_date?: string | null;
          target_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          note?: string | null;
          requester_date?: string;
          requester_id?: string;
          status?: string;
          target_date?: string | null;
          target_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      accept_swap: { Args: { swap_id: string }; Returns: undefined };
      claim_member: { Args: Record<string, never>; Returns: string };
      current_member_id: { Args: Record<string, never>; Returns: string };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
