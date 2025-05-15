
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from './useCurrentUser';

export interface TeamFeedbackOptions {
  campaignId: string | null;
  instanceId: string | null;
  questionName?: string;
}

export const useTeamFeedback = ({ campaignId, instanceId, questionName }: TeamFeedbackOptions) => {
  const { user } = useCurrentUser();
  
  return useQuery({
    queryKey: ['team-feedback', campaignId, instanceId, questionName, user?.id],
    queryFn: async () => {
      if (!campaignId || !instanceId || !user?.id) {
        throw new Error('Missing required parameters');
      }

      const { data, error } = await supabase.rpc('get_supervisor_team_feedback', {
        p_campaign_id: campaignId,
        p_instance_id: instanceId,
        p_supervisor_id: user.id,
        p_question_name: questionName || null
      });

      if (error) {
        throw new Error(`Error fetching team feedback: ${error.message}`);
      }

      return data;
    },
    enabled: Boolean(campaignId && instanceId && user?.id),
  });
};
