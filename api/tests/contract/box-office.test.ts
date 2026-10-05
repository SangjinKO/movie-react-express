import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const { fetchKobisDailyBoxOffice } = vi.hoisted(() => ({
  fetchKobisDailyBoxOffice: vi.fn(),
}));

vi.mock("../../src/box-office/kobisClient.js", () => ({
  fetchKobisDailyBoxOffice,
}));

const { buildApp } = await import("../../src/app.js");
const { clearCacheForTests, setCacheEntry } = await import("../../src/box-office/cache.js");

beforeEach(() => {
  fetchKobisDailyBoxOffice.mockReset();
  clearCacheForTests();
});

describe("GET /api/movie/v1/box-office", () => {
  it("returns fresh items with stale:false on a successful fetch", async () => {
    fetchKobisDailyBoxOffice.mockResolvedValue([
      { rank: 1, title: "Movie A", audienceCount: 1000 },
    ]);

    const res = await request(buildApp()).get("/api/movie/v1/box-office");

    expect(res.status).toBe(200);
    expect(res.body.stale).toBe(false);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.targetDate).toBeTruthy();
    expect(res.body.fetchedAt).toBeTruthy();
  });

  it("handles fewer than 3 results without erroring", async () => {
    fetchKobisDailyBoxOffice.mockResolvedValue([]);

    const res = await request(buildApp()).get("/api/movie/v1/box-office");

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });

  it("falls back to the last-good cache (stale:true) when a fetch fails", async () => {
    setCacheEntry({
      targetDate: "2026-01-01",
      items: [{ rank: 1, title: "Cached Movie", audienceCount: 500 }],
      fetchedAt: "2020-01-01T00:00:00.000Z", // old enough to be outside the TTL
    });
    fetchKobisDailyBoxOffice.mockRejectedValue(new Error("kobis down"));

    const res = await request(buildApp()).get("/api/movie/v1/box-office");

    expect(res.status).toBe(200);
    expect(res.body.stale).toBe(true);
    expect(res.body.items).toEqual([{ rank: 1, title: "Cached Movie", audienceCount: 500 }]);
  });

  it("returns 503 when the fetch fails and there is no cache at all", async () => {
    fetchKobisDailyBoxOffice.mockRejectedValue(new Error("kobis down"));

    const res = await request(buildApp()).get("/api/movie/v1/box-office");

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe("KOBIS_UNAVAILABLE");
  });
});
