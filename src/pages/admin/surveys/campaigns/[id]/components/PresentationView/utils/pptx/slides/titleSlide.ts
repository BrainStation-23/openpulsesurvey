
import pptxgen from "pptxgenjs";
import { CampaignData } from "../../../types";
import { createTheme, createSlideMasters } from "../theme";
import { formatDate } from "../helpers";
import { ThemeConfig, DEFAULT_THEME } from "../config/exportConfig";

export const createTitleSlide = (
  pptx: pptxgen, 
  campaign: CampaignData, 
  themeConfig: ThemeConfig = DEFAULT_THEME
) => {
  const theme = createTheme(themeConfig);
  const slideMasters = createSlideMasters(theme);
  const slide = pptx.addSlide();
  Object.assign(slide, slideMasters.TITLE);

  // Main title
  slide.addText(campaign.name, {
    x: 1,
    y: 2.5,
    w: 8,
    fontSize: 44,
    bold: true,
    color: theme.text.primary,
    align: "center",
    fontFace: themeConfig.fontFamily
  });

  // Instance information if available
  if (campaign.instance) {
    slide.addText(`Period ${campaign.instance.period_number}`, {
      x: 1,
      y: 3.5,
      w: 8,
      fontSize: 28,
      color: theme.primary,
      align: "center",
      fontFace: themeConfig.fontFamily
    });
  }

  // Description if available
  if (campaign.description) {
    slide.addText(campaign.description, {
      x: 1,
      y: 4.2,
      w: 8,
      fontSize: 20,
      color: theme.text.secondary,
      align: "center",
      wrap: true,
      fontFace: themeConfig.fontFamily
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
    color: theme.text.light,
    align: "center",
    fontFace: themeConfig.fontFamily
  });

  // Add a decorative element
  slide.addShape(pptx.ShapeType.rect, {
    x: 3,
    y: 5.8,
    w: 4,
    h: 0.1,
    fill: { color: theme.primary }
  });
};
