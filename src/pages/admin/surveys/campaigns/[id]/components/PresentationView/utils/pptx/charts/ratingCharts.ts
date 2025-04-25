
import pptxgen from "pptxgenjs";

export const addRatingChart = (
  slide: pptxgen.Slide,
  answers: number[],
  isNps: boolean
) => {
  // Skip if no data
  if (!answers || answers.length === 0) return;
  
  if (isNps) {
    addNpsChart(slide, answers);
  } else {
    addSatisfactionChart(slide, answers);
  }
};

const addNpsChart = (
  slide: pptxgen.Slide,
  answers: number[]
) => {
  const detractors = answers.filter(r => r <= 6).length;
  const passives = answers.filter(r => r > 6 && r <= 8).length;
  const promoters = answers.filter(r => r > 8).length;
  const total = answers.length;
  
  // Calculate NPS score
  const npsScore = Math.round(((promoters - detractors) / total) * 100);
  
  // Add NPS score as a large number
  slide.addText(`${npsScore}`, {
    x: 4,
    y: 1.5,
    w: 2,
    h: 2,
    align: 'center',
    fontSize: 72,
    bold: true,
    color: npsScore >= 50 ? '#22c55e' : npsScore >= 0 ? '#f59e0b' : '#ef4444'
  });
  
  slide.addText('NPS Score', {
    x: 4,
    y: 3.5,
    w: 2,
    h: 0.5,
    align: 'center',
    fontSize: 16,
    color: '363636'
  });
  
  // Add a doughnut chart for distribution
  slide.addChart(pptxgen.ChartType.doughnut, [
    { name: "Detractors (0-6)", labels: ["Detractors"], values: [detractors] },
    { name: "Passives (7-8)", labels: ["Passives"], values: [passives] },
    { name: "Promoters (9-10)", labels: ["Promoters"], values: [promoters] }
  ], {
    x: 1.5,
    y: 4,
    w: 7,
    h: 3.5,
    dataLabelColor: "FFFFFF",
    showValue: true,
    chartColors: ["#ef4444", "#f59e0b", "#22c55e"],
    legendPos: 'b'
  });
};

const addSatisfactionChart = (
  slide: pptxgen.Slide,
  answers: number[]
) => {
  // Group responses by rating level (1-5)
  const countByRating = answers.reduce((acc: Record<number, number>, rating) => {
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});
  
  // Prepare data for chart
  const chartData = [];
  for (let i = 1; i <= 5; i++) {
    chartData.push({
      name: `Rating ${i}`,
      labels: [`${i}`],
      values: [countByRating[i] || 0]
    });
  }
  
  // Calculate average rating
  const sum = answers.reduce((acc, val) => acc + val, 0);
  const avg = (sum / answers.length).toFixed(1);
  
  // Add average score
  slide.addText(`${avg}`, {
    x: 8,
    y: 2,
    w: 1.5,
    h: 1.5,
    align: 'center',
    fontSize: 48,
    bold: true,
    color: '#0ea5e9'
  });
  
  slide.addText('Average Rating', {
    x: 7.5,
    y: 3.5,
    w: 2.5,
    h: 0.5,
    align: 'center',
    fontSize: 16,
    color: '363636'
  });
  
  // Add column chart
  slide.addChart(pptxgen.ChartType.column, chartData, {
    x: 0.5,
    y: 1.5,
    w: 6.5,
    h: 5,
    showValue: true,
    valueAxisMaxVal: Math.max(...Object.values(countByRating)) * 1.2,
    chartColors: ['#ef4444', '#f59e0b', '#facc15', '#a3e635', '#22c55e'],
    dataLabelColor: '363636',
    showLegend: false
  });
};

export const addRatingComparison = (
  slide: pptxgen.Slide,
  groupedData: Map<string, number[]>,
  dimension: string,
  isNps: boolean
) => {
  if (isNps) {
    addNpsComparison(slide, groupedData, dimension);
  } else {
    addSatisfactionComparison(slide, groupedData, dimension);
  }
};

const addNpsComparison = (
  slide: pptxgen.Slide,
  groupedData: Map<string, number[]>,
  dimension: string
) => {
  // Process data for NPS comparison
  const chartData: { name: string, npsScore: number, detractors: number, passives: number, promoters: number }[] = [];
  
  groupedData.forEach((ratings, groupKey) => {
    if (ratings.length === 0) return;
    
    const detractors = ratings.filter(r => r <= 6).length;
    const passives = ratings.filter(r => r > 6 && r <= 8).length;
    const promoters = ratings.filter(r => r > 8).length;
    const total = ratings.length;
    
    const npsScore = Math.round(((promoters - detractors) / total) * 100);
    
    chartData.push({
      name: groupKey,
      npsScore,
      detractors,
      passives,
      promoters
    });
  });
  
  if (chartData.length === 0) return;
  
  // Sort by NPS score descending
  chartData.sort((a, b) => b.npsScore - a.npsScore);
  
  // Limit to top 8 for readability
  const chartDataLimited = chartData.slice(0, 8);
  
  // Add chart title
  slide.addText(`NPS Scores by ${dimension.charAt(0).toUpperCase() + dimension.slice(1)}`, {
    x: 0.5,
    y: 1,
    w: 8,
    fontSize: 16,
    bold: true
  });
  
  // Add bar chart for NPS scores
  slide.addChart(pptxgen.ChartType.bar, [{
    name: "NPS Score",
    labels: chartDataLimited.map(d => d.name),
    values: chartDataLimited.map(d => d.npsScore)
  }], {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 4.5,
    chartColors: ['#0ea5e9'],
    categoryAxisLineShow: true,
    valueAxisLineShow: true,
    showValue: true,
    catAxisLabelColor: '404040',
    valAxisLabelColor: '404040',
    catAxisLabelFontSize: 10,
    valAxisLabelFontSize: 10
  });
};

const addSatisfactionComparison = (
  slide: pptxgen.Slide,
  groupedData: Map<string, number[]>,
  dimension: string
) => {
  // Process data for average rating comparison
  const chartData: { name: string, avgRating: number }[] = [];
  
  groupedData.forEach((ratings, groupKey) => {
    if (ratings.length === 0) return;
    
    const sum = ratings.reduce((acc, val) => acc + val, 0);
    const avg = sum / ratings.length;
    
    chartData.push({
      name: groupKey,
      avgRating: avg
    });
  });
  
  if (chartData.length === 0) return;
  
  // Sort by average rating descending
  chartData.sort((a, b) => b.avgRating - a.avgRating);
  
  // Limit to top 8 for readability
  const chartDataLimited = chartData.slice(0, 8);
  
  // Add chart title
  slide.addText(`Average Ratings by ${dimension.charAt(0).toUpperCase() + dimension.slice(1)}`, {
    x: 0.5,
    y: 1,
    w: 8,
    fontSize: 16,
    bold: true
  });
  
  // Add bar chart for average ratings
  slide.addChart(pptxgen.ChartType.bar, [{
    name: "Average Rating",
    labels: chartDataLimited.map(d => d.name),
    values: chartDataLimited.map(d => d.avgRating)
  }], {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 4.5,
    chartColors: ['#22c55e'],
    valueAxisMaxVal: 5,
    categoryAxisLineShow: true,
    valueAxisLineShow: true,
    showValue: true,
    valAxisLabelFontSize: 10,
    catAxisLabelFontSize: 10
  });
};
