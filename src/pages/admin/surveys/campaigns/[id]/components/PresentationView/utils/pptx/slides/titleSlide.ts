
import pptxgen from "pptxgenjs";
import { CampaignData } from "../../types";
import { THEME, slideMasters } from "../theme";
import { formatDate } from "../helpers";

export const createTitleSlide = (pptx: pptxgen, campaign: CampaignData) => {
  const slide = pptx.addSlide();
  Object.assign(slide, slideMasters.TITLE);

  // Main title
  slide.addText(campaign.name, {
    x: 1,
    y: 2.5,
    w: 8,
    fontSize: 44,
    bold: true,
    color: THEME.text.primary,
    align: "center"
  });

  // Instance information if available
  if (campaign.instance) {
    slide.addText(`Period ${campaign.instance.period_number}`, {
      x: 1,
      y: 3.5,
      w: 8,
      fontSize: 28,
      color: THEME.primary,
      align: "center"
    });
  }

  // Description if available
  if (campaign.description) {
    slide.addText(campaign.description, {
      x: 1,
      y: 4.2,
      w: 8,
      fontSize: 20,
      color: THEME.text.secondary,
      align: "center",
      wrap: true
    });
  }

  // Date range
  const startDate = campaign.instance?.starts_at || campaign.starts_at;
  const endDate = campaign.instance?.ends_at || campaign.ends_at;

  slide.addText(`${formatDate(startDate)} - ${formatDate(endDate)}`, {
    x: 1,
    y: 5.2,
    w: 8,
    fontSize: 18,
    color: THEME.text.light,
    align: "center"
  });

  // Add a decorative element
  slide.addShape(pptx.ShapeType.rect, {
    x: 3,
    y: 5.8,
    w: 4,
    h: 0.1,
    fill: { color: THEME.primary }
  });
};
