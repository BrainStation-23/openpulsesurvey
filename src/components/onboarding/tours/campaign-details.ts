
import { TourConfig } from "../types";

export const campaignDetailsTour: TourConfig = {
  id: "campaign_details_guide",
  title: "Campaign Details Guide",
  description: "Learn how to navigate and manage your survey campaign",
  completionKey: "tour_completed_campaign_details",
  steps: [
    {
      target: "body",
      title: "Welcome to Campaign Details",
      content: "Let's explore how to manage and analyze your survey campaign, from tracking responses to generating insights.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".text-2xl.font-bold",
      title: "Campaign Information",
      content: "Here you can see and edit your campaign's basic information, including name, description, and status.",
      placement: "bottom",
    },
    {
      target: "button[aria-label='Present']",
      title: "Present Mode",
      content: "Launch a presentation view of your campaign results, perfect for meetings and sharing insights with stakeholders.",
      placement: "left",
    },
    {
      target: "button[aria-label='Edit']",
      title: "Edit Campaign",
      content: "Modify campaign details, including name, description, and status. Some fields may be locked after the campaign is active.",
      placement: "left",
    },
    {
      target: "[role='tablist']",
      title: "Campaign Management Tabs",
      content: "Navigate between different aspects of your campaign using these tabs.",
      placement: "bottom",
    },
    {
      target: "[role='tab'][data-state='active']",
      title: "Overview Tab",
      content: "Get a high-level view of your campaign's performance, including completion rates, response trends, and key metrics.",
      placement: "bottom",
    },
    {
      target: "button[role='tab']:nth-child(2)",
      title: "Assignments Tab",
      content: "Manage who takes your survey. Add or remove participants, track completion status, and send reminders.",
      placement: "bottom",
    },
    {
      target: "button[role='tab']:nth-child(3)",
      title: "Responses Tab",
      content: "View and analyze individual survey responses. Filter responses and export data for further analysis.",
      placement: "bottom",
    },
    {
      target: "button[role='tab']:nth-child(4)",
      title: "Reports Tab",
      content: "Access detailed analytics and visualizations of your survey data. Generate custom reports and export insights.",
      placement: "bottom",
    },
    {
      target: "button[role='tab']:nth-child(5)",
      title: "Compare Tab",
      content: "Compare results between different campaign instances to track changes and trends over time.",
      placement: "bottom",
    },
    {
      target: "button[role='tab']:nth-child(6)",
      title: "AI Analysis Tab",
      content: "Get AI-powered insights and analysis of your survey responses, highlighting key patterns and trends.",
      placement: "bottom",
    },
    {
      target: ".InstanceSelector",
      title: "Instance Selection",
      content: "Switch between different instances of your campaign to view data from specific time periods.",
      placement: "bottom",
    }
  ]
};
