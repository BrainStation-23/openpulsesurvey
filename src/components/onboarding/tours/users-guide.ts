
import { TourConfig } from "../types";

export const usersGuideTour: TourConfig = {
  id: "users_management_guide",
  title: "User Management Guide",
  description: "Learn how to effectively manage users in your organization",
  completionKey: "tour_completed_users_management",
  steps: [
    {
      target: "body",
      title: "Welcome to User Management",
      content: "Let's explore how to manage users in your organization, from adding individual users to bulk operations.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".flex.gap-2 > button:first-child",
      title: "Adding Individual Users",
      content: "Click here to add a single user. You'll be able to set their email, name, and whether they have admin access. Users will receive an email with their credentials.",
      placement: "bottom",
    },
    {
      target: ".flex.gap-2",
      title: "Bulk Operations",
      content: "These buttons allow you to perform operations on multiple users at once: bulk create, bulk update, and export all users.",
      placement: "bottom",
    },
    {
      target: ".flex.gap-2 > button:nth-child(2)",
      title: "Bulk Create Users",
      content: "Upload a CSV file to create multiple users at once. Download the template to see the required format. New users will receive their credentials via email.",
      placement: "bottom",
    },
    {
      target: ".flex.gap-2 > button:nth-child(3)",
      title: "Bulk Update Users",
      content: "Update multiple users' information at once via CSV upload. Download current users first to ensure you have the correct format and IDs.",
      placement: "bottom",
    },
    {
      target: ".flex.gap-2 > button:nth-child(4)",
      title: "Export All Users",
      content: "Download a CSV file containing all user information. This file can be modified and used with the bulk update feature.",
      placement: "bottom",
    },
    {
      target: "[role='search']",
      title: "Search and Filters",
      content: "Quickly find users by searching their name, email, or ID. Use filters to narrow down results by various criteria.",
      placement: "bottom",
    },
    {
      target: ".space-y-4 > div:first-child",
      title: "Primary Filters",
      content: "Filter users by their SBU (Strategic Business Unit), Level, and Location to find specific groups of users.",
      placement: "bottom",
    },
    {
      target: ".space-y-4 > div:last-child",
      title: "Employee Filters",
      content: "Further refine your search using Employment Type, Employee Role, and Employee Type filters.",
      placement: "bottom",
    },
    {
      target: "[role='grid']",
      title: "User Information Grid",
      content: "Each card displays key user information and provides quick access to user management actions.",
      placement: "bottom",
    },
    {
      target: "[role='switch']",
      title: "Active Status Toggle",
      content: "Quickly activate or deactivate users. Inactive users cannot log in to the system.",
      placement: "right",
    },
    {
      target: "[role='button'][aria-haspopup='menu']",
      title: "User Actions",
      content: "Access more actions like editing user details, resetting password, or deleting the user.",
      placement: "left",
    },
    {
      target: "[type='checkbox']",
      title: "Bulk Selection",
      content: "Select multiple users to perform bulk actions like status changes or deletion.",
      placement: "right",
    }
  ]
};
