
import { Response, RPCResponseItem } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { unparse } from "papaparse";

export async function exportResponses(responses: Response[] | RPCResponseItem[], campaignId: string, instanceId: string) {
  if (!responses.length) return;

  // Get the formatted data from our database function
  const { data: exportData, error } = await supabase
    .rpc('get_survey_responses_for_export', {
      p_campaign_id: campaignId,
      p_instance_id: instanceId
    });

  if (error) {
    console.error('Error fetching export data:', error);
    return;
  }

  // Get all possible questions from all responses
  const allQuestions = new Set<string>();
  exportData.forEach(row => {
    Object.keys(row.response_data).forEach(question => {
      allQuestions.add(question);
    });
  });

  // Convert responses to CSV format
  const data = exportData.map(row => {
    // Start with metadata columns
    const csvRow: Record<string, any> = {
      'Primary SBU': row.primary_sbu,
      'Primary Manager': row.primary_manager,
      'Respondent': row.respondent_name,
      'Submitted At': new Date(row.submitted_at).toLocaleString()
    };

    // Add each question's response
    allQuestions.forEach(question => {
      const answer = row.response_data[question];
      // Format the answer based on its type
      if (typeof answer === 'boolean') {
        csvRow[question] = answer ? 'Yes' : 'No';
      } else if (answer === null || answer === undefined) {
        csvRow[question] = 'N/A';
      } else {
        csvRow[question] = answer;
      }
    });

    return csvRow;
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
