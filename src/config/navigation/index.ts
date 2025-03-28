
import { NavigationItem } from "./types";
import { userCenterItems } from "./user-center";
import { surveysItems } from "./surveys";
import { issueBoardsItems } from "./issue-boards";
import { okrsItems } from "./okrs";
import { platformConfigItems } from "./platform-config";
import { navigationSections } from "./sections";

// Export all navigation items
export const navigationItems: NavigationItem[] = [
  userCenterItems,
  surveysItems,
  issueBoardsItems,
  okrsItems,
  platformConfigItems,
];

// Export navigation sections
export { navigationSections };

// Export types
export * from "./types";
