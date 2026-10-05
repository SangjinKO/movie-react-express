import { env } from "../config/env.js";
import { parseKobisResponse } from "./normalize.js";
import type { BoxOfficeItem } from "./dto.js";

const KOBIS_HOST = "https://www.kobis.or.kr";
const KOBIS_PATH = "/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json";
const TIMEOUT_MS = 4000;

async function fetchOnce(targetDt: string): Promise<BoxOfficeItem[]> {
  const url = new URL(KOBIS_PATH, KOBIS_HOST);
  url.searchParams.set("key", env.kobisApiKey);
  url.searchParams.set("targetDt", targetDt);
  url.searchParams.set("itemPerPage", "3");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`KOBIS responded with status ${res.status}`);
    }
    const body = await res.json();
    return parseKobisResponse(body);
  } finally {
    clearTimeout(timeout);
  }
}

/** Fixed host/path, bounded timeout, at most one retry — no unbounded retry loops. */
export async function fetchKobisDailyBoxOffice(targetDt: string): Promise<BoxOfficeItem[]> {
  try {
    return await fetchOnce(targetDt);
  } catch (firstErr) {
    try {
      return await fetchOnce(targetDt);
    } catch (secondErr) {
      throw secondErr;
    }
  }
}
