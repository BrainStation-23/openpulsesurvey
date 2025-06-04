
import pptxgen from "pptxgenjs";
import { CampaignData } from "../../../types";
import { createTheme, createSlideMasters, createDecorativeShape } from "../theme";
import { supabase } from "@/integrations/supabase/client";
import { ThemeConfig, DEFAULT_THEME } from "../config/exportConfig";

export const createCompletionSlide = async (
  pptx: pptxgen, 
  campaign: CampaignData, 
  themeConfig: ThemeConfig = DEFAULT_THEME
) => {
  const theme = createTheme(themeConfig);
  const slideMasters = createSlideMasters(theme);
  const slide = pptx.addSlide();
  Object.assign(slide, slideMasters.CHART);

  // Add decorative header accent
  createDecorativeShape(slide, theme, 'header-accent');

  // Enhanced title with better positioning
  slide.addText("Response Distribution", {
    x: 0.8,
    y: 0.7,
    w: 8.4,
    fontSize: 36,
    bold: true,
    color: theme.text.primary.replace('#', ''),
    fontFace: themeConfig.fontFamily,
    shadow: {
      type: 'outer',
      color: '000000',
      blur: 2,
      offset: 1,
      angle: 45,
      opacity: 0.1
    }
  });

  // Get actual status distribution data using the same RPC as overview tab
  let statusData = [];
  if (campaign.instance?.id) {
    try {
      const { data, error } = await supabase
        .rpc('get_campaign_instance_status_distribution', {
          p_campaign_id: campaign.id,
          p_instance_id: campaign.instance.id
        });

      if (!error && data) {
        const defaultStatuses = ['submitted', 'in_progress', 'expired', 'assigned'];
        const statusMap = new Map(data.map(item => [item.status, item.count]));
        
        statusData = defaultStatuses.map(status => ({
          name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
          value: statusMap.get(status) || 0
        }));
      }
    } catch (error) {
      console.error("Error fetching status distribution:", error);
    }
  }

  const data = [{
    name: "Response Status",
    labels: statusData.map(item => item.name),
    values: statusData.map(item => item.value)
  }];

  // Enhanced pie chart with better colors and styling
  slide.addChart(pptx.ChartType.pie, data, {
    x: 0.8,
    y: 1.8,
    w: 4.5,
    h: 4,
    chartColors: [
      theme.chart.colors[0].replace('#', ''), 
      theme.chart.colors[1].replace('#', ''), 
      theme.danger.replace('#', ''), 
      theme.chart.colors[3].replace('#', '')
    ],
    showLegend: true,
    legendPos: 'r',
    legendFontSize: 12,
    dataLabelFormatCode: '0',
    dataLabelFontSize: 11,
    showValue: true,
    border: { pt: 2, color: 'FFFFFF' }
  });

  // Enhanced statistics panel with background
  const total = statusData.reduce((sum, item) => sum + item.value, 0);
  
  // Add background for stats
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.8,
    y: 1.8,
    w: 3.5,
    h: 4,
    fill: { color: 'FFFFFF', transparency: 20 },
    line: { color: theme.primary.replace('#', ''), width: 2 }
  });

  const statsText = [
    { text: "Response Summary\n\n", options: { bold: true, fontSize: 16, fontFace: themeConfig.fontFamily, color: theme.text.primary.replace('#', '') } },
    { text: `Total Responses: `, options: { bold: true, fontSize: 14, fontFace: themeConfig.fontFamily, color: theme.text.primary.replace('#', '') } },
    { text: `${total}\n\n`, options: { bold: true, fontSize: 14, fontFace: themeConfig.fontFamily, color: theme.primary.replace('#', '') } }
  ];

  statusData.forEach(item => {
    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
    statsText.push(
      { text: `${item.name}: `, options: { bold: true, fontSize: 12, fontFace: themeConfig.fontFamily, color: theme.text.primary.replace('#', '') } },
      { text: `${item.value} (${percentage}%)\n`, options: { bold: false, fontSize: 12, fontFace: themeConfig.fontFamily, color: theme.text.secondary.replace('#', '') } }
    );
  });

  slide.addText(statsText, {
    x: 6,
    y: 2.2,
    w: 3.1,
    fontSize: 12,
  });

  // Add decorative footer line
  createDecorativeShape(slide, theme, 'footer-line');

  // Add subtle background decoration
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 8.5,
    y: 5.5,
    w: 2,
    h: 2,
    fill: { color: theme.light.replace('#', ''), transparency: 85 }
  });
};
