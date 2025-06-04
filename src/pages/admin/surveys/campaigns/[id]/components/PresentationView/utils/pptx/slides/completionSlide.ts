
import pptxgen from "pptxgenjs";
import { CampaignData } from "../../types";
import { THEME, slideMasters } from "../theme";
import { supabase } from "@/integrations/supabase/client";

export const createCompletionSlide = async (pptx: pptxgen, campaign: CampaignData) => {
  const slide = pptx.addSlide();
  Object.assign(slide, slideMasters.CHART);

  slide.addText("Response Distribution", {
    x: 0.5,
    y: 0.5,
    fontSize: 32,
    bold: true,
    color: THEME.text.primary,
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

  // Add pie chart
  slide.addChart(pptx.ChartType.pie, data, {
    x: 0.5,
    y: 1.5,
    w: 4.2,
    h: 3,
    chartColors: [THEME.primary, '#3B82F6', '#EF4444', '#F59E0B'],
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
    { text: "Response Summary\n\n", options: { bold: true, fontSize: 14 } },
    { text: `Total: `, options: { bold: true } },
    { text: `${total}\n\n` }
  ];

  statusData.forEach(item => {
    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
    statsText.push(
      { text: `${item.name}: `, options: { bold: true } },
      { text: `${item.value} (${percentage}%)\n` }
    );
  });

  slide.addText(statsText, {
    x: 5.2,
    y: 2,
    w: 4,
    fontSize: 12,
    color: THEME.text.primary,
  });
};
