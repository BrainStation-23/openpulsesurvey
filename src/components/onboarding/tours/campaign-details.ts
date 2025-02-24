
import { TourConfig } from "../types";

export const campaignDetailsTour: TourConfig = {
  id: "campaign_details_guide",
  title: "Campaign Details Guide",
  description: "Learn how to navigate and manage your survey campaign",
  completionKey: "tour_completed_campaign_details",
  steps: [
    {
      target: "button[role='tab']",
      title: "Overview Tab",
      content: "The Overview tab provides key metrics about your campaign, including completion rates, response trends, and SBU performance. Use this for a quick snapshot of campaign performance.",
      placement: "bottom",
    },
    {
      target: "[data-test='instance-selector']",
      title: "Instance Selector",
      content: "Select different campaign instances to view data from specific time periods. Each instance represents a distinct survey period, allowing you to track changes over time.",
      placement: "bottom",
    },
    {
      target: "button[aria-label='Edit']",
      title: "Edit Campaign",
      content: "Use this button to modify campaign details such as name, description, and status. Note: Some editing options may be restricted once a campaign is active or completed.",
      placement: "left",
    },
    {
      target: "button[aria-label='Present']",
      title: "Present Mode",
      content: "Enter presentation mode to view campaign results in a full-screen format, perfect for meetings and stakeholder presentations. You'll need to select an instance first.",
      placement: "left",
    },
    {
      target: "button[role='tab'][value='assignments']",
      title: "Assignments Tab",
      content: "Manage survey participants here. You can assign new users, track who has responded, send reminders to those who haven't completed the survey, and monitor completion status.",
      placement: "bottom",
    },
    {
      target: "button[role='tab'][value='responses']",
      title: "Responses Tab",
      content: "View individual survey responses, filter through submissions, and export response data. This tab gives you detailed insights into each participant's answers.",
      placement: "bottom",
    },
    {
      target: "button[role='tab'][value='reports']",
      title: "Reports Tab",
      content: "Access comprehensive analytics and visualizations of your survey data. Generate detailed reports with charts and graphs to better understand response patterns and trends.",
      placement: "bottom",
    },
    {
      target: "button[role='tab'][value='compare']",
      title: "Compare Tab",
      content: "Compare results between different campaign instances to identify trends and changes over time. This helps track progress and measure improvements across survey periods.",
      placement: "bottom",
    },
    {
      target: "button[role='tab'][value='analyze']",
      title: "AI Analysis Tab",
      content: "Get AI-powered insights from your survey responses. This feature analyzes patterns, identifies key themes, and provides automated interpretation of survey results.",
      placement: "bottom",
    }
  ]
};
