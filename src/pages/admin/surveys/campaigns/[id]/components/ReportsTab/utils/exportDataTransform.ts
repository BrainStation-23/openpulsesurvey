
import { DimensionComparisonData, BooleanComparisonData, NpsComparisonData } from "../types/comparison";

// Transform satisfaction comparison data for export
export const transformSatisfactionData = (data: DimensionComparisonData[]) => {
  return data.map(item => ({
    Dimension: item.dimension,
    'Unsatisfied Count': item.unsatisfied,
    'Neutral Count': item.neutral,
    'Satisfied Count': item.satisfied,
    'Total Responses': item.total,
    'Average Score': item.avg_score
  }));
};

// Transform boolean comparison data for export
export const transformBooleanData = (data: BooleanComparisonData[]) => {
  return data.map(item => ({
    Dimension: item.dimension,
    'Yes Count': item.yes_count,
    'No Count': item.no_count,
    'Total Count': item.total_count,
    'Yes Percentage': `${((item.yes_count / item.total_count) * 100).toFixed(1)}%`,
    'No Percentage': `${((item.no_count / item.total_count) * 100).toFixed(1)}%`
  }));
};

// Transform NPS comparison data for export
export const transformNpsData = (data: NpsComparisonData[]) => {
  return data.map(item => ({
    Dimension: item.dimension,
    'Detractors Count': item.detractors,
    'Passives Count': item.passives,
    'Promoters Count': item.promoters,
    'Total Responses': item.total,
    'NPS Score': item.nps_score,
    'Average Score': item.avg_score || 'N/A'
  }));
};
