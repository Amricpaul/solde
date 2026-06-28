import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize a base app URL into an absolute origin with a protocol.
 *
 * Platforms like Vercel expose the deployment host without a scheme
 * (e.g. `solde.vercel.app`), which makes `new URL(...)` throw `Invalid URL`.
 * Prepend `https://` when no protocol is present so the value is always parseable.
 */
export function normalizeAppUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
