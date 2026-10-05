import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { Timestamp } from "firebase-admin/firestore";
import { ServiceUnavailableError } from "../../src/errors.js";

const { fetchAllReviewDocs, fetchReviewDoc } = vi.hoisted(() => ({
  fetchAllReviewDocs: vi.fn(),
  fetchReviewDoc: vi.fn(),
}));

vi.mock("../../src/reviews/repository.js", () => ({
  fetchAllReviewDocs,
  fetchReviewDoc,
}));

const { buildApp } = await import("../../src/app.js");

function ts(iso: string) {
  return Timestamp.fromDate(new Date(iso));
}

beforeEach(() => {
  fetchAllReviewDocs.mockReset();
  fetchReviewDoc.mockReset();
});

describe("GET /api/movie/v1/reviews", () => {
  it("returns normalized items sorted newest-first, excluding empty docs", async () => {
    fetchAllReviewDocs.mockResolvedValue([
      {
        id: "old",
        title: "Old Movie",
        image: "https://example.com/old.jpg",
        comment: "meh",
        star: "⭐⭐",
        created_at: ts("2026-01-01T00:00:00Z"),
      },
      {
        id: "new",
        title: "New Movie",
        image: "https://example.com/new.jpg",
        comment: "great",
        star: "⭐⭐⭐⭐⭐",
        created_at: ts("2026-02-01T00:00:00Z"),
      },
      {
        id: "empty-doc",
        title: undefined,
        image: undefined,
        comment: undefined,
        star: undefined,
        created_at: undefined,
      },
    ]);

    const res = await request(buildApp()).get("/api/movie/v1/reviews");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.items.map((i: { id: string }) => i.id)).toEqual(["new", "old"]);
    expect(res.body.items[0].rating).toBe(5);
    expect(res.body.items[0].createdAt).toBe("2026-02-01T00:00:00.000Z");
  });

  it("sorts docs with missing createdAt after dated docs", async () => {
    fetchAllReviewDocs.mockResolvedValue([
      {
        id: "no-date",
        title: "No Date Movie",
        image: null,
        comment: "legacy review",
        star: "⭐⭐⭐",
        created_at: undefined,
      },
      {
        id: "dated",
        title: "Dated Movie",
        image: null,
        comment: "has a date",
        star: "⭐",
        created_at: ts("2026-01-01T00:00:00Z"),
      },
    ]);

    const res = await request(buildApp()).get("/api/movie/v1/reviews");

    expect(res.body.items.map((i: { id: string }) => i.id)).toEqual(["dated", "no-date"]);
    expect(res.body.items[1].createdAt).toBeNull();
  });

  it("returns 503 (not an empty 200) when Firestore read fails", async () => {
    // repository.ts always wraps raw Firestore failures as ServiceUnavailableError
    // before they reach the service layer — mirror that contract here.
    fetchAllReviewDocs.mockRejectedValue(
      new ServiceUnavailableError("FIRESTORE_READ_FAILED", "boom")
    );

    const res = await request(buildApp()).get("/api/movie/v1/reviews");

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBeTruthy();
  });
});

describe("GET /api/movie/v1/reviews/:id", () => {
  it("returns 404 JSON when the review does not exist", async () => {
    fetchReviewDoc.mockResolvedValue(null);

    const res = await request(buildApp()).get("/api/movie/v1/reviews/missing");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns the normalized review when found", async () => {
    fetchReviewDoc.mockResolvedValue({
      id: "abc",
      title: "A Movie",
      image: "https://example.com/a.jpg",
      comment: "nice",
      star: "⭐⭐⭐⭐",
      created_at: ts("2026-03-01T00:00:00Z"),
    });

    const res = await request(buildApp()).get("/api/movie/v1/reviews/abc");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: "abc", title: "A Movie", rating: 4 });
  });
});
