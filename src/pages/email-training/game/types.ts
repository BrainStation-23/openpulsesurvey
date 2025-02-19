
export interface GeneratedEmail {
  subject: string;
  content: string;
  key_points?: string[];
  from: {
    name: string;
    email: string;
  };
}

export interface EmailResponse {
  subject: string;
  content: string;
}

export interface EmailGrade {
  scores: {
    professionalism: number;
    completeness: number;
    clarity: number;
    solution_quality: number;
    total_score: number;
  };
  analysis: {
    strengths: string[];
    areas_for_improvement: string[];
    detailed_feedback: string;
  };
}

export interface GradingResponse {
  grade: EmailGrade;
  aiResponse: string;
  isComplete: boolean;
}

export interface EmailMessage {
  id: string;
  type: 'client' | 'user';
  content: string;
  timestamp: string;
}
