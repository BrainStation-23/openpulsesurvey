
import { format, parse, isValid } from "date-fns";

/**
 * Safely format a date with fallback value
 * @param date The date to format
 * @param formatStr The date-fns format string
 * @param fallback Fallback value if date is invalid
 * @returns Formatted date string or fallback
 */
export function safeFormat(date: Date | undefined | null, formatStr: string, fallback: string = ""): string {
  if (!date) return fallback;
  
  try {
    if (!isValid(date)) return fallback;
    return format(date, formatStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return fallback;
  }
}

/**
 * Safely parse a date string
 * @param dateStr The date string to parse
 * @param formatStr The format of the date string
 * @param fallback Fallback date if parsing fails
 * @returns Parsed date or fallback
 */
export function safeParse(
  dateStr: string, 
  formatStr: string, 
  fallback: Date = new Date()
): Date {
  try {
    const parsedDate = parse(dateStr, formatStr, new Date());
    return isValid(parsedDate) ? parsedDate : fallback;
  } catch (error) {
    console.error("Error parsing date:", error);
    return fallback;
  }
}

/**
 * Safely combine date and time
 * @param date Date part
 * @param timeStr Time string (HH:mm format)
 * @returns Combined date and time
 */
export function combineDateTime(date: Date, timeStr: string): Date {
  try {
    const newDate = new Date(date);
    const [hoursStr, minutesStr] = timeStr.split(":");
    const hours = parseInt(hoursStr, 10) || 0;
    const minutes = parseInt(minutesStr, 10) || 0;
    
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  } catch (error) {
    console.error("Error combining date and time:", error);
    return date;
  }
}

/**
 * Create a safe date object with validation
 * @param year Year
 * @param month Month (0-11)
 * @param day Day of month
 * @param hours Hours (0-23)
 * @param minutes Minutes (0-59)
 * @returns Valid date or current date for fallback
 */
export function createSafeDate(
  year: number,
  month: number, 
  day: number, 
  hours: number = 0, 
  minutes: number = 0
): Date {
  try {
    const date = new Date(year, month, day, hours, minutes);
    return isValid(date) ? date : new Date();
  } catch (error) {
    console.error("Error creating date:", error);
    return new Date();
  }
}

/**
 * Helper to create default start date (today at noon)
 */
export function createDefaultStartDate(): Date {
  try {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    return date;
  } catch (error) {
    console.error("Error creating default start date:", error);
    return new Date();
  }
}

/**
 * Helper to create default end date (one week from today at noon)
 */
export function createDefaultEndDate(): Date {
  try {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    date.setHours(12, 0, 0, 0);
    return date;
  } catch (error) {
    console.error("Error creating default end date:", error);
    return new Date();
  }
}
