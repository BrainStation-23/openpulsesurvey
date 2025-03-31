
import { KeyResult } from "@/types/okr";

/**
 * Returns the appropriate color class based on due date proximity
 * @param dueDate The due date to check
 * @returns Tailwind color class for the background
 */
export const getDueDateColorClass = (dueDate: Date | string | undefined): string => {
  // If no due date or undefined, return a neutral color
  if (!dueDate) return "bg-gray-100 text-gray-700";
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDateObj = new Date(dueDate);
  dueDateObj.setHours(0, 0, 0, 0);
  
  const diffTime = dueDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Return color based on proximity
  if (diffDays < 0) return "bg-red-100 text-red-700"; // Overdue
  if (diffDays === 0) return "bg-red-100 text-red-700"; // Due today
  if (diffDays <= 3) return "bg-amber-100 text-amber-700"; // Due soon (3 days)
  if (diffDays <= 7) return "bg-amber-50 text-amber-700"; // Due within a week
  if (diffDays <= 14) return "bg-lime-100 text-lime-700"; // Due within 2 weeks
  return "bg-green-100 text-green-700"; // More than 2 weeks away
};

/**
 * Returns a formatted date string
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDueDate = (date: Date | string | undefined): string => {
  if (!date) return "No due date";
  
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Checks if a date is in the past
 * @param date The date to check
 * @returns True if the date is in the past
 */
export const isPastDue = (date: Date | string | undefined): boolean => {
  if (!date) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  
  return dateObj < today;
};
