
import { ActiveQuestion } from "../../types";

export function convertToActiveQuestion(dbQuestion: any): ActiveQuestion | null {
  if (!dbQuestion) return null;
  
  try {
    const questionData = typeof dbQuestion.question_data === 'string' 
      ? JSON.parse(dbQuestion.question_data)
      : dbQuestion.question_data;

    return {
      id: dbQuestion.id,
      question_key: dbQuestion.question_key,
      question_data: {
        type: questionData.type,
        choices: questionData.choices,
        ...questionData
      },
      title: dbQuestion.title || questionData.title || "Untitled Question",
      session_id: dbQuestion.session_id,
      status: dbQuestion.status,
      display_order: dbQuestion.display_order
    };
  } catch (error) {
    console.error("Error converting question data:", error);
    return null;
  }
}
