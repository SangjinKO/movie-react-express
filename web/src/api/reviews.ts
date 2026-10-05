import { apiGet } from "./client";

export interface ReviewDto {
  id: string;
  title: string;
  imageUrl: string | null;
  comment: string;
  rating: 1 | 2 | 3 | 4 | 5 | null;
  createdAt: string | null;
}

export function getReviews(): Promise<{ items: ReviewDto[]; total: number }> {
  return apiGet("/reviews");
}
