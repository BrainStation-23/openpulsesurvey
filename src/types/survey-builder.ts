
export type QuestionType = 'rating' | 'boolean' | 'text' | 'comment';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  isRequired?: boolean;
  description?: string;
}

export interface RatingQuestion extends BaseQuestion {
  type: 'rating';
  rateMax?: number;
  rateMin?: number;
  rateStep?: number;
  rateType?: 'stars' | 'smileys' | 'numbers';
}

export interface BooleanQuestion extends BaseQuestion {
  type: 'boolean';
  labelTrue?: string;
  labelFalse?: string;
}

export interface TextQuestion extends BaseQuestion {
  type: 'text';
  placeholder?: string;
  maxLength?: number;
}

export interface CommentQuestion extends BaseQuestion {
  type: 'comment';
  placeholder?: string;
  rows?: number;
}

export type Question = RatingQuestion | BooleanQuestion | TextQuestion | CommentQuestion;

export interface SurveyPage {
  id: string;
  title?: string;
  description?: string;
  questions: Question[];
}

export interface SurveyStructure {
  title: string;
  description?: string;
  pages: SurveyPage[];
  showProgressBar?: boolean;
  logoPosition?: 'left' | 'right' | 'none';
  logo?: string;
}

export interface SurveyBuilderProps {
  initialSurvey?: SurveyStructure;
  onSave: (survey: SurveyStructure) => void;
}
