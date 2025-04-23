
import { 
  ResponseBasicData, 
  DataMaps
} from "./types";
import { 
  SurveyQuestion, 
  ProcessedResponse, 
  QuestionResponse 
} from "../types";

/**
 * Processes raw response data into structured format
 */
export function processResponses(
  responses: ResponseBasicData[],
  questions: SurveyQuestion[],
  dataMaps: DataMaps
): ProcessedResponse[] {
  return responses.map(response => {
    const { userMap, sbuMap, supervisorMap } = dataMaps;
    const user = userMap.get(response.user_id);
    
    // Process answers for each question
    const answers: Record<string, QuestionResponse> = {};
    questions.forEach(question => {
      const answer = response?.response_data?.[question.name];
      answers[question.name] = {
        question: question.title,
        answer: answer,
        questionType: question.type,
        rateCount: question.rateCount
      };
    });

    return {
      id: response.id,
      respondent: {
        name: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "",
        email: user?.email || "",
        gender: user?.gender || null,
        location: user?.location || null,
        sbu: sbuMap.get(response.user_id) || null,
        employment_type: user?.employment_type || null,
        level: user?.level || null,
        employee_type: user?.employee_type || null,
        employee_role: user?.employee_role || null,
        supervisor: supervisorMap.get(response.user_id) || null
      },
      submitted_at: response.submitted_at,
      answers,
    };
  });
}
