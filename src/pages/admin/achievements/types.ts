
export type AchievementType = 
  | 'survey_completion'
  | 'response_rate'
  | 'streak'
  | 'campaign_completion';

export interface AchievementTypeConfig {
  label: string;
  description: string;
  conditionFields: {
    [key: string]: {
      type: 'number' | 'text' | 'select';
      label: string;
      description: string;
      options?: { label: string; value: string; }[];
    };
  };
}

export const ACHIEVEMENT_TYPE_CONFIG: Record<AchievementType, AchievementTypeConfig> = {
  survey_completion: {
    label: 'Survey Completion',
    description: 'Track survey completion milestones',
    conditionFields: {
      required_count: {
        type: 'number',
        label: 'Required Surveys',
        description: 'Number of surveys that need to be completed'
      }
    }
  },
  response_rate: {
    label: 'Response Rate',
    description: 'Track response rate achievements',
    conditionFields: {
      required_rate: {
        type: 'number',
        label: 'Required Response Rate (%)',
        description: 'Minimum percentage of surveys that need to be completed'
      }
    }
  },
  streak: {
    label: 'Streak',
    description: 'Track participation streak achievements',
    conditionFields: {
      required_days: {
        type: 'number',
        label: 'Required Days',
        description: 'Number of consecutive days required'
      }
    }
  },
  campaign_completion: {
    label: 'Campaign Completion',
    description: 'Track campaign completion milestones',
    conditionFields: {
      required_count: {
        type: 'number',
        label: 'Required Campaigns',
        description: 'Number of unique campaigns that need to be completed'
      }
    }
  }
};
