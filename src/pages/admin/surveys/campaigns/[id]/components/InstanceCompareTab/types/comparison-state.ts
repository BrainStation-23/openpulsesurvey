
import { SBUPerformanceData } from "./instance-comparison";

export type ComparisonSelectionStatus = 'initial' | 'selecting' | 'ready' | 'invalid';

export interface ComparisonState {
  baseInstanceId?: string;
  comparisonInstanceId?: string;
  status: ComparisonSelectionStatus;
  errorMessage?: string;
}
