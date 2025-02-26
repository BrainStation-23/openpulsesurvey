
export interface ActiveQuestion {
  id: string;
  question_key: string;
  question_data: {
    type: string;
    choices?: { text: string; value: string; }[];
    [key: string]: any;
  };
  title: string;
  session_id: string;
  status: string;
  display_order: number;
}

export interface ParticipantInfo {
  participantId: string;
  displayName: string;
}
