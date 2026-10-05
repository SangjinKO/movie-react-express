export interface BoxOfficeItem {
  rank: number;
  title: string;
  audienceCount: number;
}

export interface BoxOfficeResponse {
  targetDate: string;
  items: BoxOfficeItem[];
  stale: boolean;
  fetchedAt: string;
}
