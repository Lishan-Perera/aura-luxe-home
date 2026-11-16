import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in Sri Lankan Rupees (LKR)
 * e.g. formatLKR(18500) => "LKR 18,500.00" or with optional clean format "Rs. 18,500"
 */
export function formatLKR(amount: number, short: boolean = false): string {
  const formatted = new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: short ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return short ? `Rs. ${formatted}` : `LKR ${formatted}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

