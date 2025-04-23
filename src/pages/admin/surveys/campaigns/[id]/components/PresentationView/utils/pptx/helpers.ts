

import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

// Helper to create a clean text from HTML content
export const cleanText = (text: string) => {
  return text.replace(/<[^>]*>/g, '');
};

// Helper to format dates consistently
export const formatDate = (date: string) => {
  try {
    return format(new Date(date), "PPP");
  } catch (error) {
    console.error("Error formatting date:", error);
    return date;
  }
};

// Helper to get response data
export const getQuestionResponses = async (campaignId: string, instanceId?: string) => {
  const { data: responses, error } = await supabase
    .from("survey_responses")
    .select(`
      response_data,
      submitted_at,
      user:profiles!inner(
        gender,
        location:locations(id, name),
        employment_type:employment_types(id, name),
        level:levels(id, name),
        employee_type:employee_types(id, name),
        employee_role:employee_roles(id, name),
        user_sbus:user_sbus(
          is_primary,
          sbu:sbus(id, name)
        )
      )
    `)
    .eq("campaign_instance_id", instanceId);

  if (error) {
    console.error("Error fetching responses:", error);
    throw error;
  }

  return responses;
};
