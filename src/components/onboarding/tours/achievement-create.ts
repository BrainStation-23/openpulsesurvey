
import { TourConfig } from "../types";

export const achievementCreateTour: TourConfig = {
  id: "achievement_create",
  title: "Achievement Creation Guide",
  description: "Learn how to create new achievements for your organization",
  steps: [
    {
      target: "form h1",
      title: "Create Achievement",
      content: "Here you can create new achievements to reward and motivate your employees.",
    },
    {
      target: "input[name='name']",
      title: "Achievement Name",
      content: "Enter a clear and descriptive name for your achievement.",
    },
    {
      target: "textarea[name='description']",
      title: "Achievement Description",
      content: "Provide a detailed description explaining how employees can earn this achievement.",
    },
    {
      target: ".achievement-type-select",
      title: "Achievement Type",
      content: "Select the type of achievement. This determines what actions or metrics will be tracked.",
    },
    {
      target: ".icon-picker",
      title: "Icon Selection",
      content: "Choose an icon and color to represent your achievement visually.",
    },
    {
      target: "input[name='points']",
      title: "Achievement Points",
      content: "Set how many points users will earn for completing this achievement.",
    },
    {
      target: ".achievement-conditions",
      title: "Achievement Conditions",
      content: "Configure the specific conditions that need to be met to earn this achievement.",
    },
  ],
  completionKey: "achievement_create_completed"
};
