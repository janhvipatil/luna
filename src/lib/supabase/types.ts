export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Generated from the Supabase schema (profiles + storyboards).
 * Regenerate with: supabase gen types typescript --project-id <ref>
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          brand_kit: Json | null;
          created_at: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          brand_kit?: Json | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          brand_kit?: Json | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ideas: {
        Row: {
          created_at: string;
          id: string;
          source: string;
          text: string;
          updated_at: string;
          used: boolean;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          source?: string;
          text: string;
          updated_at?: string;
          used?: boolean;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          source?: string;
          text?: string;
          updated_at?: string;
          used?: boolean;
          user_id?: string;
        };
        Relationships: [];
      };
      user_ai_settings: {
        Row: {
          created_at: string;
          gemini_images: boolean;
          gemini_key_encrypted: string | null;
          gemini_key_hint: string | null;
          updated_at: string;
          user_id: string;
          video_model: string;
        };
        Insert: {
          created_at?: string;
          gemini_images?: boolean;
          gemini_key_encrypted?: string | null;
          gemini_key_hint?: string | null;
          updated_at?: string;
          user_id?: string;
          video_model?: string;
        };
        Update: {
          created_at?: string;
          gemini_images?: boolean;
          gemini_key_encrypted?: string | null;
          gemini_key_hint?: string | null;
          updated_at?: string;
          user_id?: string;
          video_model?: string;
        };
        Relationships: [];
      };
      generation_jobs: {
        Row: {
          created_at: string;
          error: string | null;
          id: string;
          operation: string | null;
          provider_id: string | null;
          result: Json | null;
          scene_id: string;
          status: string;
          storyboard_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          error?: string | null;
          id?: string;
          operation?: string | null;
          provider_id?: string | null;
          result?: Json | null;
          scene_id: string;
          status?: string;
          storyboard_id: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          error?: string | null;
          id?: string;
          operation?: string | null;
          provider_id?: string | null;
          result?: Json | null;
          scene_id?: string;
          status?: string;
          storyboard_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      storyboards: {
        Row: {
          created_at: string;
          description: string;
          format: string;
          id: string;
          is_shared: boolean;
          music_url: string | null;
          post_caption: string | null;
          scenes: Json;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          format?: string;
          id?: string;
          is_shared?: boolean;
          music_url?: string | null;
          post_caption?: string | null;
          scenes?: Json;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          format?: string;
          id?: string;
          is_shared?: boolean;
          music_url?: string | null;
          post_caption?: string | null;
          scenes?: Json;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type StoryboardRow = Database["public"]["Tables"]["storyboards"]["Row"];
