
import { Response } from "../types";

export function exportResponses(responses: Response[]) {
  const csvData = responses.map(response => ({
    'Response ID': response.id,
    'User': `${response.user.first_name} ${response.user.last_name}`,
    'Email': response.user.email,
    'Department': response.user.user_sbus.find(sbu => sbu.is_primary)?.sbu.name || 'N/A',
    'Status': response.status,
    'Created At': new Date(response.created_at).toLocaleString(),
    'Updated At': new Date(response.updated_at).toLocaleString(),
  }));

  const csv = [
    Object.keys(csvData[0]).join(','),
    ...csvData.map(row => Object.values(row).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `responses-${new Date().toISOString()}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
