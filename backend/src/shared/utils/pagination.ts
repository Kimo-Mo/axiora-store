import type { PaginationMeta } from "../types.js";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

function toPositiveInt(value: unknown, fallback: number): number {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
}

export function getPaginationParams(query: {
  page?: unknown;
  limit?: unknown;
}): PaginationParams {
  const page = toPositiveInt(query.page, DEFAULT_PAGE);
  const rawLimit = toPositiveInt(query.limit, DEFAULT_LIMIT);
  const limit = Math.min(rawLimit, MAX_LIMIT);
  const skip = (page - 1) * limit;
  return { page, limit, skip, take: limit };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  totalCount: number,
): PaginationMeta {
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / limit);
  return { page, limit, totalPages, totalCount };
}

export function paginate<T>(
  items: T[],
  totalCount: number,
  params: Pick<PaginationParams, "page" | "limit">,
): { data: T[]; meta: PaginationMeta } {
  return {
    data: items,
    meta: buildPaginationMeta(params.page, params.limit, totalCount),
  };
}
