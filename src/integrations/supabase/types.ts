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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      commissions: {
        Row: {
          commission_amount: number
          commission_percentage: number
          company_id: string
          created_at: string
          email_sent_at: string | null
          id: string
          invoice_received_at: string | null
          invoice_reference: string | null
          invoice_url: string | null
          paid_at: string | null
          payment_id: string
          quote_id: string
          status: Database["public"]["Enums"]["commission_status"]
          updated_at: string
        }
        Insert: {
          commission_amount: number
          commission_percentage: number
          company_id: string
          created_at?: string
          email_sent_at?: string | null
          id?: string
          invoice_received_at?: string | null
          invoice_reference?: string | null
          invoice_url?: string | null
          paid_at?: string | null
          payment_id: string
          quote_id: string
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
        }
        Update: {
          commission_amount?: number
          commission_percentage?: number
          company_id?: string
          created_at?: string
          email_sent_at?: string | null
          id?: string
          invoice_received_at?: string | null
          invoice_reference?: string | null
          invoice_url?: string | null
          paid_at?: string | null
          payment_id?: string
          quote_id?: string
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      company_billing_info: {
        Row: {
          address: string | null
          company_id: string
          company_name: string
          created_at: string
          email: string
          id: string
          peppol_id: string | null
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          company_id: string
          company_name: string
          created_at?: string
          email: string
          id?: string
          peppol_id?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          company_id?: string
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          peppol_id?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      nox_project_data: {
        Row: {
          calculation_results: Json | null
          commission_amount: number | null
          created_at: string
          current_version: string
          days_pending: number | null
          detailed_calculation: Json | null
          id: string
          payment_data: Json | null
          pre_estimation: Json | null
          price_data: Json | null
          project_id: string
          quote_sent_date: string | null
          report_job_queued: boolean
          status: string
          sub_status: string | null
          updated_at: string
          user_id: string
          version_history: Json
        }
        Insert: {
          calculation_results?: Json | null
          commission_amount?: number | null
          created_at?: string
          current_version?: string
          days_pending?: number | null
          detailed_calculation?: Json | null
          id?: string
          payment_data?: Json | null
          pre_estimation?: Json | null
          price_data?: Json | null
          project_id: string
          quote_sent_date?: string | null
          report_job_queued?: boolean
          status?: string
          sub_status?: string | null
          updated_at?: string
          user_id: string
          version_history?: Json
        }
        Update: {
          calculation_results?: Json | null
          commission_amount?: number | null
          created_at?: string
          current_version?: string
          days_pending?: number | null
          detailed_calculation?: Json | null
          id?: string
          payment_data?: Json | null
          pre_estimation?: Json | null
          price_data?: Json | null
          project_id?: string
          quote_sent_date?: string | null
          report_job_queued?: boolean
          status?: string
          sub_status?: string | null
          updated_at?: string
          user_id?: string
          version_history?: Json
        }
        Relationships: [
          {
            foreignKeyName: "nox_project_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_audit_log: {
        Row: {
          commission_id: string | null
          company_id: string | null
          created_at: string
          event_data: Json | null
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id: string
          ip_address: string | null
          payment_id: string | null
          quote_id: string | null
          user_id: string | null
        }
        Insert: {
          commission_id?: string | null
          company_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          ip_address?: string | null
          payment_id?: string | null
          quote_id?: string | null
          user_id?: string | null
        }
        Update: {
          commission_id?: string | null
          company_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type?: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          ip_address?: string | null
          payment_id?: string | null
          quote_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_audit_log_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_audit_log_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_audit_log_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          paid_at: string
          payment_method: string | null
          payment_provider: string | null
          quote_id: string
          transaction_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          paid_at?: string
          payment_method?: string | null
          payment_provider?: string | null
          quote_id: string
          transaction_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          paid_at?: string
          payment_method?: string | null
          payment_provider?: string | null
          quote_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_login_at: string | null
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
          workspace_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_login_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
          workspace_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_login_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      project_contacts: {
        Row: {
          address: string | null
          company_info: string | null
          contact_person: string
          contact_type: string
          correspondence_notes: string | null
          created_at: string
          email: string | null
          firm_name: string
          id: string
          mobile: string | null
          phone: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_info?: string | null
          contact_person: string
          contact_type: string
          correspondence_notes?: string | null
          created_at?: string
          email?: string | null
          firm_name: string
          id?: string
          mobile?: string | null
          phone?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_info?: string | null
          contact_person?: string
          contact_type?: string
          correspondence_notes?: string | null
          created_at?: string
          email?: string | null
          firm_name?: string
          id?: string
          mobile?: string | null
          phone?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_contacts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_completed: boolean
          phase_name: string
          project_id: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_completed?: boolean
          phase_name: string
          project_id: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_completed?: boolean
          phase_name?: string
          project_id?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          client_contact: string | null
          code: string | null
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          office: string | null
          overview: string | null
          photo_url: string | null
          project_number: string
          project_type: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          client_contact?: string | null
          code?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          office?: string | null
          overview?: string | null
          photo_url?: string | null
          project_number: string
          project_type?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          client_contact?: string | null
          code?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          office?: string | null
          overview?: string | null
          photo_url?: string | null
          project_number?: string
          project_type?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          amount: number
          client_contact_email: string
          client_contact_name: string
          company_id: string
          created_at: string
          id: string
          nox_status: Database["public"]["Enums"]["nox_status"] | null
          payment_link: string | null
          project_id: string
          quote_number: string
          status: Database["public"]["Enums"]["quote_status"]
          total_amount: number
          updated_at: string
          user_id: string
          valid_until: string
          vat_amount: number
        }
        Insert: {
          amount: number
          client_contact_email: string
          client_contact_name: string
          company_id: string
          created_at?: string
          id?: string
          nox_status?: Database["public"]["Enums"]["nox_status"] | null
          payment_link?: string | null
          project_id: string
          quote_number: string
          status?: Database["public"]["Enums"]["quote_status"]
          total_amount: number
          updated_at?: string
          user_id: string
          valid_until: string
          vat_amount: number
        }
        Update: {
          amount?: number
          client_contact_email?: string
          client_contact_name?: string
          company_id?: string
          created_at?: string
          id?: string
          nox_status?: Database["public"]["Enums"]["nox_status"] | null
          payment_link?: string | null
          project_id?: string
          quote_number?: string
          status?: Database["public"]["Enums"]["quote_status"]
          total_amount?: number
          updated_at?: string
          user_id?: string
          valid_until?: string
          vat_amount?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          bank_account: string | null
          btw_number: string
          company_address: string | null
          company_name: string
          company_website: string | null
          created_at: string
          id: string
          kbo_data: Json | null
          owner_id: string
          updated_at: string
        }
        Insert: {
          bank_account?: string | null
          btw_number: string
          company_address?: string | null
          company_name: string
          company_website?: string | null
          created_at?: string
          id?: string
          kbo_data?: Json | null
          owner_id: string
          updated_at?: string
        }
        Update: {
          bank_account?: string | null
          btw_number?: string
          company_address?: string | null
          company_name?: string
          company_website?: string | null
          created_at?: string
          id?: string
          kbo_data?: Json | null
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_btw_available: { Args: { btw: string }; Returns: boolean }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "owner"
        | "admin"
        | "client_owner"
        | "client_user"
        | "client_admin"
      audit_event_type:
        | "quote_created"
        | "quote_sent"
        | "quote_paid"
        | "quote_expired"
        | "quote_cancelled"
        | "calculation_unlocked"
        | "commission_email_sent"
        | "invoice_received"
        | "commission_paid"
        | "payment_webhook_received"
      commission_status:
        | "pending_invoice"
        | "invoice_received"
        | "paid"
        | "disputed"
      nox_status:
        | "input_completed"
        | "price_generated"
        | "awaiting_payment"
        | "paid"
        | "report_in_progress"
        | "report_delivered"
        | "expired"
      quote_status: "pending" | "sent" | "paid" | "expired" | "cancelled"
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
      app_role: [
        "owner",
        "admin",
        "client_owner",
        "client_user",
        "client_admin",
      ],
      audit_event_type: [
        "quote_created",
        "quote_sent",
        "quote_paid",
        "quote_expired",
        "quote_cancelled",
        "calculation_unlocked",
        "commission_email_sent",
        "invoice_received",
        "commission_paid",
        "payment_webhook_received",
      ],
      commission_status: [
        "pending_invoice",
        "invoice_received",
        "paid",
        "disputed",
      ],
      nox_status: [
        "input_completed",
        "price_generated",
        "awaiting_payment",
        "paid",
        "report_in_progress",
        "report_delivered",
        "expired",
      ],
      quote_status: ["pending", "sent", "paid", "expired", "cancelled"],
    },
  },
} as const
