import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parse a number from string, returning 0 if invalid
 */
export function safeParseFloat(value: string | number | null | undefined, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsed) ? defaultValue : parsed;
}

export function safeParseInt(value: string | number | null | undefined, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = typeof value === 'string' ? parseInt(value, 10) : value;
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Format a number with comma separators (e.g., 1000 -> "1,000")
 * Handles negative numbers and decimal points
 */
export function formatNumberWithCommas(value: string | number): string {
  if (value === '' || value === null || value === undefined) return '';
  
  const stringValue = String(value);
  const isNegative = stringValue.startsWith('-');
  
  // Remove all non-digit characters except decimal point
  const numericString = stringValue.replace(/[^\d.]/g, '');
  
  if (numericString === '' || numericString === '.') return numericString;
  
  // Split by decimal point if exists
  const parts = numericString.split('.');
  const integerPart = parts[0] || '';
  const decimalPart = parts[1];
  
  // Format integer part with commas
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Combine with decimal part if exists
  const result = decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  
  // Add negative sign if needed
  return isNegative && result ? `-${result}` : result;
}

/**
 * Remove commas from a formatted number string and return the numeric value
 */
export function parseFormattedNumber(value: string): string {
  if (value === '' || value === null || value === undefined) return '';
  // Remove all commas and return the clean numeric string
  return value.replace(/,/g, '');
}
