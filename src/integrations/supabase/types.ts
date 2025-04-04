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
      campaign_cron_job_logs: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          cron_schedule: string | null
          error_message: string | null
          id: string
          job_name: string | null
          status: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          cron_schedule?: string | null
          error_message?: string | null
          id?: string
          job_name?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          cron_schedule?: string | null
          error_message?: string | null
          id?: string
          job_name?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_cron_job_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_cron_job_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "top_performing_surveys"
            referencedColumns: ["campaign_id"]
          },
        ]
      }
      campaign_cron_jobs: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          cron_schedule: string
          id: string
          is_active: boolean | null
          job_name: string
          job_type: Database["public"]["Enums"]["cron_job_type"]
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          cron_schedule: string
          id?: string
          is_active?: boolean | null
          job_name: string
          job_type?: Database["public"]["Enums"]["cron_job_type"]
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          cron_schedule?: string
          id?: string
          is_active?: boolean | null
          job_name?: string
          job_type?: Database["public"]["Enums"]["cron_job_type"]
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
          {
            foreignKeyName: "campaign_cron_jobs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "top_performing_surveys"
            referencedColumns: ["campaign_id"]
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
          completion_rate: number | null
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
          completion_rate?: number | null
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
          completion_rate?: number | null
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
            foreignKeyName: "campaign_instances_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "top_performing_surveys"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "fk_campaign_instances_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_campaign_instances_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "top_performing_surveys"
            referencedColumns: ["campaign_id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          error_message: string | null
          id: string
          message: string
          name: string
          sent_to: string[] | null
          status: Database["public"]["Enums"]["contact_message_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          message: string
          name: string
          sent_to?: string[] | null
          status?: Database["public"]["Enums"]["contact_message_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          message?: string
          name?: string
          sent_to?: string[] | null
          status?: Database["public"]["Enums"]["contact_message_status"]
          updated_at?: string
        }
        Relationships: []
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
      email_responses: {
        Row: {
          attempt_number: number
          created_at: string
          id: string
          original_email: Json
          response_email: Json | null
          session_id: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          attempt_number?: number
          created_at?: string
          id?: string
          original_email: Json
          response_email?: Json | null
          session_id: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          attempt_number?: number
          created_at?: string
          id?: string
          original_email?: Json
          response_email?: Json | null
          session_id?: string
          submitted_at?: string | null
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
      key_results: {
        Row: {
          boolean_value: boolean | null
          created_at: string
          current_value: number | null
          description: string | null
          due_date: string | null
          id: string
          kr_type: string
          measurement_type: string | null
          objective_id: string
          owner_id: string
          progress: number | null
          start_value: number | null
          status: Database["public"]["Enums"]["kr_status"]
          target_value: number
          title: string
          unit: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          boolean_value?: boolean | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          kr_type: string
          measurement_type?: string | null
          objective_id: string
          owner_id: string
          progress?: number | null
          start_value?: number | null
          status?: Database["public"]["Enums"]["kr_status"]
          target_value: number
          title: string
          unit?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          boolean_value?: boolean | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          kr_type?: string
          measurement_type?: string | null
          objective_id?: string
          owner_id?: string
          progress?: number | null
          start_value?: number | null
          status?: Database["public"]["Enums"]["kr_status"]
          target_value?: number
          title?: string
          unit?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "key_results_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objective_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_results_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_results_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_results_owner_id_fkey"
            columns: ["owner_id"]
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
          status: Database["public"]["Enums"]["config_status"] | null
          updated_at: string
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["config_status"] | null
          updated_at?: string
        }
        Update: {
          color_code?: string | null
          created_at?: string
          id?: string
          name?: string
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
      objectives: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          cycle_id: string
          description: string | null
          id: string
          owner_id: string
          parent_objective_id: string | null
          progress: number | null
          progress_calculation_method: string | null
          sbu_id: string | null
          status: Database["public"]["Enums"]["objective_status"]
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["okr_visibility"]
        }
        Insert: {
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          cycle_id: string
          description?: string | null
          id?: string
          owner_id: string
          parent_objective_id?: string | null
          progress?: number | null
          progress_calculation_method?: string | null
          sbu_id?: string | null
          status?: Database["public"]["Enums"]["objective_status"]
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["okr_visibility"]
        }
        Update: {
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          cycle_id?: string
          description?: string | null
          id?: string
          owner_id?: string
          parent_objective_id?: string | null
          progress?: number | null
          progress_calculation_method?: string | null
          sbu_id?: string | null
          status?: Database["public"]["Enums"]["objective_status"]
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["okr_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "objectives_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "key_result_statistics"
            referencedColumns: ["cycle_id"]
          },
          {
            foreignKeyName: "objectives_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "okr_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_parent_objective_id_fkey"
            columns: ["parent_objective_id"]
            isOneToOne: false
            referencedRelation: "objective_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_parent_objective_id_fkey"
            columns: ["parent_objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_sbu_id_fkey"
            columns: ["sbu_id"]
            isOneToOne: false
            referencedRelation: "sbus"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_alignments: {
        Row: {
          aligned_objective_id: string
          alignment_type: string
          created_at: string
          created_by: string
          id: string
          source_objective_id: string
          weight: number | null
        }
        Insert: {
          aligned_objective_id: string
          alignment_type: string
          created_at?: string
          created_by: string
          id?: string
          source_objective_id: string
          weight?: number | null
        }
        Update: {
          aligned_objective_id?: string
          alignment_type?: string
          created_at?: string
          created_by?: string
          id?: string
          source_objective_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "okr_alignments_aligned_objective_id_fkey"
            columns: ["aligned_objective_id"]
            isOneToOne: false
            referencedRelation: "objective_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_alignments_aligned_objective_id_fkey"
            columns: ["aligned_objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_alignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_alignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_alignments_source_objective_id_fkey"
            columns: ["source_objective_id"]
            isOneToOne: false
            referencedRelation: "objective_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_alignments_source_objective_id_fkey"
            columns: ["source_objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_check_ins: {
        Row: {
          check_in_date: string
          confidence_level: number | null
          created_at: string
          created_by: string
          id: string
          key_result_id: string
          new_value: number
          notes: string | null
          previous_value: number | null
          status: Database["public"]["Enums"]["check_in_status"] | null
        }
        Insert: {
          check_in_date?: string
          confidence_level?: number | null
          created_at?: string
          created_by: string
          id?: string
          key_result_id: string
          new_value: number
          notes?: string | null
          previous_value?: number | null
          status?: Database["public"]["Enums"]["check_in_status"] | null
        }
        Update: {
          check_in_date?: string
          confidence_level?: number | null
          created_at?: string
          created_by?: string
          id?: string
          key_result_id?: string
          new_value?: number
          notes?: string | null
          previous_value?: number | null
          status?: Database["public"]["Enums"]["check_in_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "okr_check_ins_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_check_ins_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_check_ins_key_result_id_fkey"
            columns: ["key_result_id"]
            isOneToOne: false
            referencedRelation: "key_result_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_check_ins_key_result_id_fkey"
            columns: ["key_result_id"]
            isOneToOne: false
            referencedRelation: "key_results"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_comments: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          key_result_id: string | null
          objective_id: string | null
          parent_comment_id: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          key_result_id?: string | null
          objective_id?: string | null
          parent_comment_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          key_result_id?: string | null
          objective_id?: string | null
          parent_comment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "okr_comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_comments_key_result_id_fkey"
            columns: ["key_result_id"]
            isOneToOne: false
            referencedRelation: "key_result_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_comments_key_result_id_fkey"
            columns: ["key_result_id"]
            isOneToOne: false
            referencedRelation: "key_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_comments_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objective_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_comments_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "okr_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_cycles: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          status: Database["public"]["Enums"]["okr_cycle_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["okr_cycle_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["okr_cycle_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "okr_cycles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_cycles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_default_settings: {
        Row: {
          default_progress_calculation_method: string | null
          id: string
        }
        Insert: {
          default_progress_calculation_method?: string | null
          id?: string
        }
        Update: {
          default_progress_calculation_method?: string | null
          id?: string
        }
        Relationships: []
      }
      okr_history: {
        Row: {
          change_type: string
          changed_at: string
          changed_by: string
          entity_id: string
          entity_type: string
          id: string
          new_data: Json | null
          previous_data: Json | null
        }
        Insert: {
          change_type: string
          changed_at?: string
          changed_by: string
          entity_id: string
          entity_type: string
          id?: string
          new_data?: Json | null
          previous_data?: Json | null
        }
        Update: {
          change_type?: string
          changed_at?: string
          changed_by?: string
          entity_id?: string
          entity_type?: string
          id?: string
          new_data?: Json | null
          previous_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "okr_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_notifications: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          link: string | null
          message: string
          notification_type: string
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          link?: string | null
          message: string
          notification_type: string
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          link?: string | null
          message?: string
          notification_type?: string
          read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "okr_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_permissions: {
        Row: {
          can_comment: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string
          created_by: string
          employee_role_ids: string[] | null
          id: string
          objective_id: string
          sbu_ids: string[] | null
          updated_at: string
          user_ids: string[] | null
        }
        Insert: {
          can_comment?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string
          created_by: string
          employee_role_ids?: string[] | null
          id?: string
          objective_id: string
          sbu_ids?: string[] | null
          updated_at?: string
          user_ids?: string[] | null
        }
        Update: {
          can_comment?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string
          created_by?: string
          employee_role_ids?: string[] | null
          id?: string
          objective_id?: string
          sbu_ids?: string[] | null
          updated_at?: string
          user_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "okr_permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_permissions_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objective_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_permissions_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_progress_calculation_lock: {
        Row: {
          created_at: string
          locked: boolean
          objective_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          locked?: boolean
          objective_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          locked?: boolean
          objective_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      okr_role_settings: {
        Row: {
          can_align_with_dept_objectives: string[] | null
          can_align_with_org_objectives: string[] | null
          can_align_with_team_objectives: string[] | null
          can_create_alignments: string[] | null
          can_create_dept_objectives: string[] | null
          can_create_key_results: string[] | null
          can_create_objectives: string[] | null
          can_create_org_objectives: string[] | null
          can_create_team_objectives: string[] | null
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          can_align_with_dept_objectives?: string[] | null
          can_align_with_org_objectives?: string[] | null
          can_align_with_team_objectives?: string[] | null
          can_create_alignments?: string[] | null
          can_create_dept_objectives?: string[] | null
          can_create_key_results?: string[] | null
          can_create_objectives?: string[] | null
          can_create_org_objectives?: string[] | null
          can_create_team_objectives?: string[] | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          can_align_with_dept_objectives?: string[] | null
          can_align_with_org_objectives?: string[] | null
          can_align_with_team_objectives?: string[] | null
          can_create_alignments?: string[] | null
          can_create_dept_objectives?: string[] | null
          can_create_key_results?: string[] | null
          can_create_objectives?: string[] | null
          can_create_org_objectives?: string[] | null
          can_create_team_objectives?: string[] | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
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
            foreignKeyName: "fk_survey_assignments_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "top_performing_surveys"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "survey_assignments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_assignments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "top_performing_surveys"
            referencedColumns: ["campaign_id"]
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
          completion_rate: number | null
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
          completion_rate?: number | null
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
          completion_rate?: number | null
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
            referencedRelation: "top_performing_surveys"
            referencedColumns: ["instance_id"]
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
      demographic_employee_role_analysis: {
        Row: {
          employee_role: string | null
          response_count: number | null
        }
        Relationships: []
      }
      demographic_employee_type_analysis: {
        Row: {
          employee_type: string | null
          response_count: number | null
        }
        Relationships: []
      }
      demographic_employment_analysis: {
        Row: {
          employment_type: string | null
          response_count: number | null
        }
        Relationships: []
      }
      demographic_gender_analysis: {
        Row: {
          gender: string | null
          response_count: number | null
        }
        Relationships: []
      }
      demographic_level_analysis: {
        Row: {
          level: string | null
          response_count: number | null
        }
        Relationships: []
      }
      demographic_location_analysis: {
        Row: {
          location: string | null
          response_count: number | null
        }
        Relationships: []
      }
      department_performance: {
        Row: {
          completed_responses: number | null
          completion_rate: number | null
          sbu_name: string | null
          total_assignments: number | null
        }
        Relationships: []
      }
      instance_comparison_metrics: {
        Row: {
          avg_rating: number | null
          campaign_instance_id: string | null
          completion_rate: number | null
          ends_at: string | null
          gender_breakdown: Json | null
          location_breakdown: Json | null
          period_number: number | null
          starts_at: string | null
          total_responses: number | null
          unique_respondents: number | null
        }
        Relationships: [
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
            referencedRelation: "top_performing_surveys"
            referencedColumns: ["instance_id"]
          },
          {
            foreignKeyName: "survey_responses_campaign_instance_id_fkey"
            columns: ["campaign_instance_id"]
            isOneToOne: false
            referencedRelation: "upcoming_survey_deadlines"
            referencedColumns: ["id"]
          },
        ]
      }
      instance_question_comparison: {
        Row: {
          avg_numeric_value: number | null
          campaign_instance_id: string | null
          period_number: number | null
          question_key: string | null
          response_count: number | null
          text_responses: string[] | null
          yes_percentage: number | null
        }
        Relationships: [
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
            referencedRelation: "top_performing_surveys"
            referencedColumns: ["instance_id"]
          },
          {
            foreignKeyName: "survey_responses_campaign_instance_id_fkey"
            columns: ["campaign_instance_id"]
            isOneToOne: false
            referencedRelation: "upcoming_survey_deadlines"
            referencedColumns: ["id"]
          },
        ]
      }
      key_result_statistics: {
        Row: {
          check_ins_count: number | null
          comments_count: number | null
          current_value: number | null
          cycle_id: string | null
          cycle_name: string | null
          description: string | null
          id: string | null
          kr_type: string | null
          last_check_in: string | null
          measurement_type: string | null
          objective_id: string | null
          objective_title: string | null
          owner_id: string | null
          owner_name: string | null
          progress: number | null
          start_value: number | null
          status: Database["public"]["Enums"]["kr_status"] | null
          target_value: number | null
          title: string | null
          unit: string | null
          weight: number | null
        }
        Relationships: [
          {
            foreignKeyName: "key_results_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objective_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_results_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_results_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_results_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
        ]
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
      objective_statistics: {
        Row: {
          alignments_count: number | null
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          check_ins_count: number | null
          comments_count: number | null
          completed_key_results: number | null
          cycle_id: string | null
          cycle_name: string | null
          description: string | null
          id: string | null
          key_results_count: number | null
          owner_id: string | null
          owner_name: string | null
          parent_objective_id: string | null
          progress: number | null
          sbu_id: string | null
          sbu_name: string | null
          status: Database["public"]["Enums"]["objective_status"] | null
          title: string | null
          visibility: Database["public"]["Enums"]["okr_visibility"] | null
        }
        Relationships: [
          {
            foreignKeyName: "objectives_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "key_result_statistics"
            referencedColumns: ["cycle_id"]
          },
          {
            foreignKeyName: "objectives_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "okr_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "silent_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_parent_objective_id_fkey"
            columns: ["parent_objective_id"]
            isOneToOne: false
            referencedRelation: "objective_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_parent_objective_id_fkey"
            columns: ["parent_objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_sbu_id_fkey"
            columns: ["sbu_id"]
            isOneToOne: false
            referencedRelation: "sbus"
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
      survey_overview_metrics: {
        Row: {
          active_campaigns: number | null
          avg_completion_rate: number | null
          completed_campaigns: number | null
          total_responses: number | null
          total_surveys: number | null
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
      top_performing_surveys: {
        Row: {
          campaign_id: string | null
          campaign_name: string | null
          completion_rate: number | null
          ends_at: string | null
          instance_id: string | null
          period_number: number | null
          starts_at: string | null
          survey_name: string | null
          total_responses: number | null
        }
        Relationships: []
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
            foreignKeyName: "campaign_instances_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "top_performing_surveys"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "fk_campaign_instances_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_campaign_instances_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "top_performing_surveys"
            referencedColumns: ["campaign_id"]
          },
        ]
      }
    }
    Functions: {
      analyze_okr_progress_logs: {
        Args: {
          p_objective_id?: string
          p_limit?: number
        }
        Returns: {
          event_time: string
          entity_id: string
          entity_type: string
          change_type: string
          details: Json
        }[]
      }
      calculate_cascaded_objective_progress: {
        Args: {
          p_objective_id: string
        }
        Returns: undefined
      }
      calculate_instance_completion_rate: {
        Args: {
          instance_id: string
        }
        Returns: number
      }
      calculate_key_result_progress: {
        Args: {
          p_measurement_type: string
          p_current_value: number
          p_start_value: number
          p_target_value: number
          p_boolean_value: boolean
        }
        Returns: number
      }
      calculate_objective_progress_for_single_objective: {
        Args: {
          objective_id: string
        }
        Returns: undefined
      }
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
      can_create_alignment: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      can_create_alignment_by_visibility: {
        Args: {
          p_user_id: string
          p_visibility: string
        }
        Returns: boolean
      }
      can_create_key_result: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      can_create_objective: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      can_create_objective_alignment: {
        Args: {
          p_user_id: string
          p_source_objective_id: string
          p_aligned_objective_id: string
        }
        Returns: boolean
      }
      can_create_objective_by_visibility: {
        Args: {
          p_user_id: string
          p_visibility: string
        }
        Returns: boolean
      }
      check_and_award_achievements: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      check_objective_owner_permission: {
        Args: {
          p_user_id: string
          p_objective_id: string
        }
        Returns: boolean
      }
      check_okr_create_permission: {
        Args: {
          p_user_id: string
          p_permission_type: string
          p_visibility?: string
        }
        Returns: boolean
      }
      check_okr_objective_access: {
        Args: {
          p_user_id: string
          p_objective_id: string
          p_access_type: string
        }
        Returns: boolean
      }
      check_user_board_access: {
        Args: {
          p_user_id: string
          p_board_id: string
          p_access_type: string
        }
        Returns: boolean
      }
      cleanup_campaign_cron_jobs: {
        Args: {
          p_campaign_id: string
        }
        Returns: undefined
      }
      decrement_vote_count: {
        Args: {
          issue_id: string
        }
        Returns: undefined
      }
      delete_auth_user_complete: {
        Args: {
          in_user_id: string
        }
        Returns: Database["public"]["CompositeTypes"]["user_deletion_result"]
      }
      delete_survey_assignment: {
        Args: {
          p_assignment_id: string
        }
        Returns: Json
      }
      fix_all_instance_completion_rates: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      fix_missing_campaign_jobs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_campaign_cron_schedule: {
        Args: {
          p_timestamp: string
          p_recurring_frequency: string
          p_job_type: Database["public"]["Enums"]["cron_job_type"]
        }
        Returns: string
      }
      get_assignment_instance_status: {
        Args: {
          p_assignment_id: string
          p_instance_id: string
        }
        Returns: Database["public"]["Enums"]["assignment_status"]
      }
      get_campaign_analysis_data: {
        Args: {
          p_campaign_id: string
          p_instance_id: string
        }
        Returns: Json
      }
      get_campaign_assignments: {
        Args: {
          p_campaign_id: string
          p_instance_id: string
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
        }[]
      }
      get_campaign_instance_status_distribution: {
        Args: {
          p_campaign_id: string
          p_instance_id: string
        }
        Returns: {
          status: string
          count: number
        }[]
      }
      get_instance_analysis_data: {
        Args: {
          p_campaign_id: string
          p_instance_id: string
        }
        Returns: Json
      }
      get_instance_assignment_status: {
        Args: {
          p_assignment_id: string
          p_instance_id: string
        }
        Returns: string
      }
      get_my_survey_assignments: {
        Args: {
          p_user_id: string
        }
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
      get_pending_surveys_count: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      get_survey_responses_for_export: {
        Args: {
          p_campaign_id: string
          p_instance_id: string
        }
        Returns: {
          primary_sbu: string
          primary_manager: string
          respondent_name: string
          response_data: Json
          submitted_at: string
        }[]
      }
      handle_campaign_end: {
        Args: {
          p_campaign_id: string
        }
        Returns: undefined
      }
      handle_instance_activation: {
        Args: {
          p_campaign_id: string
        }
        Returns: undefined
      }
      handle_instance_due_time: {
        Args: {
          p_campaign_id: string
        }
        Returns: undefined
      }
      increment_vote_count: {
        Args: {
          issue_id: string
        }
        Returns: undefined
      }
      is_admin: {
        Args: {
          user_uid: string
        }
        Returns: boolean
      }
      recalculate_all_cascaded_objective_progress: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      recalculate_all_objective_progress: {
        Args: Record<PropertyKey, never>
        Returns: number
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
      schedule_campaign_cron_job: {
        Args: {
          p_campaign_id: string
        }
        Returns: undefined
      }
      schedule_campaign_jobs: {
        Args: {
          p_campaign_id: string
        }
        Returns: undefined
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
      search_objectives: {
        Args: {
          p_search_text?: string
          p_status_filters?: string[]
          p_visibility_filters?: string[]
          p_cycle_id?: string
          p_sbu_id?: string
          p_is_admin?: boolean
          p_user_id?: string
          p_page_number?: number
          p_page_size?: number
          p_sort_column?: string
          p_sort_direction?: string
        }
        Returns: Json
      }
      search_users:
        | {
            Args: {
              search_text: string
              page_number: number
              page_size: number
              sbu_filter?: string
            }
            Returns: {
              profile: Json
              total_count: number
            }[]
          }
        | {
            Args: {
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
      check_in_status: "on_track" | "at_risk" | "behind"
      config_status: "active" | "inactive"
      contact_message_status: "pending" | "sent" | "error" | "partially_sent"
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
      kr_status:
        | "not_started"
        | "in_progress"
        | "at_risk"
        | "on_track"
        | "completed"
        | "abandoned"
      level_status: "active" | "inactive"
      objective_status:
        | "draft"
        | "in_progress"
        | "at_risk"
        | "on_track"
        | "completed"
      okr_cycle_status: "active" | "upcoming" | "completed" | "archived"
      okr_visibility: "private" | "team" | "department" | "organization"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
