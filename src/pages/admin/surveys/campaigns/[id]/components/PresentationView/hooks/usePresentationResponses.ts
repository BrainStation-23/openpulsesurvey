import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  ProcessedData, 
  ProcessedResponse, 
  Question, 
  SatisfactionData, 
  NpsData, 
  ComparisonGroup,
  SatisfactionComparisonGroup,
  NpsComparisonGroup
} from "../types/responses";

export function usePresentationResponses(campaignId: string, instanceId?: string) {
  const { data: rawData, ...rest } = useQuery({
    queryKey: ["presentation-responses", campaignId, instanceId],
    queryFn: async () => {
      const { data: campaign } = await supabase
        .from("survey_campaigns")
        .select(`
          survey:surveys (
            id,
            name,
            json_data
          )
        `)
        .eq("id", campaignId)
        .single();

      if (!campaign?.survey) {
        throw new Error("Survey not found");
      }

      // Safely parse survey data
      let surveyData;
      try {
        surveyData = typeof campaign.survey.json_data === 'string' 
          ? JSON.parse(campaign.survey.json_data)
          : campaign.survey.json_data;
      } catch (error) {
        console.error("Error parsing survey data:", error);
        surveyData = { pages: [] };
      }

      // Build the query for responses with extended user metadata
      let query = supabase
        .from("survey_responses")
        .select(`
          id,
          response_data,
          submitted_at,
          user:profiles!survey_responses_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            gender,
            location:locations!profiles_location_id_fkey (
              id,
              name
            ),
            employment_type:employment_types!profiles_employment_type_id_fkey (
              id,
              name
            ),
            level:levels!profiles_level_id_fkey (
              id,
              name
            ),
            employee_type:employee_types!profiles_employee_type_id_fkey (
              id,
              name
            ),
            employee_role:employee_roles!profiles_employee_role_id_fkey (
              id,
              name
            ),
            user_sbus:user_sbus (
              is_primary,
              sbu:sbus (
                id,
                name
              )
            )
          )
        `);

      // If instanceId is provided, filter by it
      if (instanceId) {
        query = query.eq("campaign_instance_id", instanceId);
      }

      const { data: responses } = await query;

      // Fetch supervisor information separately to avoid ambiguous relationships
      const { data: supervisorData } = await supabase
        .from("user_supervisors")
        .select(`
          user_id,
          is_primary,
          supervisor:profiles!user_supervisors_supervisor_id_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .in('user_id', responses?.map(r => r.user.id) || []);

      return { responses, surveyData, supervisorData };
    },
  });

  const processedData = useMemo(() => {
    if (!rawData) return null;
    
    const { responses, surveyData, supervisorData } = rawData;
    
    // Safely access survey questions with fallback
    const surveyQuestions = (surveyData?.pages || []).flatMap(
      (page: any) => page.elements || []
    ).map((q: any) => ({
      id: q.name,
      name: q.name || '',
      title: q.title || '',
      type: q.type || 'text',
      rateCount: q.rateMax === 10 ? 10 : q.rateMax || 5
    })) || [];

    if (!responses) {
      return {
        summary: {
          totalResponses: 0,
          completionRate: 0,
          averageRating: 0
        },
        questions: surveyQuestions,
        questionData: {},
        comparisons: {},
        responses: [],
      } as ProcessedData;
    }

    // Create a lookup map for supervisor data
    const supervisorMap = new Map();
    if (supervisorData) {
      supervisorData.forEach(item => {
        if (item.is_primary && item.supervisor) {
          supervisorMap.set(item.user_id, item.supervisor);
        }
      });
    }

    // Process each response
    const processedResponses: ProcessedResponse[] = responses.map((response) => {
      const answers: Record<string, any> = {};

      // Map each question to its answer with null checks
      surveyQuestions.forEach((question: Question) => {
        const answer = response?.response_data?.[question.name];
        answers[question.name] = {
          question: question.title,
          answer: answer,
          questionType: question.type,
          rateCount: question.rateCount
        };
      });

      // Find primary SBU with null checks
      const primarySbu = response.user?.user_sbus?.find(
        (us: any) => us.is_primary && us.sbu
      );
      
      // Get supervisor from the map
      const supervisor = supervisorMap.get(response.user.id);
      
      return {
        id: response.id,
        respondent: {
          id: response.user?.id,
          name: `${response.user?.first_name || ""} ${
            response.user?.last_name || ""
          }`.trim(),
          email: response.user?.email,
          gender: response.user?.gender,
          location: response.user?.location,
          sbu: primarySbu?.sbu || null,
          employment_type: response.user?.employment_type,
          level: response.user?.level,
          employee_type: response.user?.employee_type,
          employee_role: response.user?.employee_role,
          supervisor: supervisor || null
        },
        submitted_at: response.submitted_at,
        answers,
      };
    });

    // Compute summary data
    const totalResponses = processedResponses.length;
    let totalRatingSum = 0;
    let ratingCount = 0;

    // Initialize question data structure
    const questionData: Record<string, any> = {};

    // Process responses into question data
    surveyQuestions.forEach(question => {
      if (question.type === 'rating') {
        // Process rating questions
        const ratings: Record<string, number> = {};
        let ratingSum = 0;
        let count = 0;
        
        processedResponses.forEach(response => {
          const answer = response?.answers[question.name]?.answer;
          if (typeof answer === 'number' || (typeof answer === 'string' && !isNaN(Number(answer)))) {
            const rating = typeof answer === 'number' ? answer : Number(answer);
            ratings[rating] = (ratings[rating] || 0) + 1;
            ratingSum += rating;
            count++;
          }
        });
        
        questionData[question.name] = {
          ratings,
          avgRating: count > 0 ? ratingSum / count : 0
        };
        
        // Add to overall rating stats
        totalRatingSum += ratingSum;
        ratingCount += count;
      } 
      else if (question.type === 'boolean' || question.type === 'radiogroup' || question.type === 'checkbox') {
        // Process choice-based questions
        const choices: Record<string, number> = {};
        
        processedResponses.forEach(response => {
          const answer = response.answers[question.name]?.answer;
          if (answer) {
            // Handle array answers (checkbox)
            if (Array.isArray(answer)) {
              answer.forEach(choice => {
                choices[choice] = (choices[choice] || 0) + 1;
              });
            } else {
              choices[answer] = (choices[answer] || 0) + 1;
            }
          }
        });
        
        questionData[question.name] = { choices };
      }
      else if (question.type === 'matrix') {
        // Process matrix questions
        const matrix: Record<string, Record<string, number>> = {};
        
        processedResponses.forEach(response => {
          const answer = response.answers[question.name]?.answer;
          if (answer && typeof answer === 'object' && !Array.isArray(answer)) {
            Object.entries(answer).forEach(([row, colValue]) => {
              if (!matrix[row]) matrix[row] = {};
              matrix[row][colValue as string] = (matrix[row][colValue as string] || 0) + 1;
            });
          }
        });
        
        questionData[question.name] = { matrix };
      }
    });

    // Build comparison data structure for all dimensions
    const comparisons: Record<string, Record<string, any>> = {};
    
    // Define comparison dimensions and their accessors
    const dimensionAccessors = {
      sbu: (r: ProcessedResponse) => r.respondent.sbu?.name,
      gender: (r: ProcessedResponse) => r.respondent.gender,
      location: (r: ProcessedResponse) => r.respondent.location?.name,
      employment_type: (r: ProcessedResponse) => r.respondent.employment_type?.name,
      level: (r: ProcessedResponse) => r.respondent.level?.name,
      employee_type: (r: ProcessedResponse) => r.respondent.employee_type?.name,
      employee_role: (r: ProcessedResponse) => r.respondent.employee_role?.name,
      supervisor: (r: ProcessedResponse) => r.respondent.supervisor ? 
        `${r.respondent.supervisor.first_name || ''} ${r.respondent.supervisor.last_name || ''}`.trim() : null
    };
    
    // Process each question for all comparison dimensions
    surveyQuestions.forEach(question => {
      comparisons[question.name] = {};
      
      // For each dimension, group responses and calculate metrics
      Object.entries(dimensionAccessors).forEach(([dimension, accessor]) => {
        // Group responses by dimension value
        const groupedResponses: Record<string, ProcessedResponse[]> = {};
        
        processedResponses.forEach(response => {
          const dimensionValue = accessor(response);
          if (dimensionValue) {
            if (!groupedResponses[dimensionValue]) {
              groupedResponses[dimensionValue] = [];
            }
            groupedResponses[dimensionValue].push(response);
          }
        });
        
        if (question.type === 'rating') {
          // For rating questions, calculate satisfaction or NPS metrics
          if (question.rateCount === 10) {
            // For NPS (0-10 scale)
            const groupsData: NpsComparisonGroup[] = Object.entries(groupedResponses).map(([group, groupResponses]) => {
              // Extract rating values from this group
              const ratings = groupResponses
                .map(r => r.answers[question.name]?.answer)
                .filter(r => typeof r === 'number' || (typeof r === 'string' && !isNaN(Number(r))))
                .map(r => typeof r === 'number' ? r : Number(r));
                
              const total = ratings.length;
              
              const detractors = ratings.filter(r => r <= 6).length;
              const passives = ratings.filter(r => r > 6 && r <= 8).length;
              const promoters = ratings.filter(r => r > 8).length;
              
              return {
                dimension: group,
                detractors,
                passives,
                promoters,
                total,
                npsScore: total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0
              };
            });
            
            comparisons[question.name][dimension] = groupsData;
          } 
          else {
            // For satisfaction (1-5 scale)
            const groupsData: SatisfactionComparisonGroup[] = Object.entries(groupedResponses).map(([group, groupResponses]) => {
              // Extract rating values from this group
              const ratings = groupResponses
                .map(r => r.answers[question.name]?.answer)
                .filter(r => typeof r === 'number' || (typeof r === 'string' && !isNaN(Number(r))))
                .map(r => typeof r === 'number' ? r : Number(r));
                
              const total = ratings.length;
              
              const unsatisfied = ratings.filter(r => r <= 2).length;
              const neutral = ratings.filter(r => r === 3).length;
              const satisfied = ratings.filter(r => r >= 4).length;
              
              return {
                dimension: group,
                unsatisfied,
                neutral,
                satisfied,
                total,
                median: total > 0 ? 
                  ratings.sort((a, b) => a - b)[Math.floor(total / 2)] : 0
              };
            });
            
            comparisons[question.name][dimension] = groupsData;
          }
        } 
        else if (question.type === 'boolean' || question.type === 'radiogroup' || question.type === 'checkbox') {
          // For choice questions, calculate choice distributions by group
          const groupsData: Record<string, { choices: Record<string, number>, total: number }> = {};
          
          Object.entries(groupedResponses).forEach(([group, groupResponses]) => {
            const choices: Record<string, number> = {};
            let total = 0;
            
            groupResponses.forEach(response => {
              const answer = response.answers[question.name]?.answer;
              if (answer) {
                if (Array.isArray(answer)) {
                  answer.forEach(choice => {
                    choices[choice] = (choices[choice] || 0) + 1;
                    total++;
                  });
                } else {
                  choices[answer] = (choices[answer] || 0) + 1;
                  total++;
                }
              }
            });
            
            groupsData[group] = { choices, total };
          });
          
          comparisons[question.name][dimension] = groupsData;
        }
      });
    });

    return {
      summary: {
        totalResponses,
        completionRate: responses.length > 0 ? (responses.length / (responses.length * 1.5)) * 100 : 0, // Placeholder calculation
        averageRating: ratingCount > 0 ? totalRatingSum / ratingCount : 0
      },
      questions: surveyQuestions,
      questionData,
      comparisons,
      responses: processedResponses,
    } as ProcessedData;
  }, [rawData]);

  return { data: processedData, ...rest };
}
