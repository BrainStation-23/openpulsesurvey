
import { Database } from "@/integrations/supabase/types";

export type InstanceMetrics = Database["public"]["Tables"]["instance_comparison_metrics"]["Row"];
export type QuestionComparison = Database["public"]["Tables"]["instance_question_comparison"]["Row"];

export interface ComparisonData {
  baseInstance: InstanceMetrics;
  comparisonInstance: InstanceMetrics;
}

export interface QuestionComparisonData {
  baseInstance: QuestionComparison[];
  comparisonInstance: QuestionComparison[];
}
