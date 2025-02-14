
import { Response } from "../types";
import { unparse } from "papaparse";

export function exportResponses(responses: Response[]) {
  if (!responses.length) return;

  // Get all possible questions from all responses to handle cases where questions might differ
  const allQuestions = new Set<string>();
  responses.forEach(response => {
    Object.keys(response.response_data).forEach(question => {
      allQuestions.add(question);
    });
  });

  // Convert responses to CSV format
  const data = responses.map(response => {
    // Start with department and supervisor
    const row: Record<string, any> = {
      'Department': response.user.user_sbus.find(sbu => sbu.is_primary)?.sbu.name || 'N/A',
      'Supervisor': response.user.user_supervisors.find(sup => sup.is_primary)?.supervisor.first_name 
        ? `${response.user.user_supervisors.find(sup => sup.is_primary)?.supervisor.first_name} ${response.user.user_supervisors.find(sup => sup.is_primary)?.supervisor.last_name}`
        : 'N/A',
    };

    // Add each question's response
    allQuestions.forEach(question => {
      const answer = response.response_data[question];
      // Format the answer based on its type
      if (typeof answer === 'boolean') {
        row[question] = answer ? 'Yes' : 'No';
      } else if (answer === null || answer === undefined) {
        row[question] = 'N/A';
      } else {
        row[question] = answer;
      }
    });

    return row;
  });

  const csv = unparse(data, {
    quotes: true,
    skipEmptyLines: true
  });

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `survey-responses-${new Date().toISOString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
