
import { TourConfig } from "../types";

export const mySurveysTour: TourConfig = {
  id: "my_surveys_guide",
  title: "My Surveys Guide",
  description: "Learn how to manage and respond to your assigned surveys",
  completionKey: "tour_completed_my_surveys",
  steps: [
    {
      target: "body",
      title: "Welcome to My Surveys",
      content: "Let's explore how to manage and complete your assigned surveys efficiently.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".search-filters",
      title: "Search and Filter",
      content: "Quickly find specific surveys using the search bar or filter them by status.",
      placement: "bottom",
    },
    {
      target: ".status-filter",
      title: "Status Filters",
      content: "Filter surveys by their current status: Assigned, In Progress, Submitted, or Expired.",
      placement: "bottom",
    },
    {
      target: ".campaign-group",
      title: "Survey Campaigns",
      content: "Surveys are grouped by campaigns. Click to expand a group and see all surveys within it.",
      placement: "bottom",
    },
    {
      target: ".completion-progress",
      title: "Completion Progress",
      content: "Track your progress for each campaign. The progress bar shows how many surveys you've completed.",
      placement: "bottom",
    },
    {
      target: ".survey-card",
      title: "Survey Details",
      content: "Each card shows important information about the survey, including its status and due date.",
      placement: "bottom",
    },
    {
      target: ".due-date",
      title: "Due Dates",
      content: "Pay attention to due dates highlighted in red (overdue) or yellow (due soon).",
      placement: "bottom",
    }
  ]
};
