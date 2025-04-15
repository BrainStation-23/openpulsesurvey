
import { Question, ProcessedData } from "../../types/responses";
import { ThemeColors } from "./theme";
import { ComparisonDimension } from "../../types/exportConfig";

// Function to add a chart for a specific question
export const addQuestionChart = async (
  slide: any, 
  question: Question, 
  processedData: ProcessedData,
  theme: ThemeColors
) => {
  try {
    if (question.type === "rating") {
      await addRatingChart(slide, question, processedData, theme);
    } else if (question.type === "checkbox" || question.type === "radiogroup") {
      await addChoiceChart(slide, question, processedData, theme);
    } else if (question.type === "matrix") {
      await addMatrixChart(slide, question, processedData, theme);
    } else {
      // Add a text note for unsupported question types
      slide.addText(`Chart visualization not supported for question type: ${question.type}`, {
        x: 0.5,
        y: 2.5,
        fontSize: 14,
        color: theme.text.secondary,
        italic: true,
      });
    }
  } catch (error) {
    console.error(`Error adding chart for question ${question.name}:`, error);
    slide.addText(`Error generating chart: ${error.message}`, {
      x: 0.5,
      y: 2.5,
      fontSize: 14,
      color: theme.danger,
      italic: true,
    });
  }
};

// Add a rating chart (for rating questions)
const addRatingChart = async (
  slide: any, 
  question: Question, 
  processedData: ProcessedData,
  theme: ThemeColors
) => {
  // Get the rating distribution for this question
  const ratings = processedData.questionData[question.name]?.ratings || {};
  const avgRating = processedData.questionData[question.name]?.avgRating || 0;
  
  // Create data for the chart
  const data = [];
  
  if (ratings && Object.keys(ratings).length > 0) {
    const labels = Object.keys(ratings).map(Number).sort((a, b) => a - b);
    data.push({
      name: 'Ratings',
      labels: labels.map(l => l.toString()),
      values: labels.map(l => ratings[l])
    });
    
    // Add a column chart
    slide.addChart(slide.ChartType.column, data, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 4.5,
      chartColors: theme.chart.colors,
      showLegend: false,
      showValue: true,
      dataLabelFontSize: 10,
      barGrouping: 'standard',
    });
    
    // Add average rating text
    slide.addText(`Average Rating: ${avgRating.toFixed(2)}`, {
      x: 0.5,
      y: 6.2,
      fontSize: 16,
      bold: true,
      color: theme.text.primary,
    });
  } else {
    slide.addText("No rating data available for this question.", {
      x: 0.5,
      y: 3,
      fontSize: 14,
      color: theme.text.secondary,
      italic: true,
    });
  }
};

// Add a choice chart (for checkbox or radiogroup questions)
const addChoiceChart = async (
  slide: any, 
  question: Question, 
  processedData: ProcessedData,
  theme: ThemeColors
) => {
  // Get the choice distribution for this question
  const choices = processedData.questionData[question.name]?.choices || {};
  
  // Create data for the chart
  if (choices && Object.keys(choices).length > 0) {
    const labels = Object.keys(choices);
    const values = labels.map(l => choices[l]);
    
    const data = [{
      name: 'Responses',
      labels,
      values
    }];
    
    // Choose chart type based on number of options
    const chartType = labels.length > 5 ? slide.ChartType.bar : slide.ChartType.column;
    
    // Add the chart
    slide.addChart(chartType, data, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 4.5,
      chartColors: theme.chart.colors,
      showLegend: false,
      showValue: true,
      dataLabelFontSize: 10,
      barGrouping: 'standard',
      // For bar charts, we need to adjust axes
      ...(chartType === slide.ChartType.bar ? {
        invertedAxes: true,
        barDir: 'bar',
        barGapWidthPct: 50,
      } : {})
    });
  } else {
    slide.addText("No choice data available for this question.", {
      x: 0.5,
      y: 3,
      fontSize: 14,
      color: theme.text.secondary,
      italic: true,
    });
  }
};

