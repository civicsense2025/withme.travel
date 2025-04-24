import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
/**
 * Combines class names with Tailwind CSS classes
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
/**
 * Format a date range as a string
 * @param startDate The start date
 * @param endDate The end date
 * @returns Formatted date range string
 */
export function formatDateRange(startDate, endDate) {
    if (!startDate && !endDate)
        return "Dates not set";
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start && end) {
        if (start.getFullYear() === end.getFullYear()) {
            if (start.getMonth() === end.getMonth()) {
                if (start.getDate() === end.getDate()) {
                    return start.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                }
                else {
                    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`;
                }
            }
            else {
                return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
            }
        }
        else {
            return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
    }
    else if (start) {
        return `From ${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    else if (end) {
        return `Until ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return "Dates not set";
}
/**
 * Format a date to a string
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date) {
    if (!date)
        return "Date not set";
    return new Date(date).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
/**
 * Truncate a string to a specified length
 * @param str The string to truncate
 * @param length The maximum length
 * @returns Truncated string
 */
export function truncate(str, length) {
    if (!str)
        return "";
    return str.length > length ? `${str.substring(0, length)}...` : str;
}
