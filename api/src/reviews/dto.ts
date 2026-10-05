export interface ReviewDto {
  id: string;
  title: string;
  imageUrl: string | null;
  comment: string;
  rating: 1 | 2 | 3 | 4 | 5 | null;
  createdAt: string | null;
}

export interface RawReviewDoc {
  id: string;
  image: unknown;
  title: unknown;
  comment: unknown;
  star: unknown;
  created_at: unknown;
}
