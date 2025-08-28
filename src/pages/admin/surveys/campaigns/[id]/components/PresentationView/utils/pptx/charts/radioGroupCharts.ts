
import pptxgen from "pptxgenjs";

export const addRadioGroupChart = (
  slide: pptxgen.Slide,
  answers: any[],
  choices: Array<{ value: string; text: string }>
) => {
  const total = answers.filter(a => a != null).length;
  
  const data = choices.map(choice => ({
    name: choice.text || choice.value,
    value: answers.filter(a => a === choice.value).length,
    percentage: total > 0 ? (answers.filter(a => a === choice.value).length / total) * 100 : 0
  }));

  const chartData = data.map(item => ({
    name: item.name,
    labels: [`${item.name}`],
    values: [item.value]
  }));

  slide.addChart(pptxgen.ChartType.pie, chartData, {
    x: 1,
    y: 2,
    w: 8,
    h: 4,
    showTitle: false,
    showLegend: true,
    legendPos: 'r'
  });
};

export const addRadioGroupComparison = (
  slide: pptxgen.Slide,
  groupedData: Map<string, any[]>,
  dimension: string,
  choices: Array<{ value: string; text: string }>
) => {
  const chartData: any[] = [];
  
  choices.forEach(choice => {
    const dataPoint: any = {
      name: choice.text || choice.value,
      labels: [],
      values: []
    };
    
    groupedData.forEach((answers, groupKey) => {
      const count = answers.filter(a => a === choice.value).length;
      dataPoint.labels.push(groupKey);
      dataPoint.values.push(count);
    });
    
    chartData.push(dataPoint);
  });

  slide.addChart(pptxgen.ChartType.bar, chartData, {
    x: 1,
    y: 2,
    w: 8,
    h: 4,
    showTitle: false,
    showLegend: true,
    legendPos: 'r',
    barDir: 'col'
  });
};
