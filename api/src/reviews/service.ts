import { NotFoundError } from "../errors.js";
import { fetchAllReviewDocs, fetchReviewDoc } from "./repository.js";
import {
  isDisplayableReview,
  normalizeCreatedAt,
  normalizeImageUrl,
  normalizeRating,
} from "./normalize.js";
import type { RawReviewDoc, ReviewDto } from "./dto.js";

function toDto(raw: RawReviewDoc): ReviewDto {
  const { iso } = normalizeCreatedAt(raw.created_at);
  return {
    id: raw.id,
    title: typeof raw.title === "string" ? raw.title : "",
    imageUrl: normalizeImageUrl(raw.image),
    comment: typeof raw.comment === "string" ? raw.comment : "",
    rating: normalizeRating(raw.star),
    createdAt: iso,
  };
}

function compareDtos(a: ReviewDto, b: ReviewDto): number {
  if (a.createdAt && b.createdAt) {
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  }
  if (a.createdAt && !b.createdAt) return -1;
  if (!a.createdAt && b.createdAt) return 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export async function listReviews(): Promise<{ items: ReviewDto[]; total: number }> {
  const raw = await fetchAllReviewDocs();
  const items = raw.filter(isDisplayableReview).map(toDto).sort(compareDtos);
  return { items, total: items.length };
}

export async function getReview(id: string): Promise<ReviewDto> {
  const raw = await fetchReviewDoc(id);
  if (!raw || !isDisplayableReview(raw)) {
    throw new NotFoundError(`Review ${id} not found`);
  }
  return toDto(raw);
}
