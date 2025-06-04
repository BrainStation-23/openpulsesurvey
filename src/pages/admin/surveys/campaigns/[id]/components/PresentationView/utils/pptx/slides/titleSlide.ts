
import pptxgen from "pptxgenjs";
import { CampaignData } from "../../../types";
import { createTheme, createSlideMasters, createDecorativeShape } from "../theme";
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

  // Add decorative header accent
  createDecorativeShape(slide, theme, 'header-accent');

  // Add corner decorative element
  createDecorativeShape(slide, theme, 'corner-element');

  // Main title with enhanced styling
  slide.addText(campaign.name, {
    x: 1,
    y: 2.2,
    w: 8,
    fontSize: 48,
    bold: true,
    color: theme.text.primary.replace('#', ''),
    align: "center",
    fontFace: themeConfig.fontFamily,
    shadow: {
      type: 'outer',
      color: '000000',
      blur: 3,
      offset: 2,
      angle: 45,
      opacity: 0.1
    }
  });

  // Instance information with accent styling
  if (campaign.instance) {
    slide.addText(`Period ${campaign.instance.period_number}`, {
      x: 1,
      y: 3.3,
      w: 8,
      fontSize: 32,
      color: theme.primary.replace('#', ''),
      align: "center",
      fontFace: themeConfig.fontFamily,
      bold: true
    });
  }

  // Description with better spacing
  if (campaign.description) {
    slide.addText(campaign.description, {
      x: 1.5,
      y: 4.1,
      w: 7,
      fontSize: 22,
      color: theme.text.secondary.replace('#', ''),
      align: "center",
      wrap: true,
      fontFace: themeConfig.fontFamily,
      italic: true
    });
  }

  // Date range with enhanced styling
  const startDate = campaign.instance?.starts_at || campaign.starts_at;
  const endDate = campaign.instance?.ends_at || campaign.ends_at;

  slide.addText(`${formatDate(startDate)} - ${formatDate(endDate)}`, {
    x: 1,
    y: 5.0,
    w: 8,
    fontSize: 20,
    color: theme.text.light.replace('#', ''),
    align: "center",
    fontFace: themeConfig.fontFamily
  });

  // Enhanced decorative footer line using solid color
  slide.addShape(pptx.ShapeType.rect, {
    x: 2.5,
    y: 5.7,
    w: 5,
    h: 0.15,
    fill: { color: theme.primary.replace('#', '') }
  });

  // Add subtle background elements
  slide.addShape(pptx.ShapeType.ellipse, {
    x: -2,
    y: 6,
    w: 4,
    h: 4,
    fill: { color: theme.light.replace('#', ''), transparency: 90 }
  });

  slide.addShape(pptx.ShapeType.ellipse, {
    x: 8,
    y: -1,
    w: 3,
    h: 3,
    fill: { color: theme.tertiary.replace('#', ''), transparency: 85 }
  });
};
