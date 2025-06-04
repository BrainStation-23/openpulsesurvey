
import { ProcessedData } from "../../../types/responses";

export const getGroupedResponses = (
  processedData: ProcessedData,
  questionName: string,
  dimension: string
) => {
  const groupedData = new Map();

  processedData.responses.forEach((response) => {
    const answer = response.answers[questionName]?.answer;
    if (answer === undefined) return;

    let groupKey = "Unknown";
    switch (dimension) {
      case "supervisor":
        if (response.respondent.supervisor) {
          groupKey = `${response.respondent.supervisor.first_name} ${response.respondent.supervisor.last_name}`;
        }
        break;
      case "sbu":
        groupKey = response.respondent.sbu?.name || "Unknown";
        break;
      case "gender":
        groupKey = response.respondent.gender || "Unknown";
        break;
      case "location":
        groupKey = response.respondent.location?.name || "Unknown";
        break;
      case "employment_type":
        groupKey = response.respondent.employment_type?.name || "Unknown";
        break;
      case "level":
        groupKey = response.respondent.level?.name || "Unknown";
        break;
      case "employee_type":
        groupKey = response.respondent.employee_type?.name || "Unknown";
        break;
      case "employee_role":
        groupKey = response.respondent.employee_role?.name || "Unknown";
        break;
      case "generation":
        groupKey = response.respondent.generation || "Unknown";
        break;
    }

    if (!groupedData.has(groupKey)) {
      groupedData.set(groupKey, []);
    }
    groupedData.get(groupKey).push(answer);
  });

  return groupedData;
};

export const filterQuestionsByType = (processedData: ProcessedData) => {
  return processedData.questions.filter(
    question => question.type !== "text" && question.type !== "comment"
  );
};
