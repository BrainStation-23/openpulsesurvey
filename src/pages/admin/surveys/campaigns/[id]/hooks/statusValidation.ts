
import { Instance, InstanceStatus } from "./instanceTypes";

export const validateStatusChange = (
  instance: Instance,
  newStatus: InstanceStatus,
  hasActiveInstance: (currentInstanceId?: string) => boolean
): string | null => {
  // Cannot activate if another instance is already active
  if (newStatus === 'active' && hasActiveInstance(instance.id)) {
    return "There is already an active instance for this campaign. Please mark it as completed or inactive first.";
  }

  // Cannot go back to upcoming from a completed state
  if (instance.status === 'completed' && newStatus === 'upcoming') {
    return "Cannot change a completed instance back to upcoming status.";
  }

  // Cannot go from inactive to other states except active
  if (instance.status === 'inactive' && newStatus !== 'active' && newStatus !== 'inactive') {
    return "An inactive instance can only be changed to active status.";
  }

  // Check date constraints for certain status changes
  const now = new Date();
  const startsAt = new Date(instance.starts_at);
  const endsAt = new Date(instance.ends_at);

  // Cannot set as active an instance that hasn't started yet
  if (newStatus === 'active' && startsAt > now) {
    return "Cannot set an instance as active before its start date.";
  }

  // Cannot set as upcoming an instance that has already ended
  if (newStatus === 'upcoming' && endsAt < now) {
    return "Cannot set an instance as upcoming after its end date.";
  }

  return null; // No validation errors
};
