
export interface ActiveQuestion {
  id: string;
  question_key: string;
  question_data: {
    title: string;
    type: string;
    choices?: { text: string; value: string; }[];
    rateMax?: number;
    rateCount?: number;
  };
  session_id: string;
  status: string;
  display_order: number;
}

export interface ParticipantInfo {
  participantId: string;
  displayName: string;
}