// Add a matrix chart (for matrix questions)
const addMatrixChart = async (
  slide: any, 
  question: Question, 
  processedData: ProcessedData,
  theme: ThemeColors
) => {
  // Get the matrix data for this question
  const matrixData = processedData.questionData[question.name]?.matrix || {};
  
  if (matrixData && Object.keys(matrixData).length > 0) {
    // Create a multi-series chart
    const data = [];
    
    // Each row in the matrix is a series
    Object.keys(matrixData).forEach(row => {
      const rowData = matrixData[row];
      if (rowData) {
        const columnLabels = Object.keys(rowData);
        data.push({
          name: row,
          labels: columnLabels,
          values: columnLabels.map(col => rowData[col])
        });
      }
    });
    
    if (data.length > 0) {
      // Add a bar chart
      slide.addChart(slide.ChartType.bar, data, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4.5,
        chartColors: theme.chart.colors,
        showLegend: true,
        legendPos: 'b',
        showValue: false,
        invertedAxes: true,
        barDir: 'bar',
        barGapWidthPct: 50,
      });
    }
  } else {
    slide.addText("No matrix data available for this question.", {
      x: 0.5,
      y: 3,
      fontSize: 14,
      color: theme.text.secondary,
      italic: true,
    });
  }
};

// Function to add a comparison chart
export const addComparisonChart = async (
  slide: any, 
  question: Question, 
  processedData: ProcessedData, 
  dimension: ComparisonDimension,
  theme: ThemeColors
) => {
  try {
    // Get comparison data for this dimension
    const comparisonData = processedData.comparisons?.[question.name]?.[dimension];
    
    if (comparisonData && Object.keys(comparisonData).length > 0) {
      const data = [];
      
      // For rating questions
      if (question.type === "rating") {
        // Each segment/dimension value is a series
        Object.keys(comparisonData).forEach(segment => {
          const segmentData = comparisonData[segment];
          if (segmentData && segmentData.avgRating !== undefined) {
            data.push({
              name: segment || 'Unknown',
              labels: ['Average Rating'],
              values: [segmentData.avgRating]
            });
          }
        });
        
        // Add a column chart for average ratings by dimension
        slide.addChart(slide.ChartType.column, data, {
          x: 0.5,
          y: 1.8,
          w: 9,
          h: 4.2,
          chartColors: theme.chart.colors,
          showLegend: false,
          showValue: true,
          valueFormatCode: '0.00',
          dataLabelFontSize: 10,
          barGrouping: 'standard',
        });
      } 
      // For choice questions (checkbox, radiogroup)
      else if (question.type === "checkbox" || question.type === "radiogroup") {
        // Get all possible choices
        const allChoices = new Set<string>();
        Object.values(comparisonData).forEach(segment => {
          if (segment && typeof segment === 'object' && 'choices' in segment) {
            const segChoices = segment.choices as Record<string, number>;
            Object.keys(segChoices).forEach(choice => allChoices.add(choice));
          }
        });
        
        // Create a series for each choice
        Array.from(allChoices).forEach(choice => {
          const choiceData = {
            name: choice,
            labels: [],
            values: []
          };
          
          // For each segment, get the percentage for this choice
          Object.keys(comparisonData).forEach(segment => {
            const segmentData = comparisonData[segment];
            choiceData.labels.push(segment || 'Unknown');
            if (typeof segmentData === 'object' && 'choices' in segmentData) {
              const choices = segmentData.choices as Record<string, number>;
              choiceData.values.push(choices[choice] || 0);
            } else {
              choiceData.values.push(0);
            }
          });
          
          data.push(choiceData);
        });
        
        // Add a bar chart for choices by dimension
        slide.addChart(slide.ChartType.bar, data, {
          x: 0.5,
          y: 1.8,
          w: 9,
          h: 4.2,
          chartColors: theme.chart.colors,
          showLegend: true,
          legendPos: 'b',
          showValue: false,
          invertedAxes: true,
          barDir: 'bar',
          barGapWidthPct: 50,
        });
      }
      // For matrix questions
      else if (question.type === "matrix") {
        // This would be complex to visualize in a PPTX chart
        // For now, we'll just show a note
        slide.addText("Matrix comparison charts are not yet supported.", {
          x: 0.5,
          y: 2.5,
          fontSize: 14,
          color: theme.text.secondary,
          italic: true,
        });
      }
    } else {
      slide.addText(`No comparison data available for dimension: ${dimension}`, {
        x: 0.5,
        y: 2.5,
        fontSize: 14,
        color: theme.text.secondary,
        italic: true,
      });
    }
  } catch (error) {
    console.error(`Error adding comparison chart for question ${question.name} and dimension ${dimension}:`, error);
    slide.addText(`Error generating comparison chart: ${error.message}`, {
      x: 0.5,
      y: 2.5,
      fontSize: 14,
      color: theme.danger,
      italic: true,
    });
  }
};
