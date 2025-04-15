
export type QuestionType = 'boolean' | 'rating' | 'text' | 'comment';

export type RatingMode = 'nps' | 'satisfaction';

export interface BaseQuestion {
  name: string;
  title: string;
  type: QuestionType;
}

export interface RatingQuestion extends BaseQuestion {
  type: 'rating';
  mode?: RatingMode;
  rateCount: number; // 10 for NPS, 5 for satisfaction
}

export interface BooleanQuestion extends BaseQuestion {
  type: 'boolean';
}

export interface TextQuestion extends BaseQuestion {
  type: 'text' | 'comment';
}

export type Question = RatingQuestion | BooleanQuestion | TextQuestion;

// Type guards
export const isRatingQuestion = (question: Question): question is RatingQuestion => 
  question.type === 'rating';

export const isNpsQuestion = (question: Question): boolean => 
  isRatingQuestion(question) && (question.rateCount === 10 || question.mode === 'nps');

export const isSatisfactionQuestion = (question: Question): boolean => 
  isRatingQuestion(question) && !isNpsQuestion(question);

export const isValidNpsRating = (rating: number): boolean =>
  typeof rating === 'number' && rating >= 0 && rating <= 10;

export const isValidSatisfactionRating = (rating: number): boolean =>
  typeof rating === 'number' && rating >= 1 && rating <= 5;
