
import { TourConfig } from "../types";

export const dashboardOverviewTour: TourConfig = {
  id: "dashboard_overview",
  title: "Dashboard Overview",
  description: "Learn about your dashboard's key features and metrics",
  completionKey: "tour_completed_dashboard",
  steps: [
    {
      target: "body",
      title: "Welcome to Your Dashboard",
      content: "Let's explore your dashboard and understand the key metrics and insights available to you.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".metrics-overview",
      title: "Metrics Overview",
      content: "This section shows your key performance indicators including total surveys, active campaigns, and completion rates.",
      placement: "bottom",
    },
    {
      target: ".response-trends",
      title: "Response Trends",
      content: "Track how survey responses evolve over time. Monitor both total responses and unique respondents.",
      placement: "bottom",
    },
    {
      target: ".department-completion",
      title: "Department Completion Rates",
      content: "View and compare how different departments are performing in terms of survey completion rates.",
      placement: "bottom",
    },
    {
      target: ".top-surveys",
      title: "Top Performing Surveys",
      content: "See which surveys are getting the best response rates and engagement.",
      placement: "bottom",
    },
    {
      target: ".top-managers",
      title: "Top Performing Managers",
      content: "Identify managers with the highest engagement and response rates from their teams.",
      placement: "bottom",
    },
    {
      target: ".top-sbus",
      title: "Strategic Business Units Performance",
      content: "Compare how different SBUs are performing in terms of survey participation and completion.",
      placement: "bottom",
    },
    {
      target: ".managers-improvement",
      title: "Areas for Improvement",
      content: "Identify managers and teams that might need additional support or attention.",
      placement: "bottom",
    },
    {
      target: ".upcoming-deadlines",
      title: "Upcoming Deadlines",
      content: "Keep track of approaching survey deadlines and send reminders when needed.",
      placement: "bottom",
    },
    {
      target: ".demographic-breakdown",
      title: "Demographic Analysis",
      content: "Analyze response patterns across different demographic segments of your organization.",
      placement: "bottom",
    }
  ],
};
