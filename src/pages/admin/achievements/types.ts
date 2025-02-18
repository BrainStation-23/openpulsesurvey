
export type AchievementType = 
  | 'survey_completion'
  | 'response_rate'
  | 'streak'
  | 'quality'
  | 'special_event';

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
  quality: {
    label: 'Quality',
    description: 'Track high-quality response achievements',
    conditionFields: {
      min_rating: {
        type: 'number',
        label: 'Minimum Rating',
        description: 'Minimum rating required for responses'
      },
      min_length: {
        type: 'number',
        label: 'Minimum Response Length',
        description: 'Minimum character count for text responses'
      }
    }
  },
  special_event: {
    label: 'Special Event',
    description: 'Track special event participation',
    conditionFields: {
      event_type: {
        type: 'select',
        label: 'Event Type',
        description: 'Type of event to track',
        options: [
          { label: 'Survey Campaign', value: 'survey_campaign' },
          { label: 'Feedback Session', value: 'feedback_session' },
          { label: 'Special Survey', value: 'special_survey' }
        ]
      },
      participation_count: {
        type: 'number',
        label: 'Required Participations',
        description: 'Number of times user needs to participate'
      }
    }
  }
};
