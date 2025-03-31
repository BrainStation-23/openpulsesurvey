
import { ObjectiveVisibility } from '@/types/okr';

// Helper function to get color class based on visibility
export const getVisibilityColorClass = (visibility: ObjectiveVisibility): string => {
  switch (visibility) {
    case 'organization':
      return 'bg-orange-50 hover:bg-orange-100 border-orange-200';
    case 'department':
      return 'bg-purple-50 hover:bg-purple-100 border-purple-200';
    case 'team':
      return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
    case 'private':
      return 'bg-gray-50 hover:bg-gray-100 border-gray-200';
    default:
      return 'hover:bg-accent';
  }
};

// Helper function to get visibility label
export const getVisibilityLabel = (visibility: ObjectiveVisibility): string => {
  switch (visibility) {
    case 'organization':
      return 'Organization';
    case 'department':
      return 'Department';
    case 'team':
      return 'Team';
    case 'private':
      return 'Private';
    default:
      return visibility;
  }
};
