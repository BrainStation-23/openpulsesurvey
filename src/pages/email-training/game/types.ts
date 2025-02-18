
export interface GeneratedEmail {
  from: string;
  subject: string;
  content: string;
  tone: string;
  key_points: string[];
}

export interface EmailResponse {
  subject: string;
  content: string;
}
