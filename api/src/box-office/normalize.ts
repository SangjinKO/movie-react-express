import type { BoxOfficeItem } from "./dto.js";

const SEOUL_TZ = "Asia/Seoul";

/**
 * KOBIS daily box office is published with a lag; the existing client-side
 * implementation always requests "7 days ago" (Asia/Seoul) and this keeps that
 * same framing — it's a daily ranking for that date, not a weekly aggregate.
 */
export function targetDateSevenDaysAgo(now = new Date()): { yyyymmdd: string; display: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SEOUL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  const todaySeoul = new Date(`${get("year")}-${get("month")}-${get("day")}T00:00:00+09:00`);
  const sevenDaysAgo = new Date(todaySeoul.getTime() - 7 * 24 * 60 * 60 * 1000);

  const y = sevenDaysAgo.getUTCFullYear();
  const m = String(sevenDaysAgo.getUTCMonth() + 1).padStart(2, "0");
  const d = String(sevenDaysAgo.getUTCDate()).padStart(2, "0");

  return { yyyymmdd: `${y}${m}${d}`, display: `${y}-${m}-${d}` };
}

interface KobisDailyBoxOfficeItem {
  rank: string;
  movieNm: string;
  audiAcc: string;
}

/**
 * `audiAcc` is the accumulated ("Total Audience") count — this matches what the
 * current my_flix.html actually displays, not the daily `audiCnt` field.
 */
export function parseKobisResponse(body: unknown): BoxOfficeItem[] {
  const list = (body as any)?.boxOfficeResult?.dailyBoxOfficeList;
  if (!Array.isArray(list)) return [];

  return (list as KobisDailyBoxOfficeItem[])
    .map((item) => ({
      rank: Number(item.rank),
      title: item.movieNm,
      audienceCount: Number(item.audiAcc),
    }))
    .filter((item) => Number.isFinite(item.rank) && Number.isFinite(item.audienceCount))
    .slice(0, 3);
}
