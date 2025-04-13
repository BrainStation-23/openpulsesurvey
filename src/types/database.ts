
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  // Add any database-wide type definitions if needed
  // This can be expanded as your project grows
  json: Json;
}
