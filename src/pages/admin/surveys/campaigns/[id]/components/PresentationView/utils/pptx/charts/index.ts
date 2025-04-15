
import { Question, ProcessedData } from "../../types/responses";
import { ThemeColors } from "./theme";
import { ComparisonDimension } from "../../types/comparison";
import { calculateChartStatistics } from "./helpers/statisticsCalculator";

// Export functions for charts
export const addQuestionChart = async (
  slide: any, 
  question: Question, 
  processedData: ProcessedData,
  theme: ThemeColors
) => {
  try {
    // Get question data
    const questionData = processedData.questionData[question.name];
    
    if (!questionData) {
      console.warn(`No data found for question ${question.name}`);
      return;
    }

    if (question.type === "rating") {
      // Process rating data
      const ratings = questionData.ratings || {};
      const stats = calculateChartStatistics(Object.values(ratings));
      
      const data = [{
        name: 'Ratings',
        labels: Object.keys(ratings),
        values: Object.values(ratings)
      }];

      // Add chart
      slide.addChart(slide.ChartType.column, data, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4.5,
        chartColors: theme.chart.colors,
        showLegend: false,
        showValue: true,
        dataLabelFontSize: 10,
      });

      // Add average
      slide.addText(`Average Rating: ${stats.average.toFixed(2)}`, {
        x: 0.5,
        y: 6,
        fontSize: 14,
        color: theme.text.primary,
      });
    }
    // Handle other question types similarly...
  } catch (error) {
    console.error("Error adding chart:", error);
    slide.addText("Error generating chart", {
      x: 0.5,
      y: 2,
      fontSize: 14,
      color: theme.danger,
    });
  }
};

export const addComparisonChart = async (
  slide: any, 
  question: Question, 
  processedData: ProcessedData,
  dimension: ComparisonDimension,
  theme: ThemeColors
) => {
  try {
    const comparisonData = processedData.comparisons?.[question.name]?.[dimension];
    
    if (!comparisonData) {
      console.warn(`No comparison data for ${question.name} - ${dimension}`);
      return;
    }

    const data = Object.entries(comparisonData).map(([group, values]) => ({
      name: group,
      labels: ['Average'],
      values: [values.avgRating || 0]
    }));

    slide.addChart(slide.ChartType.column, data, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 4.5,
      chartColors: theme.chart.colors,
      showLegend: true,
      showValue: true,
      dataLabelFontSize: 10,
    });
  } catch (error) {
    console.error("Error adding comparison chart:", error);
    slide.addText("Error generating comparison chart", {
      x: 0.5,
      y: 2,
      fontSize: 14,
      color: theme.danger,
    });
  }
};
