/**
 * Tailwind CSS class name utility.
 *
 * Merges clsx class names with tailwind-merge to handle Tailwind conflicts.
 * Standard shadcn/ui pattern.
 *
 * @example
 * ```ts
 * cn('px-2 py-1', isActive && 'bg-blue-500', className)
 * ```
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
