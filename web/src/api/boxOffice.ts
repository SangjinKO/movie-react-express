import { apiGet } from "./client";

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

export function getBoxOffice(): Promise<BoxOfficeResponse> {
  return apiGet("/box-office");
}
