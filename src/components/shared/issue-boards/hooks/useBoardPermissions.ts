import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BoardPermissionResult {
  can_view: boolean;
  can_create: boolean;
  can_vote: boolean;
  applied_rules: Array<{
    rule_name: string;
    rule_type: string;
    priority: number;
    permissions: {
      can_view: boolean;
      can_create: boolean;
      can_vote: boolean;
    };
  }>;
  user_context: {
    level_id?: string;
    location_id?: string;
    employment_type_id?: string;
    employee_type_id?: string;
    employee_role_id?: string;
    sbu_ids?: string[];
  };
  error?: string;
}

export function useBoardPermissions(boardId: string) {
  return useQuery({
    queryKey: ['board-permissions', boardId],
    queryFn: async (): Promise<BoardPermissionResult> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          can_view: false,
          can_create: false,
          can_vote: false,
          applied_rules: [],
          user_context: {},
          error: 'Not authenticated'
        };
      }

      const { data, error } = await supabase.rpc('get_user_board_permissions', {
        p_user_id: user.id,
        p_board_id: boardId
      });

      if (error) {
        console.error('Error fetching board permissions:', error);
        return {
          can_view: false,
          can_create: false,
          can_vote: false,
          applied_rules: [],
          user_context: {},
          error: error.message
        };
      }

      return (data || {
        can_view: false,
        can_create: false,
        can_vote: false,
        applied_rules: [],
        user_context: {}
      }) as BoardPermissionResult;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}