
import { Question, ProcessedData } from "../../../types/responses";
import { ThemeColors } from "../theme";
import { ComparisonDimension } from "../../../types/comparison";
import { calculateChartStatistics } from "./helpers/statisticsCalculator";
import { addBooleanChart, addBooleanComparison } from "./booleanCharts";

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

    if (question.type === "boolean") {
      const booleanData = questionData.choices || {};
      const answers = processedData.responses.map(r => 
        r.answers[question.name]?.answer === "true" || r.answers[question.name]?.answer === true
      );
      await addBooleanChart(slide, answers);
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
      slide.addChart("column", data, {
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

    if (question.type === "boolean") {
      // Group answers by dimension
      const groupedData = new Map<string, boolean[]>();
      processedData.responses.forEach(response => {
        const group = response.respondent[dimension]?.name || 'Unknown';
        const answer = response.answers[question.name]?.answer === "true" || 
                      response.answers[question.name]?.answer === true;
        
        if (!groupedData.has(group)) {
          groupedData.set(group, []);
        }
        groupedData.get(group)?.push(answer);
      });

      await addBooleanComparison(slide, groupedData, dimension);
      return;
    }

    const data = Object.entries(comparisonData).map(([group, values]) => {
      const groupData = values as any;
      return {
        name: group,
        labels: ['Average'],
        values: [groupData.avgRating || 0]
      };
    });

    slide.addChart("column", data, {
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
