
import { TourConfig } from "./types";

export const tours: TourConfig[] = [
  {
    id: "platform_setup",
    title: "Platform Setup",
    description: "Initial platform configuration walkthrough",
    completionKey: "tour_completed_platform_setup",
    steps: [
      {
        target: "body",
        title: "Welcome to the Platform Setup",
        content: "Let's walk through the initial configuration of your platform. We'll set up essential components step by step.",
        placement: "bottom",
        disableBeacon: true,
      },
      {
        target: ".config-location",
        title: "Location Setup",
        content: "Start by adding your organization's locations. This will help organize your employees and surveys.",
        placement: "bottom",
      },
      {
        target: ".config-level",
        title: "Employee Levels",
        content: "Define the different levels or grades in your organization hierarchy.",
        placement: "bottom",
      },
      {
        target: ".config-employment-type",
        title: "Employment Types",
        content: "Set up different types of employment contracts your organization uses.",
        placement: "bottom",
      },
      {
        target: ".config-employee-type",
        title: "Employee Types",
        content: "Configure various employee classifications used in your organization.",
        placement: "bottom",
      },
      {
        target: ".config-employee-role",
        title: "Employee Roles",
        content: "Define the different roles employees can have in your organization.",
        placement: "bottom",
      },
      {
        target: ".config-sbu",
        title: "Strategic Business Units",
        content: "Finally, set up your organization's Strategic Business Units (SBUs). You can add unit heads later after creating users.",
        placement: "bottom",
      }
    ],
  },
  {
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
  }
];
