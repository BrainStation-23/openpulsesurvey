
import { TourConfig } from "../types";

export const levelConfigTour: TourConfig = {
  id: "level_config",
  title: "Level Configuration Guide",
  description: "Learn how to manage employee levels in your organization",
  steps: [
    {
      target: ".config-level h2",
      title: "Level Configuration",
      content: "This is where you manage employee levels in your organization. Levels help define the hierarchy and career progression paths.",
    },
    {
      target: "button:has(.Plus)",
      title: "Add New Level",
      content: "Click here to add a new level to your organization structure. You can specify the level name and assign a color code for visual identification.",
    },
    {
      target: ".config-level table",
      title: "Levels List",
      content: "View and manage all your organization's levels here. You can sort them, edit their details, or change their status.",
    },
    {
      target: "button:has(.Power)",
      title: "Toggle Status",
      content: "Quickly activate or deactivate levels using this button. Inactive levels won't be available for assignment to employees.",
    },
    {
      target: "button:has(.Pencil)",
      title: "Edit Level",
      content: "Modify a level's details such as its name or color code using this button.",
    },
    {
      target: "button:has(.GripVertical)",
      title: "Reorder Levels",
      content: "Drag and drop using these handles to reorder your levels. The order here determines the hierarchy in your organization.",
    }
  ],
  completionKey: "level_config_completed"
};
