
export interface BackgroundTheme {
  id: string;
  name: string;
  type: 'solid' | 'gradient' | 'pattern';
  primary: string;
  secondary?: string;
  angle?: number;
  opacity?: number;
}

export const BACKGROUND_THEMES: BackgroundTheme[] = [
  {
    id: 'clean-white',
    name: 'Clean White',
    type: 'solid',
    primary: 'FFFFFF'
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    type: 'gradient',
    primary: 'F8FAFC',
    secondary: 'E2E8F0',
    angle: 45
  },
  {
    id: 'modern-purple',
    name: 'Modern Purple',
    type: 'gradient',
    primary: 'FAF5FF',
    secondary: 'F3E8FF',
    angle: 135
  },
  {
    id: 'professional-gray',
    name: 'Professional Gray',
    type: 'gradient',
    primary: 'F9FAFB',
    secondary: 'F3F4F6',
    angle: 90
  },
  {
    id: 'warm-orange',
    name: 'Warm Orange',
    type: 'gradient',
    primary: 'FFFBEB',
    secondary: 'FEF3C7',
    angle: 45
  },
  {
    id: 'cool-teal',
    name: 'Cool Teal',
    type: 'gradient',
    primary: 'F0FDFA',
    secondary: 'CCFBF1',
    angle: 135
  }
];

export const createSlideBackground = (theme: BackgroundTheme) => {
  if (theme.type === 'solid') {
    return { color: theme.primary };
  }
  
  if (theme.type === 'gradient' && theme.secondary) {
    return {
      type: 'gradient',
      angle: theme.angle || 45,
      colors: [theme.primary, theme.secondary]
    };
  }
  
  return { color: 'FFFFFF' };
};
