
import { useEffect, useState } from "react";
import { ComparisonDimension } from "../../types/comparison";
import { ProcessedResponse } from "../../hooks/useResponseProcessing";
import { ComparisonView } from "../../../PresentationView/slides/QuestionSlide/ComparisonView";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

interface NpsComparisonProps {
  responses: ProcessedResponse[];
  questionName: string;
  dimension: ComparisonDimension;
  isNps: boolean;
}

export function NpsComparison({ responses, questionName, dimension, isNps }: NpsComparisonProps) {
  const { id: campaignId } = useParams<{ id: string }>();
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [dimensionTitle, setDimensionTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComparisonData() {
      if (!campaignId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        let data;
        
        if (dimension === "supervisor") {
          // Call our new RPC function for supervisor satisfaction
          const { data: supervisorData, error: supervisorError } = await supabase
            .rpc('get_supervisor_satisfaction', {
              p_campaign_id: campaignId,
              p_instance_id: null, // If you want to filter by instance, replace with instance ID
              p_question_name: questionName
            });
            
          if (supervisorError) throw supervisorError;
          data = supervisorData;
          setDimensionTitle("Supervisor Satisfaction");
        } else {
          // Call existing RPC functions for other dimensions
          let rpcFunction = "";
          
          switch (dimension) {
            case "gender":
              rpcFunction = "get_gender_comparison_data";
              setDimensionTitle("Gender Comparison");
              break;
            case "sbu":
              rpcFunction = "get_sbu_comparison_data";
              setDimensionTitle("Department Comparison");
              break;
            case "location":
              rpcFunction = "get_location_comparison_data";
              setDimensionTitle("Location Comparison");
              break;
            case "employment_type":
              rpcFunction = "get_employment_type_comparison_data";
              setDimensionTitle("Employment Type Comparison");
              break;
            case "level":
              rpcFunction = "get_level_comparison_data";
              setDimensionTitle("Level Comparison");
              break;
            case "employee_type":
              rpcFunction = "get_employee_type_comparison_data";
              setDimensionTitle("Employee Type Comparison");
              break;
            case "employee_role":
              rpcFunction = "get_employee_role_comparison_data";
              setDimensionTitle("Employee Role Comparison");
              break;
            default:
              setDimensionTitle("");
              break;
          }
          
          if (rpcFunction) {
            const { data: dimensionData, error: dimensionError } = await supabase
              .rpc(rpcFunction as any, {
                p_campaign_id: campaignId,
                p_instance_id: null, // If you want to filter by instance, replace with instance ID
                p_question_name: questionName
              });
              
            if (dimensionError) throw dimensionError;
            
            // Transform data for NPS or regular satisfaction
            if (isNps) {
              data = Array.isArray(dimensionData) ? dimensionData.map((item: any) => ({
                dimension: item.dimension,
                detractors: item.detractors,
                passives: item.passives,
                promoters: item.promoters
              })) : [];
            } else {
              data = dimensionData;
            }
          }
        }
        
        setComparisonData(data || []);
      } catch (err) {
        console.error("Error fetching comparison data:", err);
        setError("Failed to load comparison data");
      } finally {
        setLoading(false);
      }
    }
    
    fetchComparisonData();
  }, [campaignId, dimension, questionName, isNps]);

  if (loading) {
    return <div className="text-center p-4">Loading comparison data...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return <ComparisonView data={comparisonData} isNps={isNps} dimensionTitle={dimensionTitle} />;
}
