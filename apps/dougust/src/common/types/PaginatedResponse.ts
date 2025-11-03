export interface PaginatedResponse<T> {
  data: T[];
  total: number | undefined;
  hasMore: boolean;
}
