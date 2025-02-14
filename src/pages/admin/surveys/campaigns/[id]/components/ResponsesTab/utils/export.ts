
import { Response } from "../types";
import { parse } from "papaparse";

export function exportResponses(responses: Response[]) {
  const data = responses.map(response => ({
    'Response ID': response.id,
    'Status': response.status,
    'User': response.user.first_name && response.user.last_name ? 
      `${response.user.first_name} ${response.user.last_name}` : 
      'Anonymous',
    'Email': response.user.email,
    'Department': response.user.user_sbus.find(sbu => sbu.is_primary)?.sbu.name || 'N/A',
    'Supervisor': response.user.user_supervisors.find(sup => sup.is_primary)?.supervisor.first_name 
      ? `${response.user.user_supervisors.find(sup => sup.is_primary)?.supervisor.first_name} ${response.user.user_supervisors.find(sup => sup.is_primary)?.supervisor.last_name}`
      : 'N/A',
    'Created At': new Date(response.created_at).toLocaleString(),
    'Updated At': new Date(response.updated_at).toLocaleString(),
    'Submitted At': response.submitted_at ? new Date(response.submitted_at).toLocaleString() : 'N/A',
    'Response Data': JSON.stringify(response.response_data),
  }));

  const csv = parse(data, {
    quotes: true,
    skipEmptyLines: true
  });

  // Create blob and download
  const blob = new Blob([csv.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `survey-responses-${new Date().toISOString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
