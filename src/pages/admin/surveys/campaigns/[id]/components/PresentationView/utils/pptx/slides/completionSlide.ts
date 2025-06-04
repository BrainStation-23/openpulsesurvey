import pptxgen from "pptxgenjs";
import { CampaignData } from "../../../types";
import { createTheme, createSlideMasters } from "../theme";
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

  slide.addText("Response Distribution", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: theme.text.primary,
    fontFace: themeConfig.fontFamily
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
        // Ensure all status types have a value
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

  // Add pie chart with theme colors
  slide.addChart(pptx.ChartType.pie, data, {
    x: 0.5,
    y: 1.5,
    w: 4.2,
    h: 3,
    chartColors: [theme.primary, theme.chart.colors[1], theme.danger, theme.chart.colors[3]],
    showLegend: true,
    legendPos: 'r',
    legendFontSize: 11,
    dataLabelFormatCode: '0',
    dataLabelFontSize: 10,
    showValue: true,
  });

  // Add response statistics as text
  const total = statusData.reduce((sum, item) => sum + item.value, 0);
  
  const statsText = [
    { text: "Response Summary\n\n", options: { bold: true, fontSize: 14, fontFace: themeConfig.fontFamily } },
    { text: `Total: `, options: { bold: true, fontFace: themeConfig.fontFamily } },
    { text: `${total}\n\n`, options: { fontFace: themeConfig.fontFamily } }
  ];

  statusData.forEach(item => {
    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
    statsText.push(
      { text: `${item.name}: `, options: { bold: true, fontFace: themeConfig.fontFamily } },
      { text: `${item.value} (${percentage}%)\n`, options: { fontFace: themeConfig.fontFamily } }
    );
  });

  slide.addText(statsText, {
    x: 5.2,
    y: 2,
    w: 4,
    fontSize: 12,
    color: theme.text.primary,
  });
};
