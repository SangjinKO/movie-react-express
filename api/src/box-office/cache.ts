import type { BoxOfficeItem } from "./dto.js";

interface CacheEntry {
  targetDate: string;
  items: BoxOfficeItem[];
  fetchedAt: string;
}

const TTL_MS = 10 * 60 * 1000;

let cache: CacheEntry | null = null;

export function getCacheEntry(): CacheEntry | null {
  return cache;
}

export function isFresh(entry: CacheEntry): boolean {
  return Date.now() - new Date(entry.fetchedAt).getTime() < TTL_MS;
}

export function setCacheEntry(entry: CacheEntry): void {
  cache = entry;
}

export function clearCacheForTests(): void {
  cache = null;
}
