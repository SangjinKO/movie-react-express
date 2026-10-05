import { Timestamp } from "firebase-admin/firestore";
import type { RawReviewDoc } from "./dto.js";

/**
 * Firestore `star` values are plain strings of repeated "⭐" characters
 * (confirmed against all 23 live documents, see app_movie/docs/movie-contract-findings.md).
 * Anything outside 1..5 stars is treated as unknown rather than guessed.
 */
export function normalizeRating(star: unknown): 1 | 2 | 3 | 4 | 5 | null {
  if (typeof star !== "string") return null;
  const count = (star.match(/⭐/g) ?? []).length;
  if (count >= 1 && count <= 5) return count as 1 | 2 | 3 | 4 | 5;
  return null;
}

export function normalizeCreatedAt(createdAt: unknown): { iso: string | null; sortable: boolean } {
  if (createdAt instanceof Timestamp) {
    return { iso: createdAt.toDate().toISOString(), sortable: true };
  }
  return { iso: null, sortable: false };
}

/**
 * One live document has zero fields at all (confirmed, see findings doc) — not a review
 * with a missing date, just corrupt/empty data. Reviews need at least a title or a comment
 * to be worth displaying; we never silently invent content for these.
 */
export function isDisplayableReview(raw: RawReviewDoc): boolean {
  const hasTitle = typeof raw.title === "string" && raw.title.trim().length > 0;
  const hasComment = typeof raw.comment === "string" && raw.comment.trim().length > 0;
  return hasTitle || hasComment;
}

export function normalizeImageUrl(image: unknown): string | null {
  if (typeof image !== "string") return null;
  try {
    const url = new URL(image);
    return url.protocol === "https:" ? image : null;
  } catch {
    return null;
  }
}
