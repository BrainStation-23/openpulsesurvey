
import type { Instance, InstanceStatus } from "./instanceTypes";

export function validateStatusChange(
  instance: Instance, 
  newStatus: InstanceStatus,
  hasActiveInstance: (id?: string) => boolean
): string | null {
  if (newStatus === "active" && hasActiveInstance(instance.id)) {
    return "There is already an active instance for this campaign. Please mark it as completed or inactive first.";
  }
  if (instance.status === "completed" && newStatus !== "completed") {
    return "Completed instances cannot be changed to other statuses";
  }
  const now = new Date();
  const startDate = new Date(instance.starts_at);
  const endDate = new Date(instance.ends_at);

  if (newStatus === "active" && endDate < now) {
    return "Cannot set an instance to active if its end date has passed";
  }
  if (newStatus === "upcoming" && startDate < now) {
    return "Cannot set an instance to upcoming if its start date has passed";
  }
  return null;
}
