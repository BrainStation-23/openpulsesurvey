
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
        placement: "center",
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
  // Additional tour configurations will be added for other sections
];
