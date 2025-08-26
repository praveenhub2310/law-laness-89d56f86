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
      cause_list: {
        Row: {
          case_number: string
          court_name: string
          court_room_number: string | null
          created_at: string
          date: string
          hearing_type: string | null
          id: string
          item_number: string | null
          judge_name: string
          mapped_case_id: string | null
          mapping_confidence: number | null
          original_filename: string | null
          parsed_from_file: boolean | null
          parties: string
          raw_text: string | null
          status: Database["public"]["Enums"]["cause_status"]
          time_slot: string | null
          updated_at: string
        }
        Insert: {
          case_number: string
          court_name: string
          court_room_number?: string | null
          created_at?: string
          date: string
          hearing_type?: string | null
          id?: string
          item_number?: string | null
          judge_name: string
          mapped_case_id?: string | null
          mapping_confidence?: number | null
          original_filename?: string | null
          parsed_from_file?: boolean | null
          parties: string
          raw_text?: string | null
          status?: Database["public"]["Enums"]["cause_status"]
          time_slot?: string | null
          updated_at?: string
        }
        Update: {
          case_number?: string
          court_name?: string
          court_room_number?: string | null
          created_at?: string
          date?: string
          hearing_type?: string | null
          id?: string
          item_number?: string | null
          judge_name?: string
          mapped_case_id?: string | null
          mapping_confidence?: number | null
          original_filename?: string | null
          parsed_from_file?: boolean | null
          parties?: string
          raw_text?: string | null
          status?: Database["public"]["Enums"]["cause_status"]
          time_slot?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cause_list_mapped_case_id_fkey"
            columns: ["mapped_case_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cause_list_uploads: {
        Row: {
          created_at: string
          error_message: string | null
          file_size: number | null
          file_type: string
          file_url: string | null
          filename: string
          id: string
          mapped_entries_count: number | null
          parsed_entries_count: number | null
          status: string
          updated_at: string
          upload_date: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_size?: number | null
          file_type: string
          file_url?: string | null
          filename: string
          id?: string
          mapped_entries_count?: number | null
          parsed_entries_count?: number | null
          status?: string
          updated_at?: string
          upload_date?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string | null
          filename?: string
          id?: string
          mapped_entries_count?: number | null
          parsed_entries_count?: number | null
          status?: string
          updated_at?: string
          upload_date?: string
          uploaded_by?: string
        }
        Relationships: []
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
          duration: unknown | null
          hearing_date: string
          id: string
          location: string | null
          start_time: string | null
          status: string
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          court_name: string
          created_at?: string
          description?: string | null
          duration?: unknown | null
          hearing_date: string
          id?: string
          location?: string | null
          start_time?: string | null
          status?: string
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          court_name?: string
          created_at?: string
          description?: string | null
          duration?: unknown | null
          hearing_date?: string
          id?: string
          location?: string | null
          start_time?: string | null
          status?: string
          title?: string
          type?: string | null
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
      e_sign_documents: {
        Row: {
          case_id: string | null
          case_number: string | null
          client_id: string | null
          created_at: string
          document_number: string
          expires_at: string | null
          google_drive_file_id: string | null
          google_drive_signed_file_id: string | null
          id: string
          lawyer_id: string | null
          original_file_url: string | null
          reminder_sent_at: string | null
          signature_positions: Json | null
          signatures: Json | null
          signed_at: string | null
          signed_file_url: string | null
          signing_status: string
          title: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          case_number?: string | null
          client_id?: string | null
          created_at?: string
          document_number: string
          expires_at?: string | null
          google_drive_file_id?: string | null
          google_drive_signed_file_id?: string | null
          id?: string
          lawyer_id?: string | null
          original_file_url?: string | null
          reminder_sent_at?: string | null
          signature_positions?: Json | null
          signatures?: Json | null
          signed_at?: string | null
          signed_file_url?: string | null
          signing_status?: string
          title: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          case_number?: string | null
          client_id?: string | null
          created_at?: string
          document_number?: string
          expires_at?: string | null
          google_drive_file_id?: string | null
          google_drive_signed_file_id?: string | null
          id?: string
          lawyer_id?: string | null
          original_file_url?: string | null
          reminder_sent_at?: string | null
          signature_positions?: Json | null
          signatures?: Json | null
          signed_at?: string | null
          signed_file_url?: string | null
          signing_status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "e_sign_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      hearings: {
        Row: {
          case_id: string | null
          client_id: string | null
          court_name: string
          court_room: string | null
          created_at: string
          description: string | null
          duration: unknown | null
          hearing_date: string
          hearing_number: string
          hearing_time: string | null
          hearing_type: string | null
          id: string
          judge_name: string | null
          lawyer_id: string | null
          notes: string | null
          outcome: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          client_id?: string | null
          court_name: string
          court_room?: string | null
          created_at?: string
          description?: string | null
          duration?: unknown | null
          hearing_date: string
          hearing_number: string
          hearing_time?: string | null
          hearing_type?: string | null
          id?: string
          judge_name?: string | null
          lawyer_id?: string | null
          notes?: string | null
          outcome?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          client_id?: string | null
          court_name?: string
          court_room?: string | null
          created_at?: string
          description?: string | null
          duration?: unknown | null
          hearing_date?: string
          hearing_number?: string
          hearing_time?: string | null
          hearing_type?: string | null
          id?: string
          judge_name?: string | null
          lawyer_id?: string | null
          notes?: string | null
          outcome?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_hearings_case_id"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_hearings_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_hearings_lawyer_id"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hearings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
          created_at: string
          discount_amount: number
          due_date: string | null
          id: string
          invoice_number: string
          issued_date: string
          lawyer_id: string | null
          notes: string | null
          payment_date: string | null
          services: Json
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_number: string
          issued_date?: string
          lawyer_id?: string | null
          notes?: string | null
          payment_date?: string | null
          services?: Json
          status?: string
          subtotal: number
          tax_amount?: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_number?: string
          issued_date?: string
          lawyer_id?: string | null
          notes?: string | null
          payment_date?: string | null
          services?: Json
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      meeting_recordings: {
        Row: {
          case_id: string | null
          client_id: string | null
          created_at: string
          duration: number | null
          file_size: number | null
          file_url: string | null
          id: string
          is_confidential: boolean | null
          lawyer_id: string | null
          meeting_date: string
          notes: string | null
          participants: Json | null
          recording_type: string
          status: string
          title: string
          transcript: string | null
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          duration?: number | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_confidential?: boolean | null
          lawyer_id?: string | null
          meeting_date: string
          notes?: string | null
          participants?: Json | null
          recording_type: string
          status?: string
          title: string
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          duration?: number | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_confidential?: boolean | null
          lawyer_id?: string | null
          meeting_date?: string
          notes?: string | null
          participants?: Json | null
          recording_type?: string
          status?: string
          title?: string
          transcript?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_recordings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          created_at: string
          enable_razorpay_prepaid: boolean | null
          enable_razorpay_subscription: boolean | null
          id: string
          is_active: boolean | null
          razorpay_base_uri: string | null
          razorpay_webhook_uri: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          enable_razorpay_prepaid?: boolean | null
          enable_razorpay_subscription?: boolean | null
          id?: string
          is_active?: boolean | null
          razorpay_base_uri?: string | null
          razorpay_webhook_uri?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          enable_razorpay_prepaid?: boolean | null
          enable_razorpay_subscription?: boolean | null
          id?: string
          is_active?: boolean | null
          razorpay_base_uri?: string | null
          razorpay_webhook_uri?: string | null
          updated_at?: string
          updated_by?: string | null
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
      subscription_invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          payment_date: string | null
          payment_method: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string
          subscription_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          due_date: string
          id?: string
          invoice_date?: string
          invoice_number: string
          payment_date?: string | null
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          subscription_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          payment_date?: string | null
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          features: Json
          id: string
          interval_type: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          interval_type?: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          interval_type?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      sync_status: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_details: Json | null
          id: string
          started_at: string | null
          status: string
          sync_type: string
          total_errors: number | null
          total_found: number | null
          total_inserted: number | null
          total_skipped: number | null
          total_updated: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          id?: string
          started_at?: string | null
          status?: string
          sync_type: string
          total_errors?: number | null
          total_found?: number | null
          total_inserted?: number | null
          total_skipped?: number | null
          total_updated?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          id?: string
          started_at?: string | null
          status?: string
          sync_type?: string
          total_errors?: number | null
          total_found?: number | null
          total_inserted?: number | null
          total_skipped?: number | null
          total_updated?: number | null
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
      templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          download_count: number | null
          file_size: number | null
          file_url: string
          id: string
          is_active: boolean | null
          language: string | null
          mime_type: string | null
          preview_type: string
          sha256_hash: string | null
          size_bytes: number | null
          source_url: string | null
          storage_path: string | null
          synced_at: string | null
          title: string
          updated_at: string
          version: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size?: number | null
          file_url: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          mime_type?: string | null
          preview_type: string
          sha256_hash?: string | null
          size_bytes?: number | null
          source_url?: string | null
          storage_path?: string | null
          synced_at?: string | null
          title: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          mime_type?: string | null
          preview_type?: string
          sha256_hash?: string | null
          size_bytes?: number | null
          source_url?: string | null
          storage_path?: string | null
          synced_at?: string | null
          title?: string
          updated_at?: string
          version?: number | null
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
      transactions: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          invoice_id: string | null
          lawyer_id: string | null
          method: string
          payment_gateway_id: string | null
          payment_gateway_response: Json | null
          processed_by: string | null
          status: string
          transaction_number: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          invoice_id?: string | null
          lawyer_id?: string | null
          method: string
          payment_gateway_id?: string | null
          payment_gateway_response?: Json | null
          processed_by?: string | null
          status?: string
          transaction_number: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          invoice_id?: string | null
          lawyer_id?: string | null
          method?: string
          payment_gateway_id?: string | null
          payment_gateway_response?: Json | null
          processed_by?: string | null
          status?: string
          transaction_number?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_transactions_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transactions_lawyer_id"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transactions_processed_by"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          next_billing_date: string | null
          payment_method: string | null
          payment_status: string | null
          plan_id: string
          razorpay_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          next_billing_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          plan_id: string
          razorpay_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          next_billing_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          plan_id?: string
          razorpay_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
      cause_status: "scheduled" | "in_progress" | "completed" | "adjourned"
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
      cause_status: ["scheduled", "in_progress", "completed", "adjourned"],
      document_status: ["active", "draft", "archived"],
      user_role: ["super_admin", "company", "advocate", "client"],
    },
  },
} as const
