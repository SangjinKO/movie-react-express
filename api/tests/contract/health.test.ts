import { describe, expect, it } from "vitest";
import request from "supertest";
import { buildApp } from "../../src/app.js";

describe("GET /api/movie/v1/health", () => {
  it("returns ok status", async () => {
    const res = await request(buildApp()).get("/api/movie/v1/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("unknown route", () => {
  it("returns a JSON 404 with requestId", async () => {
    const res = await request(buildApp()).get("/api/movie/v1/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
    expect(res.body.error.requestId).toBeTruthy();
  });
});
