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
      alumni_badges: {
        Row: {
          awarded_at: string
          badge_name: string
          badge_type: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_name: string
          badge_type: string
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_name?: string
          badge_type?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      alumni_contributions: {
        Row: {
          events_hosted: number
          id: string
          jobs_posted: number
          mentorships_completed: number
          referrals_made: number
          total_donations: number
          updated_at: string
          user_id: string
        }
        Insert: {
          events_hosted?: number
          id?: string
          jobs_posted?: number
          mentorships_completed?: number
          referrals_made?: number
          total_donations?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          events_hosted?: number
          id?: string
          jobs_posted?: number
          mentorships_completed?: number
          referrals_made?: number
          total_donations?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      alumni_details: {
        Row: {
          created_at: string
          current_company: string | null
          id: string
          industry: string | null
          is_mentor_available: boolean | null
          job_title: string | null
          mentorship_areas: string[] | null
          skills: string[] | null
          updated_at: string
          user_id: string
          years_of_experience: number | null
        }
        Insert: {
          created_at?: string
          current_company?: string | null
          id?: string
          industry?: string | null
          is_mentor_available?: boolean | null
          job_title?: string | null
          mentorship_areas?: string[] | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
          years_of_experience?: number | null
        }
        Update: {
          created_at?: string
          current_company?: string | null
          id?: string
          industry?: string | null
          is_mentor_available?: boolean | null
          job_title?: string | null
          mentorship_areas?: string[] | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          years_of_experience?: number | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          target_audience: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          target_audience?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          target_audience?: string | null
          title?: string
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          requester_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          requester_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          requester_id?: string
          status?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string
          donor_id: string
          id: string
          is_anonymous: boolean
          is_recurring: boolean
          message: string | null
          payment_method: string | null
          payment_status: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          campaign_id: string
          created_at?: string
          donor_id: string
          id?: string
          is_anonymous?: boolean
          is_recurring?: boolean
          message?: string | null
          payment_method?: string | null
          payment_status?: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string
          donor_id?: string
          id?: string
          is_anonymous?: boolean
          is_recurring?: boolean
          message?: string | null
          payment_method?: string | null
          payment_status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "fundraising_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          event_type: string | null
          id: string
          is_published: boolean | null
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          is_published?: boolean | null
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          is_published?: boolean | null
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_members: {
        Row: {
          forum_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          forum_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          forum_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_members_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "mentorship_forums"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          forum_id: string
          id: string
          post_type: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          forum_id: string
          id?: string
          post_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          forum_id?: string
          id?: string
          post_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "mentorship_forums"
            referencedColumns: ["id"]
          },
        ]
      }
      fundraising_campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          current_amount: number
          deadline: string | null
          description: string | null
          donor_count: number
          id: string
          image_url: string | null
          is_active: boolean
          target_amount: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_amount?: number
          deadline?: string | null
          description?: string | null
          donor_count?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          target_amount?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_amount?: number
          deadline?: string | null
          description?: string | null
          donor_count?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          target_amount?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string
          resume_url: string | null
          status: string
        }
        Insert: {
          applicant_id: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id: string
          resume_url?: string | null
          status?: string
        }
        Update: {
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string
          resume_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          apply_url: string | null
          company: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_referral: boolean
          job_type: string
          last_date_to_apply: string | null
          location: string | null
          posted_by: string
          requirements: string | null
          salary_range: string | null
          skills: string[] | null
          title: string
          updated_at: string
          work_mode: string
        }
        Insert: {
          apply_url?: string | null
          company: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_referral?: boolean
          job_type?: string
          last_date_to_apply?: string | null
          location?: string | null
          posted_by: string
          requirements?: string | null
          salary_range?: string | null
          skills?: string[] | null
          title: string
          updated_at?: string
          work_mode?: string
        }
        Update: {
          apply_url?: string | null
          company?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_referral?: boolean
          job_type?: string
          last_date_to_apply?: string | null
          location?: string | null
          posted_by?: string
          requirements?: string | null
          salary_range?: string | null
          skills?: string[] | null
          title?: string
          updated_at?: string
          work_mode?: string
        }
        Relationships: []
      }
      mentorship_forums: {
        Row: {
          alumni_id: string
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          alumni_id: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          alumni_id?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentorship_requests: {
        Row: {
          alumni_id: string
          created_at: string
          id: string
          message: string | null
          status: Database["public"]["Enums"]["mentorship_status"] | null
          student_id: string
          updated_at: string
        }
        Insert: {
          alumni_id: string
          created_at?: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["mentorship_status"] | null
          student_id: string
          updated_at?: string
        }
        Update: {
          alumni_id?: string
          created_at?: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["mentorship_status"] | null
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          edited_at: string | null
          id: string
          is_deleted: boolean
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          reference_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          department: string | null
          email: string
          full_name: string
          graduation_year: number | null
          id: string
          linkedin_url: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email: string
          full_name: string
          graduation_year?: number | null
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email?: string
          full_name?: string
          graduation_year?: number | null
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
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
    }
    Views: {
      profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          department: string | null
          full_name: string | null
          graduation_year: number | null
          id: string | null
          linkedin_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string | null
          full_name?: string | null
          graduation_year?: number | null
          id?: string | null
          linkedin_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string | null
          full_name?: string | null
          graduation_year?: number | null
          id?: string | null
          linkedin_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_forum_member: {
        Args: { _forum_id: string; _user_id: string }
        Returns: boolean
      }
      is_forum_owner: {
        Args: { _forum_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "alumni" | "student" | "faculty"
      mentorship_status: "pending" | "accepted" | "declined" | "completed"
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
      app_role: ["admin", "alumni", "student", "faculty"],
      mentorship_status: ["pending", "accepted", "declined", "completed"],
    },
  },
} as const
