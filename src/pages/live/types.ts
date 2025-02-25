
export interface ActiveQuestion {
  id: string;
  question_key: string;
  question_data: {
    title: string;
    type: string;
    choices?: { text: string; value: string; }[];
  };
}

export interface ParticipantInfo {
  participantId: string;
  displayName: string;
}
