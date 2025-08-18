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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      advocates: {
        Row: {
          availability_status: string | null
          bar_number: string | null
          bio: string | null
          created_at: string
          experience_years: number | null
          hourly_rate: number | null
          id: string
          specialization: string[] | null
          updated_at: string
        }
        Insert: {
          availability_status?: string | null
          bar_number?: string | null
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number | null
          id: string
          specialization?: string[] | null
          updated_at?: string
        }
        Update: {
          availability_status?: string | null
          bar_number?: string | null
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          specialization?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advocates_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          client_type: string | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          preferred_contact_method: string | null
          updated_at: string
        }
        Insert: {
          client_type?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id: string
          preferred_contact_method?: string | null
          updated_at?: string
        }
        Update: {
          client_type?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          preferred_contact_method?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          created_at: string
          description: string | null
          id: string
          postal_code: string | null
          registration_number: string | null
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          created_at?: string
          description?: string | null
          id: string
          postal_code?: string | null
          registration_number?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          created_at?: string
          description?: string | null
          id?: string
          postal_code?: string | null
          registration_number?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      court_calendar: {
        Row: {
          case_id: string | null
          court_name: string
          created_at: string
          description: string | null
          hearing_date: string
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          court_name: string
          created_at?: string
          description?: string | null
          hearing_date: string
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          court_name?: string
          created_at?: string
          description?: string | null
          hearing_date?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          case_id: string | null
          category: string | null
          cloud_file_id: string | null
          cloud_provider: string | null
          confidential: boolean | null
          created_at: string | null
          file_size: string | null
          file_type: string | null
          filename: string
          id: string
          last_modified: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          title: string
          upload_date: string | null
          uploaded_by: string | null
          version: string | null
        }
        Insert: {
          case_id?: string | null
          category?: string | null
          cloud_file_id?: string | null
          cloud_provider?: string | null
          confidential?: boolean | null
          created_at?: string | null
          file_size?: string | null
          file_type?: string | null
          filename: string
          id?: string
          last_modified?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          title: string
          upload_date?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Update: {
          case_id?: string | null
          category?: string | null
          cloud_file_id?: string | null
          cloud_provider?: string | null
          confidential?: boolean | null
          created_at?: string | null
          file_size?: string | null
          file_type?: string | null
          filename?: string
          id?: string
          last_modified?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          title?: string
          upload_date?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          case_id: string | null
          created_at: string
          currency: string
          description: string | null
          expense_date: string
          expense_title: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          case_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          expense_date: string
          expense_title: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          case_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          expense_date?: string
          expense_title?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          case_number: string
          client_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          lawyer_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["case_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          case_number: string
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          lawyer_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["case_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          case_number?: string
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          lawyer_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["case_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string | null
          description: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_backups: {
        Row: {
          backup_type: string
          completed_at: string | null
          created_by: string | null
          error_message: string | null
          file_path: string | null
          file_size: number | null
          id: string
          started_at: string | null
          status: string
        }
        Insert: {
          backup_type: string
          completed_at?: string | null
          created_by?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          started_at?: string | null
          status: string
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          created_by?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          created_at: string | null
          details: string | null
          id: string
          ip_address: unknown | null
          level: string
          module: string
          session_id: string | null
          status: string
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: string | null
          id?: string
          ip_address?: unknown | null
          level: string
          module: string
          session_id?: string | null
          status: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: string | null
          id?: string
          ip_address?: unknown | null
          level?: string
          module?: string
          session_id?: string | null
          status?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      time_tracker: {
        Row: {
          case_id: string | null
          created_at: string
          duration: number | null
          end_time: string | null
          id: string
          start_time: string
          task_description: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time: string
          task_description: string
          updated_at?: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          task_description?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      case_status: "active" | "closed" | "pending" | "draft"
      document_status: "active" | "draft" | "archived"
      user_role: "super_admin" | "company" | "advocate" | "client"
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
      case_status: ["active", "closed", "pending", "draft"],
      document_status: ["active", "draft", "archived"],
      user_role: ["super_admin", "company", "advocate", "client"],
    },
  },
} as const
