import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { THEME } from "@/utils/constants";
/**
 * Combine multiple class names with clsx and twMerge
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
/**
 * Format a date range consistently
 * @param startDate Start date (string or Date)
 * @param endDate End date (string or Date)
 * @param format Format to use for each date
 * @returns Formatted date range string
 */
export function formatDateRange(startDate, endDate, format = "DISPLAY_DATE") {
    if (!startDate && !endDate)
        return "Dates not set";
    if (startDate && !endDate) {
        return `From ${formatDate(startDate, format)}`;
    }
    if (!startDate && endDate) {
        return `Until ${formatDate(endDate, format)}`;
    }
    // Both dates present
    return `${formatDate(startDate, format)} - ${formatDate(endDate, format)}`;
}
/**
 * Format a date using consistent time formats from constants
 * @param date - Date string or Date object to format
 * @param format - Optional format type from TIME_FORMATS
 * @returns Formatted date string
 */
export function formatDate(date, format = "DISPLAY_DATE") {
    if (!date)
        return "Unscheduled";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    switch (format) {
        case "DISPLAY_DATE":
            return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        case "DISPLAY_TIME":
            return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        case "FULL_DATE":
            return dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        case "SHORT_DATE":
            return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        default:
            return dateObj.toLocaleDateString();
    }
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
// List of common stop words
const stopWords = new Set([
    'a', 'an', 'and', 'the', 'in', 'on', 'at', 'for', 'to', 'of',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
    'am', 'is', 'are', 'was', 'were', 'be', 'being', 'been',
    'have', 'has', 'had', 'having',
    'do', 'does', 'did', 'doing',
    'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
    'about', 'above', 'after', 'again', 'against', 'all', 'any', 'around', 'as',
    'because', 'before', 'below', 'between', 'both', 'but', 'by',
    'down', 'during',
    'each', 'few', 'from', 'further',
    'here', 'how',
    'into', 'if',
    'just',
    'more', 'most',
    'no', 'nor', 'not',
    'only', 'or', 'other', 'out', 'over',
    'same', 'so', 'some', 'still', 'such',
    'than', 'that', 'then', 'there', 'these', 'this', 'those', 'through',
    'under', 'until', 'up',
    'very',
    'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
    'with', 'within', 'without',
    // Add more as needed
]);
/**
 * Generates a URL-friendly slug from a string.
 * Converts to lowercase, removes stop words, replaces spaces and invalid chars with hyphens,
 * and removes leading/trailing/duplicate hyphens.
 */
export function generateSlug(text) {
    if (!text)
        return "";
    // 1. Convert to lowercase
    let slug = text.toLowerCase();
    // 2. Remove stop words (split, filter, join)
    slug = slug.split(' ')
        .filter(word => !stopWords.has(word))
        .join(' ');
    // 3. Replace spaces and non-alphanumeric characters (except hyphens) with a hyphen
    slug = slug.replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, ''); // Remove invalid characters
    // 4. Remove duplicate hyphens
    slug = slug.replace(/-{2,}/g, '-');
    // 5. Remove leading and trailing hyphens
    slug = slug.replace(/^-+|-+$/g, '');
    return slug;
}
/**
 * Format a time string (HH:MM) to a readable format
 * @param timeStr Time string in HH:MM format or undefined
 * @returns Formatted time string in 12-hour format with AM/PM
 */
export function formatTime(timeStr) {
    if (!timeStr)
        return "";
    try {
        const [hours, minutes] = timeStr.split(":");
        return new Date(0, 0, 0, Number.parseInt(hours), Number.parseInt(minutes)).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    }
    catch (e) {
        return timeStr;
    }
}
/**
 * Generate a consistent color class based on an ID
 * @param id The ID to use for generating the color
 * @returns CSS class for the color
 */
export function getColorClassFromId(id) {
    const colorClasses = [
        `bg-${THEME.COLORS.BLUE} text-blue-900`,
        `bg-${THEME.COLORS.PINK} text-pink-900`,
        `bg-${THEME.COLORS.YELLOW} text-amber-900`,
        `bg-${THEME.COLORS.PURPLE} text-purple-900`,
        `bg-${THEME.COLORS.MINT} text-emerald-900`,
        `bg-${THEME.COLORS.PEACH} text-orange-900`,
    ];
    if (!id)
        return colorClasses[0];
    const colorIndex = Math.abs(id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % colorClasses.length;
    return colorClasses[colorIndex];
}
/**
 * Generate a consistent card style class
 * @returns CSS class for card styling
 */
export function getCardClass() {
    return "bg-background dark:bg-slate-900/60";
}
/**
 * Format a number as a currency amount
 * @param amount Number to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
    if (amount === undefined || amount === null)
        return '$0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(numAmount);
}
/**
 * Limit array items to a certain number and return info about hidden items
 * @param items Array of items to limit
 * @param limit Maximum number of items to show
 * @returns Object with limited items and count of hidden items
 */
export function limitItems(items, limit = 10) {
    if (!items || !Array.isArray(items)) {
        return { items: [], hiddenCount: 0, hasMore: false };
    }
    const hiddenCount = Math.max(0, items.length - limit);
    const hasMore = hiddenCount > 0;
    return {
        items: items.slice(0, limit),
        hiddenCount,
        hasMore
    };
}
/**
 * Format error messages consistently
 * @param error Error object or string
 * @param fallback Fallback message if error is undefined
 * @returns Formatted error message
 */
export function formatError(error, fallback = "An unexpected error occurred") {
    if (!error)
        return fallback;
    if (typeof error === 'string')
        return error;
    if (error instanceof Error)
        return error.message;
    if (typeof error === 'object' && error !== null) {
        // Handle Supabase or other API errors that might have a message property
        if ('message' in error && typeof error.message === 'string') {
            return error.message;
        }
        // Handle objects with error property
        if ('error' in error && typeof error.error === 'string') {
            return error.error;
        }
    }
    return fallback;
}
/**
 * Format a date to show relative time (e.g., "5 minutes ago")
 * @param date - The date to format
 * @returns A string representing the relative time
 */
export function formatRelativeTime(date) {
    const now = new Date();
    const past = typeof date === 'string' ? new Date(date) : date;
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, 'second');
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return rtf.format(-diffInMinutes, 'minute');
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return rtf.format(-diffInHours, 'hour');
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return rtf.format(-diffInDays, 'day');
    }
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return rtf.format(-diffInWeeks, 'week');
    }
    const diffInMonths = Math.floor(diffInDays / 30); // Approximate
    if (diffInMonths < 12) {
        return rtf.format(-diffInMonths, 'month');
    }
    const diffInYears = Math.floor(diffInDays / 365); // Approximate
    return rtf.format(-diffInYears, 'year');
}
/**
 * Generate initials from a name string
 * @param name The full name string
 * @returns A 1 or 2 character uppercase string of initials
 */
export function getInitials(name) {
    if (!name)
        return "U"; // Default to 'U' for User if no name
    return name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean) // Remove empty strings in case of multiple spaces
        .join("")
        .toUpperCase()
        .substring(0, 2);
}
