import { ServiceUnavailableError } from "../errors.js";
import { fetchKobisDailyBoxOffice } from "./kobisClient.js";
import { targetDateSevenDaysAgo } from "./normalize.js";
import { getCacheEntry, isFresh, setCacheEntry } from "./cache.js";
import type { BoxOfficeResponse } from "./dto.js";

export async function getBoxOffice(): Promise<BoxOfficeResponse> {
  const { yyyymmdd, display } = targetDateSevenDaysAgo();
  const cached = getCacheEntry();

  if (cached && cached.targetDate === display && isFresh(cached)) {
    return { targetDate: cached.targetDate, items: cached.items, stale: false, fetchedAt: cached.fetchedAt };
  }

  try {
    const items = await fetchKobisDailyBoxOffice(yyyymmdd);
    const fetchedAt = new Date().toISOString();
    setCacheEntry({ targetDate: display, items, fetchedAt });
    return { targetDate: display, items, stale: false, fetchedAt };
  } catch (err) {
    if (cached) {
      return { targetDate: cached.targetDate, items: cached.items, stale: true, fetchedAt: cached.fetchedAt };
    }
    throw new ServiceUnavailableError(
      "KOBIS_UNAVAILABLE",
      "Box office data is unavailable and no cached value exists"
    );
  }
}
