
import pptxgen from "pptxgenjs";

export const addBooleanChart = (
  slide: pptxgen.Slide,
  answers: any[]
) => {
  const yesCount = answers.filter(a => a === true).length;
  const noCount = answers.filter(a => a === false).length;
  const total = answers.length;
  
  // Skip if no data
  if (total === 0) return;
  
  // Calculate percentages
  const yesPercentage = Math.round((yesCount / total) * 100);
  const noPercentage = Math.round((noCount / total) * 100);
  
  // Add a doughnut chart
  slide.addChart(pptxgen.ChartType.doughnut, [
    { name: "Yes", labels: ["Yes"], values: [yesCount] },
    { name: "No", labels: ["No"], values: [noCount] }
  ], {
    x: 1.5,
    y: 1.5,
    w: 6,
    h: 4,
    dataLabelColor: "FFFFFF",
    showValue: true,
    chartColors: ["#22c55e", "#ef4444"],
    legendPos: 'b'
  });
  
  // Add text summary
  slide.addText(`Total Responses: ${total}`, {
    x: 8,
    y: 2.5,
    fontSize: 14,
    color: '363636'
  });
  
  slide.addText(`Yes: ${yesCount} (${yesPercentage}%)`, {
    x: 8,
    y: 3,
    fontSize: 14,
    color: '#22c55e'
  });
  
  slide.addText(`No: ${noCount} (${noPercentage}%)`, {
    x: 8,
    y: 3.5,
    fontSize: 14,
    color: '#ef4444'
  });
};

export const addBooleanComparison = (
  slide: pptxgen.Slide,
  groupedData: Map<string, any[]>,
  dimension: string
) => {
  // Process data for chart
  const chartData: { name: string, Yes: number, No: number }[] = [];
  
  groupedData.forEach((answers, groupKey) => {
    const yesCount = answers.filter(a => a === true).length;
    const noCount = answers.filter(a => a === false).length;
    
    chartData.push({
      name: groupKey,
      Yes: yesCount,
      No: noCount
    });
  });
  
  if (chartData.length === 0) return;
  
  // Sort data by "Yes" count descending
  chartData.sort((a, b) => b.Yes - a.Yes);
  
  // Limit to top 8 for readability
  const chartDataLimited = chartData.slice(0, 8);
  
  // Format data for chart
  const yes = {
    name: "Yes",
    labels: chartDataLimited.map(d => d.name),
    values: chartDataLimited.map(d => d.Yes)
  };
  
  const no = {
    name: "No",
    labels: chartDataLimited.map(d => d.name),
    values: chartDataLimited.map(d => d.No)
  };
  
  // Add chart title
  slide.addText(`Response Distribution by ${dimension.charAt(0).toUpperCase() + dimension.slice(1)}`, {
    x: 0.5,
    y: 1,
    w: 8,
    fontSize: 16,
    bold: true
  });
  
  // Add stacked bar chart
  slide.addChart(pptxgen.ChartType.bar, [yes, no], {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 4.5,
    barDir: 'bar',
    barGrouping: 'stacked',
    chartColors: ['#22c55e', '#ef4444'],
    valueAxisMinVal: 0,
    showLegend: true,
    legendPos: 'b',
    showValue: false,
    categoryAxisLineShow: true,
    valueAxisLineShow: true,
    catAxisLabelColor: '404040',
    valAxisLabelColor: '404040',
    catAxisLabelFontSize: 10,
    valAxisLabelFontSize: 10
  });
};
