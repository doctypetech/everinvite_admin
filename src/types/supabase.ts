export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      event_translations: {
        Row: {
          created_at: string
          event_id: string
          id: string
          locale: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          locale: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          locale?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_translations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      faq: {
        Row: {
          answer_html: string
          created_at: string
          id: string
          is_published: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer_html: string
          created_at?: string
          id?: string
          is_published?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer_html?: string
          created_at?: string
          id?: string
          is_published?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      faq_translations: {
        Row: {
          answer_html: string
          created_at: string
          faq_id: string
          id: string
          locale: string
          question: string
          updated_at: string
        }
        Insert: {
          answer_html: string
          created_at?: string
          faq_id: string
          id?: string
          locale: string
          question: string
          updated_at?: string
        }
        Update: {
          answer_html?: string
          created_at?: string
          faq_id?: string
          id?: string
          locale?: string
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faq_translations_faq_id_fkey"
            columns: ["faq_id"]
            isOneToOne: false
            referencedRelation: "faq"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          created_at: string
          error_rows: number
          file_name: string | null
          finished_at: string | null
          id: string
          imported_by: string | null
          organization_id: string
          processed_rows: number
          source: string
          success_rows: number
          total_rows: number
        }
        Insert: {
          created_at?: string
          error_rows?: number
          file_name?: string | null
          finished_at?: string | null
          id?: string
          imported_by?: string | null
          organization_id: string
          processed_rows?: number
          source?: string
          success_rows?: number
          total_rows?: number
        }
        Update: {
          created_at?: string
          error_rows?: number
          file_name?: string | null
          finished_at?: string | null
          id?: string
          imported_by?: string | null
          organization_id?: string
          processed_rows?: number
          source?: string
          success_rows?: number
          total_rows?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      import_invitee_rows: {
        Row: {
          batch_id: string
          created_at: string
          error_message: string | null
          id: string
          normalized: Json | null
          processed_at: string | null
          raw_data: Json
          row_number: number
          status: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          normalized?: Json | null
          processed_at?: string | null
          raw_data: Json
          row_number: number
          status?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          normalized?: Json | null
          processed_at?: string | null
          raw_data?: Json
          row_number?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_invitee_rows_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      invitee_rsvps: {
        Row: {
          guests_count: number
          id: string
          invitee_id: string
          response: string
          source: string
          submitted_at: string
        }
        Insert: {
          guests_count: number
          id?: string
          invitee_id: string
          response: string
          source?: string
          submitted_at?: string
        }
        Update: {
          guests_count?: number
          id?: string
          invitee_id?: string
          response?: string
          source?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitee_rsvps_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "invitees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitee_rsvps_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "v_invitee_trivia_detailed"
            referencedColumns: ["invitee_id"]
          },
          {
            foreignKeyName: "invitee_rsvps_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "v_invitees_trivia_summary"
            referencedColumns: ["invitee_id"]
          },
        ]
      }
      invitees: {
        Row: {
          access_code: string
          attending_guests: number
          company: string | null
          created_at: string
          full_name: string
          id: string
          max_guests_allowed: number
          organization_id: string
          phone_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          access_code: string
          attending_guests?: number
          company?: string | null
          created_at?: string
          full_name: string
          id?: string
          max_guests_allowed?: number
          organization_id: string
          phone_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          access_code?: string
          attending_guests?: number
          company?: string | null
          created_at?: string
          full_name?: string
          id?: string
          max_guests_allowed?: number
          organization_id?: string
          phone_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_aliases: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          kind: string
          organization_id: string
          updated_at: string
          value: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          kind: string
          organization_id: string
          updated_at?: string
          value: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          kind?: string
          organization_id?: string
          updated_at?: string
          value?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_aliases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_content_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_content_translations: {
        Row: {
          content: Json
          created_at: string
          id: string
          locale: string
          organization_content_id: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          locale: string
          organization_content_id: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          locale?: string
          organization_content_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_content_translations_fk"
            columns: ["organization_content_id"]
            isOneToOne: false
            referencedRelation: "organization_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_content_translations_fk"
            columns: ["organization_content_id"]
            isOneToOne: false
            referencedRelation: "v_org_content_edit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_content_translations_fk"
            columns: ["organization_content_id"]
            isOneToOne: false
            referencedRelation: "v_organization_content_ordered"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_qr_code_active: boolean
          is_reservation_action: boolean
          is_trivia_active: boolean
          name: string
          slug: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_qr_code_active?: boolean
          is_reservation_action?: boolean
          is_trivia_active?: boolean
          name: string
          slug: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_qr_code_active?: boolean
          is_reservation_action?: boolean
          is_trivia_active?: boolean
          name?: string
          slug?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      template_translations: {
        Row: {
          created_at: string
          id: string
          locale: string
          metadata: Json
          name: string
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          locale: string
          metadata?: Json
          name: string
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          locale?: string
          metadata?: Json
          name?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_translations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_types: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          name: string
          template_type_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          template_type_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          template_type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_template_type_id_fkey"
            columns: ["template_type_id"]
            isOneToOne: false
            referencedRelation: "template_types"
            referencedColumns: ["id"]
          },
        ]
      }
      trivia_answers: {
        Row: {
          created_at: string
          id: string
          invitee_id: string | null
          option_id: string
          organization_id: string
          question_id: string
          respondent_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitee_id?: string | null
          option_id: string
          organization_id: string
          question_id: string
          respondent_name: string
        }
        Update: {
          created_at?: string
          id?: string
          invitee_id?: string | null
          option_id?: string
          organization_id?: string
          question_id?: string
          respondent_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "trivia_answers_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "invitees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trivia_answers_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "v_invitee_trivia_detailed"
            referencedColumns: ["invitee_id"]
          },
          {
            foreignKeyName: "trivia_answers_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "v_invitees_trivia_summary"
            referencedColumns: ["invitee_id"]
          },
          {
            foreignKeyName: "trivia_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "trivia_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trivia_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "v_invitee_trivia_detailed"
            referencedColumns: ["option_id"]
          },
          {
            foreignKeyName: "trivia_answers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trivia_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "trivia_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trivia_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "v_invitee_trivia_detailed"
            referencedColumns: ["question_id"]
          },
        ]
      }
      trivia_option_translations: {
        Row: {
          created_at: string
          id: string
          locale: string
          option_id: string
          option_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          locale: string
          option_id: string
          option_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          locale?: string
          option_id?: string
          option_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trivia_option_translations_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "trivia_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trivia_option_translations_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "v_invitee_trivia_detailed"
            referencedColumns: ["option_id"]
          },
        ]
      }
      trivia_options: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          option_text: string
          question_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean
          option_text: string
          question_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          option_text?: string
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trivia_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "trivia_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trivia_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "v_invitee_trivia_detailed"
            referencedColumns: ["question_id"]
          },
        ]
      }
      trivia_question_translations: {
        Row: {
          created_at: string
          id: string
          locale: string
          question: string
          question_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          locale: string
          question: string
          question_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          locale?: string
          question?: string
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trivia_question_translations_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "trivia_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trivia_question_translations_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "v_invitee_trivia_detailed"
            referencedColumns: ["question_id"]
          },
        ]
      }
      trivia_questions: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          question: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          question: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trivia_questions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_invitee_trivia_detailed: {
        Row: {
          answered_at: string | null
          full_name: string | null
          invitee_id: string | null
          is_correct: boolean | null
          option_id: string | null
          option_text: string | null
          organization_id: string | null
          question: string | null
          question_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_invitees_trivia_summary: {
        Row: {
          correct_answers: number | null
          full_name: string | null
          invitee_id: string | null
          organization_id: string | null
          total_answers: number | null
          wrong_answers: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invitees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_org_content_edit: {
        Row: {
          base_content: Json | null
          created_at: string | null
          id: string | null
          locale: string | null
          organization_id: string | null
          translation_content: Json | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_content_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_organization_content_ordered: {
        Row: {
          button_text: string | null
          button_url: string | null
          content_html: string | null
          created_at: string | null
          event_date: string | null
          event_time: string | null
          host_name: string | null
          id: string | null
          location_name: string | null
          location_url: string | null
          organization_id: string | null
          sub_title: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          button_text?: never
          button_url?: never
          content_html?: never
          created_at?: string | null
          event_date?: never
          event_time?: never
          host_name?: never
          id?: string | null
          location_name?: never
          location_url?: never
          organization_id?: string | null
          sub_title?: never
          title?: never
          updated_at?: string | null
        }
        Update: {
          button_text?: never
          button_url?: never
          content_html?: never
          created_at?: string | null
          event_date?: never
          event_time?: never
          host_name?: never
          id?: string | null
          location_name?: never
          location_url?: never
          organization_id?: string | null
          sub_title?: never
          title?: never
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_content_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_organization_content_translations_ordered: {
        Row: {
          button_text: string | null
          button_url: string | null
          content_html: string | null
          created_at: string | null
          host_name: string | null
          id: string | null
          locale: string | null
          location_name: string | null
          organization_content_id: string | null
          sub_title: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          button_text?: never
          button_url?: never
          content_html?: never
          created_at?: string | null
          host_name?: never
          id?: string | null
          locale?: string | null
          location_name?: never
          organization_content_id?: string | null
          sub_title?: never
          title?: never
          updated_at?: string | null
        }
        Update: {
          button_text?: never
          button_url?: never
          content_html?: never
          created_at?: string | null
          host_name?: never
          id?: string | null
          locale?: string | null
          location_name?: never
          organization_content_id?: string | null
          sub_title?: never
          title?: never
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_content_translations_fk"
            columns: ["organization_content_id"]
            isOneToOne: false
            referencedRelation: "organization_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_content_translations_fk"
            columns: ["organization_content_id"]
            isOneToOne: false
            referencedRelation: "v_org_content_edit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_content_translations_fk"
            columns: ["organization_content_id"]
            isOneToOne: false
            referencedRelation: "v_organization_content_ordered"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      current_user_id: { Args: never; Returns: string }
      has_org_role: {
        Args: {
          min_role: Database["public"]["Enums"]["org_role"]
          target_org: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      org_role: "owner" | "admin" | "editor" | "viewer"
      user_role: "super_admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      org_role: ["owner", "admin", "editor", "viewer"],
      user_role: ["super_admin", "member"],
    },
  },
} as const
