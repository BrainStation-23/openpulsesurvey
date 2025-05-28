export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievement_progress: {
        Row: {
          achievement_id: string
          created_at: string
          current_value: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          current_value?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          current_value?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_progress_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievement_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievement_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          condition_value: Json
          created_at: string
          description: string
          icon: string
          icon_color: string
          id: string
          name: string
          points: number
          status: Database["public"]["Enums"]["achievement_status"] | null
          updated_at: string
        }
        Insert: {
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          condition_value?: Json
          created_at?: string
          description: string
          icon: string
          icon_color?: string
          id?: string
          name: string
          points?: number
          status?: Database["public"]["Enums"]["achievement_status"] | null
          updated_at?: string
        }
        Update: {
          achievement_type?: Database["public"]["Enums"]["achievement_type"]
          condition_value?: Json
          created_at?: string
          description?: string
          icon?: string
          icon_color?: string
          id?: string
          name?: string
          points?: number
          status?: Database["public"]["Enums"]["achievement_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_feedback_analysis: {
        Row: {
          analysis_content: string
          campaign_id: string
          created_at: string
          generated_at: string
          id: string
          instance_id: string
          response_rate: number
          supervisor_id: string
          team_size: number
          updated_at: string
        }
        Insert: {
          analysis_content: string
          campaign_id: string
          created_at?: string
          generated_at?: string
          id?: string
          instance_id: string
          response_rate: number
          supervisor_id: string
          team_size: number
          updated_at?: string
        }
        Update: {
          analysis_content?: string
          campaign_id?: string
          created_at?: string
          generated_at?: string
          id?: string
          instance_id?: string
          response_rate?: number
          supervisor_id?: string
          team_size?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_feedback_analysis_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_feedback_analysis_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "campaign_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_feedback_analysis_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "upcoming_survey_deadlines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_feedback_analysis_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_feedback_analysis_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_prompts: {
        Row: {
          category: Database["public"]["Enums"]["prompt_category"]
          created_at: string
          id: string
          name: string
          prompt_text: string
          status: Database["public"]["Enums"]["prompt_status"]
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["prompt_category"]
          created_at?: string
          id?: string
          name: string
          prompt_text: string
          status?: Database["public"]["Enums"]["prompt_status"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["prompt_category"]
          created_at?: string
          id?: string
          name?: string
          prompt_text?: string
          status?: Database["public"]["Enums"]["prompt_status"]
          updated_at?: string
        }
        Relationships: []
      }
      campaign_cron_jobs: {
        Row: {
          campaign_id: string
          created_at: string | null
          cron_schedule: string
          id: string
          is_active: boolean | null
          job_name: string
          job_type: string
          last_run: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          cron_schedule: string
          id?: string
          is_active?: boolean | null
          job_name: string
          job_type: string
          last_run?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          cron_schedule?: string
          id?: string
          is_active?: boolean | null
          job_name?: string
          job_type?: string
          last_run?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_cron_jobs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_instance_status_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          run_at: string
          updated_to_active: number
          updated_to_completed: number
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          run_at: string
          updated_to_active: number
          updated_to_completed: number
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          run_at?: string
          updated_to_active?: number
          updated_to_completed?: number
        }
        Relationships: []
      }
      campaign_instances: {
        Row: {
          campaign_id: string
          created_at: string
          ends_at: string
          id: string
          period_number: number
          starts_at: string
          status: Database["public"]["Enums"]["instance_status"]
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          ends_at: string
          id?: string
          period_number: number
          starts_at: string
          status?: Database["public"]["Enums"]["instance_status"]
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          ends_at?: string
          id?: string
          period_number?: number
          starts_at?: string
          status?: Database["public"]["Enums"]["instance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_instances_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_campaign_instances_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_config: {
        Row: {
          created_at: string
          from_email: string
          from_name: string
          id: string
          is_singleton: boolean | null
          provider: Database["public"]["Enums"]["email_provider"]
          provider_settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_email: string
          from_name: string
          id?: string
          is_singleton?: boolean | null
          provider?: Database["public"]["Enums"]["email_provider"]
          provider_settings?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_email?: string
          from_name?: string
          id?: string
          is_singleton?: boolean | null
          provider?: Database["public"]["Enums"]["email_provider"]
          provider_settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      employee_roles: {
        Row: {
          color_code: string | null
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["config_status"]
          updated_at: string
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["config_status"]
          updated_at?: string
        }
        Update: {
          color_code?: string | null
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["config_status"]
          updated_at?: string
        }
        Relationships: []
      }
      employee_types: {
        Row: {
          color_code: string | null
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["config_status"]
          updated_at: string
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["config_status"]
          updated_at?: string
        }
        Update: {
          color_code?: string | null
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["config_status"]
          updated_at?: string
        }
        Relationships: []
      }
      employment_types: {
        Row: {
          color_code: string | null
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["config_status"]
          updated_at: string
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["config_status"]
          updated_at?: string
        }
        Update: {
          color_code?: string | null
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["config_status"]
          updated_at?: string
        }
        Relationships: []
      }
      issue_board_permissions: {
        Row: {
          board_id: string
          can_create: boolean
          can_view: boolean
          can_vote: boolean
          created_at: string
          employee_role_ids: string[] | null
          employee_type_ids: string[] | null
          employment_type_ids: string[] | null
          id: string
          level_ids: string[] | null
          location_ids: string[] | null
          sbu_ids: string[] | null
          updated_at: string
        }
        Insert: {
          board_id: string
          can_create?: boolean
          can_view?: boolean
          can_vote?: boolean
          created_at?: string
          employee_role_ids?: string[] | null
          employee_type_ids?: string[] | null
          employment_type_ids?: string[] | null
          id?: string
          level_ids?: string[] | null
          location_ids?: string[] | null
          sbu_ids?: string[] | null
          updated_at?: string
        }
        Update: {
          board_id?: string
          can_create?: boolean
          can_view?: boolean
          can_vote?: boolean
          created_at?: string
          employee_role_ids?: string[] | null
          employee_type_ids?: string[] | null
          employment_type_ids?: string[] | null
          id?: string
          level_ids?: string[] | null
          location_ids?: string[] | null
          sbu_ids?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_board_permissions_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "issue_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_boards: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["issue_board_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["issue_board_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["issue_board_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_boards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_boards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_downvotes: {
        Row: {
          created_at: string
          id: string
          issue_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_downvotes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_votes: {
        Row: {
          created_at: string
          id: string
          issue_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_votes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          board_id: string
          created_at: string
          created_by: string
          description: string | null
          downvote_count: number
          id: string
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
          vote_count: number
        }
        Insert: {
          board_id: string
          created_at?: string
          created_by: string
          description?: string | null
          downvote_count?: number
          id?: string
          status?: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at?: string
          vote_count?: number
        }
        Update: {
          board_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          downvote_count?: number
          id?: string
          status?: Database["public"]["Enums"]["issue_status"]
          title?: string
          updated_at?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "issues_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "issue_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          color_code: string | null
          created_at: string
          id: string
          name: string
          rank: number | null
          status: Database["public"]["Enums"]["config_status"] | null
          updated_at: string
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          id?: string
          name: string
          rank?: number | null
          status?: Database["public"]["Enums"]["config_status"] | null
          updated_at?: string
        }
        Update: {
          color_code?: string | null
          created_at?: string
          id?: string
          name?: string
          rank?: number | null
          status?: Database["public"]["Enums"]["config_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      live_session_participants: {
        Row: {
          created_at: string
          display_name: string
          id: string
          joined_at: string
          last_active_at: string
          participant_id: string
          session_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          joined_at?: string
          last_active_at?: string
          participant_id: string
          session_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          joined_at?: string
          last_active_at?: string
          participant_id?: string
          session_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_survey_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_session_questions: {
        Row: {
          created_at: string
          disabled_at: string | null
          display_order: number
          enabled_at: string | null
          id: string
          question_data: Json
          question_key: string
          session_id: string
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          disabled_at?: string | null
          display_order?: number
          enabled_at?: string | null
          id?: string
          question_data?: Json
          question_key: string
          session_id: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          disabled_at?: string | null
          display_order?: number
          enabled_at?: string | null
          id?: string
          question_data?: Json
          question_key?: string
          session_id?: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_session_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_survey_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_session_responses: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          question_key: string | null
          response_data: Json
          response_time: string | null
          session_id: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          question_key?: string | null
          response_data?: Json
          response_time?: string | null
          session_id: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          question_key?: string | null
          response_data?: Json
          response_time?: string | null
          session_id?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_session_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_survey_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_survey_sessions: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          join_code: string
          name: string
          status: Database["public"]["Enums"]["session_status"]
          survey_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          join_code: string
          name: string
          status?: Database["public"]["Enums"]["session_status"]
          survey_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          join_code?: string
          name?: string
          status?: Database["public"]["Enums"]["session_status"]
          survey_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_survey_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_survey_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_survey_sessions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          created_at: string
          google_maps_url: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          google_maps_url?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          google_maps_url?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          designation: string | null
          email: string
          employee_role_id: string | null
          employee_type_id: string | null
          employment_type_id: string | null
          first_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          last_name: string | null
          level_id: string | null
          location_id: string | null
          org_id: string | null
          profile_image_url: string | null
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          designation?: string | null
          email: string
          employee_role_id?: string | null
          employee_type_id?: string | null
          employment_type_id?: string | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id: string
          last_name?: string | null
          level_id?: string | null
          location_id?: string | null
          org_id?: string | null
          profile_image_url?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          designation?: string | null
          email?: string
          employee_role_id?: string | null
          employee_type_id?: string | null
          employment_type_id?: string | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          last_name?: string | null
          level_id?: string | null
          location_id?: string | null
          org_id?: string | null
          profile_image_url?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_employee_role_id_fkey"
            columns: ["employee_role_id"]
            isOneToOne: false
            referencedRelation: "employee_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_employee_type_id_fkey"
            columns: ["employee_type_id"]
            isOneToOne: false
            referencedRelation: "employee_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_employment_type_id_fkey"
            columns: ["employment_type_id"]
            isOneToOne: false
            referencedRelation: "employment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      sbus: {
        Row: {
          created_at: string
          head_id: string | null
          id: string
          name: string
          profile_image_url: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          head_id?: string | null
          id?: string
          name: string
          profile_image_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          head_id?: string | null
          id?: string
          name?: string
          profile_image_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sbus_head_id_fkey"
            columns: ["head_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sbus_head_id_fkey"
            columns: ["head_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_presentations: {
        Row: {
          access_token: string
          campaign_id: string
          created_at: string
          created_by: string
          description: string | null
          expires_at: string | null
          id: string
          instance_id: string | null
          is_active: boolean
          title: string | null
        }
        Insert: {
          access_token?: string
          campaign_id: string
          created_at?: string
          created_by: string
          description?: string | null
          expires_at?: string | null
          id?: string
          instance_id?: string | null
          is_active?: boolean
          title?: string | null
        }
        Update: {
          access_token?: string
          campaign_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          instance_id?: string | null
          is_active?: boolean
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_presentations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_presentations_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "campaign_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_presentations_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "upcoming_survey_deadlines"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_assignments: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          created_by: string
          id: string
          last_reminder_sent: string | null
          public_access_token: string | null
          survey_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          last_reminder_sent?: string | null
          public_access_token?: string | null
          survey_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          last_reminder_sent?: string | null
          public_access_token?: string | null
          survey_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_survey_assignments_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_assignments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_assignments_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_campaigns: {
        Row: {
          anonymous: boolean
          campaign_type: string
          created_at: string
          created_by: string
          description: string | null
          ends_at: string | null
          id: string
          instance_duration_days: number | null
          instance_end_time: string | null
          is_recurring: boolean | null
          name: string
          recurring_frequency: string | null
          starts_at: string
          status: string
          survey_id: string
          updated_at: string
        }
        Insert: {
          anonymous?: boolean
          campaign_type?: string
          created_at?: string
          created_by: string
          description?: string | null
          ends_at?: string | null
          id?: string
          instance_duration_days?: number | null
          instance_end_time?: string | null
          is_recurring?: boolean | null
          name: string
          recurring_frequency?: string | null
          starts_at: string
          status?: string
          survey_id: string
          updated_at?: string
        }
        Update: {
          anonymous?: boolean
          campaign_type?: string
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          instance_duration_days?: number | null
          instance_end_time?: string | null
          is_recurring?: boolean | null
          name?: string
          recurring_frequency?: string | null
          starts_at?: string
          status?: string
          survey_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_campaigns_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          assignment_id: string
          campaign_instance_id: string | null
          created_at: string | null
          id: string
          response_data: Json
          state_data: Json | null
          status: Database["public"]["Enums"]["response_status"]
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assignment_id: string
          campaign_instance_id?: string | null
          created_at?: string | null
          id?: string
          response_data: Json
          state_data?: Json | null
          status?: Database["public"]["Enums"]["response_status"]
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: string
          campaign_instance_id?: string | null
          created_at?: string | null
          id?: string
          response_data?: Json
          state_data?: Json | null
          status?: Database["public"]["Enums"]["response_status"]
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "survey_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_campaign_instance_id_fkey"
            columns: ["campaign_instance_id"]
            isOneToOne: false
            referencedRelation: "campaign_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_campaign_instance_id_fkey"
            columns: ["campaign_instance_id"]
            isOneToOne: false
            referencedRelation: "upcoming_survey_deadlines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          json_data: Json
          name: string
          status: Database["public"]["Enums"]["survey_status"] | null
          tags: string[] | null
          theme_settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          json_data: Json
          name: string
          status?: Database["public"]["Enums"]["survey_status"] | null
          tags?: string[] | null
          theme_settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          json_data?: Json
          name?: string
          status?: Database["public"]["Enums"]["survey_status"] | null
          tags?: string[] | null
          theme_settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      system_versions: {
        Row: {
          applied_at: string | null
          changelog: string | null
          created_by: string | null
          edge_functions_version: string
          frontend_version: string
          id: string
          is_current: boolean | null
          migration_script: string | null
          release_notes: string | null
          released_at: string | null
          schema_version: string
          version: string
        }
        Insert: {
          applied_at?: string | null
          changelog?: string | null
          created_by?: string | null
          edge_functions_version: string
          frontend_version: string
          id?: string
          is_current?: boolean | null
          migration_script?: string | null
          release_notes?: string | null
          released_at?: string | null
          schema_version: string
          version: string
        }
        Update: {
          applied_at?: string | null
          changelog?: string | null
          created_by?: string | null
          edge_functions_version?: string
          frontend_version?: string
          id?: string
          is_current?: boolean | null
          migration_script?: string | null
          release_notes?: string | null
          released_at?: string | null
          schema_version?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          progress: Json
          unlocked_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          progress?: Json
          unlocked_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          progress?: Json
          unlocked_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sbus: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          sbu_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          sbu_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          sbu_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sbus_sbu_id_fkey"
            columns: ["sbu_id"]
            isOneToOne: false
            referencedRelation: "sbus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sbus_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sbus_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_supervisors: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          supervisor_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          supervisor_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          supervisor_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_supervisors_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_supervisors_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_supervisors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_supervisors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      demographic_gender_analysis: {
        Row: {
          gender: string | null
          response_count: number | null
        }
        Relationships: []
      }
      managers_needing_improvement: {
        Row: {
          average_score: number | null
          improvement_rank: number | null
          manager_id: string | null
          manager_name: string | null
          total_ratings: number | null
          total_respondents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_supervisors_supervisor_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_supervisors_supervisor_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      recent_activities: {
        Row: {
          activity_time: string | null
          activity_type: string | null
          campaign_name: string | null
          id: string | null
          survey_name: string | null
          user_name: string | null
        }
        Relationships: []
      }
      response_trends: {
        Row: {
          response_count: number | null
          response_date: string | null
          unique_respondents: number | null
        }
        Relationships: []
      }
      silent_employees: {
        Row: {
          designation: string | null
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          last_response_date: string | null
          level: string | null
          location: string | null
          participation_status: string | null
          sbu_name: string | null
          total_assignments: number | null
          total_responses: number | null
        }
        Relationships: []
      }
      survey_response_trends: {
        Row: {
          date: string | null
          response_count: number | null
          unique_respondents: number | null
        }
        Relationships: []
      }
      top_performing_managers: {
        Row: {
          average_score: number | null
          manager_id: string | null
          manager_name: string | null
          rank: number | null
          total_ratings: number | null
          total_respondents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_supervisors_supervisor_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_supervisors_supervisor_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      top_performing_sbus: {
        Row: {
          average_score: number | null
          rank: number | null
          sbu_id: string | null
          sbu_name: string | null
          total_ratings: number | null
          total_respondents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sbus_sbu_id_fkey"
            columns: ["sbu_id"]
            isOneToOne: false
            referencedRelation: "sbus"
            referencedColumns: ["id"]
          },
        ]
      }
      upcoming_survey_deadlines: {
        Row: {
          campaign_id: string | null
          campaign_name: string | null
          ends_at: string | null
          id: string | null
          pending_responses: number | null
          survey_name: string | null
          total_assignments: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_instances_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_campaign_instances_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_progress: {
        Args: {
          p_measurement_type: string
          p_current_value: number
          p_start_value: number
          p_target_value: number
          p_boolean_value: boolean
        }
        Returns: number
      }
      check_and_award_achievements: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      check_user_board_access: {
        Args: { p_user_id: string; p_board_id: string; p_access_type: string }
        Returns: boolean
      }
      create_next_campaign_instance: {
        Args: { p_campaign_id: string }
        Returns: string
      }
      decrement_vote_count: {
        Args: { issue_id: string }
        Returns: undefined
      }
      delete_auth_user_complete: {
        Args: { in_user_id: string }
        Returns: Database["public"]["CompositeTypes"]["user_deletion_result"]
      }
      delete_survey_assignment: {
        Args: { p_assignment_id: string }
        Returns: Json
      }
      get_assignment_instance_status: {
        Args: { p_assignment_id: string; p_instance_id: string }
        Returns: Database["public"]["Enums"]["assignment_status"]
      }
      get_campaign_analysis_data: {
        Args: { p_campaign_id: string; p_instance_id: string }
        Returns: Json
      }
      get_campaign_assignments: {
        Args: { p_campaign_id: string; p_instance_id: string }
        Returns: {
          id: string
          user_id: string
          campaign_id: string
          public_access_token: string
          last_reminder_sent: string
          status: string
          user_details: Json
          response: Json
        }[]
      }
      get_campaign_instance_status_distribution: {
        Args: { p_campaign_id: string; p_instance_id: string }
        Returns: {
          status: string
          count: number
        }[]
      }
      get_campaign_instances: {
        Args: {
          p_campaign_id: string
          p_start_date_min?: string
          p_start_date_max?: string
          p_end_date_min?: string
          p_end_date_max?: string
          p_status?: string[]
          p_sort_by?: string
          p_sort_direction?: string
          p_page?: number
          p_page_size?: number
        }
        Returns: {
          id: string
          campaign_id: string
          period_number: number
          starts_at: string
          ends_at: string
          status: string
          completion_rate: number
          created_at: string
          updated_at: string
          total_count: number
        }[]
      }
      get_campaign_sbu_performance: {
        Args: { p_campaign_id: string; p_instance_id: string }
        Returns: {
          rank: number
          sbu_name: string
          total_assigned: number
          total_completed: number
          avg_score: number
          completion_rate: number
        }[]
      }
      get_campaign_supervisor_performance: {
        Args: { p_campaign_id: string; p_instance_id: string }
        Returns: {
          rank: number
          supervisor_name: string
          sbu_name: string
          total_assigned: number
          total_completed: number
          avg_score: number
          completion_rate: number
        }[]
      }
      get_current_system_version: {
        Args: Record<PropertyKey, never>
        Returns: {
          version: string
          released_at: string
          applied_at: string
          schema_version: string
          frontend_version: string
          edge_functions_version: string
          changelog: string
          release_notes: string
        }[]
      }
      get_dimension_bool: {
        Args: {
          p_campaign_id: string
          p_instance_id: string
          p_question_name: string
          p_dimension: string
        }
        Returns: {
          dimension: string
          yes_count: number
          no_count: number
          total_count: number
        }[]
      }
      get_dimension_nps: {
        Args: {
          p_campaign_id: string
          p_instance_id: string
          p_question_name: string
          p_dimension: string
        }
        Returns: {
          dimension: string
          detractors: number
          passives: number
          promoters: number
          total: number
          nps_score: number
          avg_score: number
        }[]
      }
      get_dimension_satisfaction: {
        Args: {
          p_campaign_id: string
          p_instance_id: string
          p_question_name: string
          p_dimension: string
        }
        Returns: {
          dimension: string
          unsatisfied: number
          neutral: number
          satisfied: number
          total: number
          avg_score: number
        }[]
      }
      get_instance_analysis_data: {
        Args: { p_campaign_id: string; p_instance_id: string }
        Returns: Json
      }
      get_instance_assignment_status: {
        Args: { p_assignment_id: string; p_instance_id: string }
        Returns: string
      }
      get_instance_question_responses: {
        Args: { p_campaign_id: string; p_instance_id: string }
        Returns: {
          campaign_instance_id: string
          response_count: number
          avg_numeric_value: number
          yes_percentage: number
          question_key: string
          text_responses: string[]
        }[]
      }
      get_my_survey_assignments: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          survey_id: string
          campaign_id: string
          user_id: string
          public_access_token: string
          last_reminder_sent: string
          instance: Json
          survey: Json
          status: string
          response: Json
        }[]
      }
      get_paginated_campaign_assignments: {
        Args: {
          p_campaign_id: string
          p_instance_id?: string
          p_status?: string
          p_search_term?: string
          p_page?: number
          p_page_size?: number
        }
        Returns: {
          id: string
          user_id: string
          campaign_id: string
          public_access_token: string
          last_reminder_sent: string
          status: string
          user_details: Json
          response: Json
          total_count: number
        }[]
      }
      get_paginated_campaign_responses: {
        Args: {
          p_campaign_id: string
          p_instance_id: string
          p_search_term?: string
          p_page?: number
          p_page_size?: number
          p_sort_by?: string
          p_sort_direction?: string
        }
        Returns: {
          id: string
          assignment_id: string
          user_id: string
          campaign_instance_id: string
          created_at: string
          updated_at: string
          submitted_at: string
          status: string
          response_data: Json
          state_data: Json
          total_count: number
          campaign_anonymous: boolean
          primary_sbu_name: string
          primary_supervisor_name: string
        }[]
      }
      get_pending_surveys_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_supervisor_team_feedback: {
        Args: {
          p_campaign_id: string
          p_instance_id: string
          p_supervisor_id: string
          p_question_name?: string
        }
        Returns: Json
      }
      get_supervisor_team_trend: {
        Args: {
          p_campaign_id: string
          p_supervisor_id: string
          p_question_name?: string
        }
        Returns: Json
      }
      get_supervisors_with_min_reportees: {
        Args: {
          min_reportees?: number
          p_campaign_id?: string
          p_instance_id?: string
        }
        Returns: {
          supervisor_id: string
          reportee_count: number
        }[]
      }
      get_survey_responses: {
        Args: { p_campaign_id: string; p_instance_id?: string }
        Returns: Json
      }
      get_survey_responses_for_export: {
        Args: { p_campaign_id: string; p_instance_id: string }
        Returns: {
          primary_sbu: string
          primary_manager: string
          respondent_name: string
          response_data: Json
          submitted_at: string
        }[]
      }
      get_text_analysis: {
        Args: {
          p_campaign_id: string
          p_instance_id: string
          p_question_name: string
        }
        Returns: Json
      }
      handle_instance_activation: {
        Args: { p_campaign_id: string }
        Returns: number
      }
      handle_instance_completion: {
        Args: { p_campaign_id: string }
        Returns: number
      }
      increment_vote_count: {
        Args: { issue_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_uid: string }
        Returns: boolean
      }
      manage_instance_cron_job: {
        Args: {
          p_campaign_id: string
          p_job_type: string
          p_cron_schedule: string
          p_is_active: boolean
        }
        Returns: string
      }
      reorder_questions: {
        Args: {
          p_session_id: string
          p_question_id: string
          p_old_order: number
          p_new_order: number
          p_direction: string
        }
        Returns: boolean
      }
      run_instance_job_now: {
        Args: { p_campaign_id: string; p_job_type: string }
        Returns: number
      }
      search_live_sessions: {
        Args: {
          search_text: string
          status_filters: string[]
          created_by_user: string
        }
        Returns: {
          id: string
          name: string
          join_code: string
          status: Database["public"]["Enums"]["session_status"]
          created_at: string
          description: string
          survey_id: string
          created_by: string
        }[]
      }
      search_users: {
        Args:
          | {
              search_text: string
              page_number: number
              page_size: number
              sbu_filter?: string
            }
          | {
              search_text: string
              page_number: number
              page_size: number
              sbu_filter?: string
              level_filter?: string
              location_filter?: string
              employment_type_filter?: string
              employee_role_filter?: string
              employee_type_filter?: string
            }
        Returns: {
          profile: Json
          total_count: number
        }[]
      }
      toggle_instance_cron_job: {
        Args: {
          p_campaign_id: string
          p_job_type: string
          p_is_active: boolean
        }
        Returns: boolean
      }
      update_campaign_instance: {
        Args: {
          p_instance_id: string
          p_new_starts_at: string
          p_new_ends_at: string
          p_new_status: string
        }
        Returns: {
          id: string
          campaign_id: string
          period_number: number
          starts_at: string
          ends_at: string
          status: string
          completion_rate: number
          created_at: string
          updated_at: string
          error_message: string
        }[]
      }
      update_completion_rate: {
        Args: { instance_id: string }
        Returns: number
      }
      update_system_version: {
        Args: {
          p_version: string
          p_schema_version: string
          p_frontend_version: string
          p_edge_functions_version: string
          p_changelog: string
          p_release_notes: string
          p_migration_scripts: string[]
          p_created_by: string
        }
        Returns: string
      }
    }
    Enums: {
      achievement_category:
        | "survey_completion"
        | "response_rate"
        | "streak"
        | "quality"
        | "special_event"
      achievement_condition_type:
        | "survey_count"
        | "response_rate"
        | "streak_days"
        | "response_quality"
        | "event_participation"
      achievement_status: "active" | "inactive"
      achievement_type:
        | "survey_completion"
        | "response_rate"
        | "streak"
        | "campaign_completion"
      approval_status: "pending" | "approved" | "rejected" | "requested_changes"
      assignment_status: "pending" | "completed" | "expired"
      campaign_status: "draft" | "active" | "completed" | "archived"
      config_status: "active" | "inactive"
      cron_job_type:
        | "instance_activation"
        | "instance_due_time"
        | "campaign_end"
      email_provider: "resend"
      employee_role_status: "active" | "inactive"
      employee_type_status: "active" | "inactive"
      employment_type_status: "active" | "inactive"
      gender_type: "male" | "female" | "other"
      grading_criteria_status: "active" | "inactive"
      instance_status: "upcoming" | "active" | "completed"
      issue_board_status: "active" | "disabled"
      issue_status: "open" | "closed"
      level_status: "active" | "inactive"
      profile_status: "active" | "disabled"
      prompt_category:
        | "general_analysis"
        | "demographic_insights"
        | "response_patterns"
        | "improvement_suggestions"
        | "action_items"
      prompt_status: "active" | "inactive"
      recurring_frequency:
        | "one_time"
        | "daily"
        | "weekly"
        | "monthly"
        | "quarterly"
        | "yearly"
      response_status: "assigned" | "in_progress" | "submitted" | "expired"
      scenario_status: "active" | "inactive" | "draft"
      session_status: "initial" | "active" | "paused" | "ended"
      survey_status: "draft" | "published" | "archived"
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      user_deletion_result: {
        success: boolean | null
        error_message: string | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      achievement_category: [
        "survey_completion",
        "response_rate",
        "streak",
        "quality",
        "special_event",
      ],
      achievement_condition_type: [
        "survey_count",
        "response_rate",
        "streak_days",
        "response_quality",
        "event_participation",
      ],
      achievement_status: ["active", "inactive"],
      achievement_type: [
        "survey_completion",
        "response_rate",
        "streak",
        "campaign_completion",
      ],
      approval_status: ["pending", "approved", "rejected", "requested_changes"],
      assignment_status: ["pending", "completed", "expired"],
      campaign_status: ["draft", "active", "completed", "archived"],
      config_status: ["active", "inactive"],
      cron_job_type: [
        "instance_activation",
        "instance_due_time",
        "campaign_end",
      ],
      email_provider: ["resend"],
      employee_role_status: ["active", "inactive"],
      employee_type_status: ["active", "inactive"],
      employment_type_status: ["active", "inactive"],
      gender_type: ["male", "female", "other"],
      grading_criteria_status: ["active", "inactive"],
      instance_status: ["upcoming", "active", "completed"],
      issue_board_status: ["active", "disabled"],
      issue_status: ["open", "closed"],
      level_status: ["active", "inactive"],
      profile_status: ["active", "disabled"],
      prompt_category: [
        "general_analysis",
        "demographic_insights",
        "response_patterns",
        "improvement_suggestions",
        "action_items",
      ],
      prompt_status: ["active", "inactive"],
      recurring_frequency: [
        "one_time",
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "yearly",
      ],
      response_status: ["assigned", "in_progress", "submitted", "expired"],
      scenario_status: ["active", "inactive", "draft"],
      session_status: ["initial", "active", "paused", "ended"],
      survey_status: ["draft", "published", "archived"],
      user_role: ["admin", "user"],
    },
  },
} as const
