export interface ApiResponse<T> {
  data: T;
  message?: string;
  detail?: string;
  success: boolean;
  status?: string;
}

export interface PaginatedResponse<T> {
  data: {
    content: T[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    numberOfElements: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    empty: boolean;
  };
  message?: string;
  detail?: string;
  success: boolean;
  status?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface RequestConfig {
  skipErrorToast?: boolean;
  customErrorMessage?: string;
  skipAuthRedirect?: boolean;
}
