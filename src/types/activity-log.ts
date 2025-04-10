
export interface ActivityLogEntry {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  details: any;
  created_at: string;
  // Include any other fields that might be in your database
}
