import { AxiosError, AxiosResponse } from "axios";
import { toast } from "sonner";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, string[]>;
}

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, string[]>;

  constructor(error: AxiosError | string) {
    if (typeof error === "string") {
      super(error);
      return;
    }

    const response = error.response;
    const data = response?.data as any;
    const message =
      data?.message ||
      data?.error ||
      error.message ||
      "An unknown error occurred";

    super(message);
    this.status = response?.status;
    this.code = data?.code || error.code;
    this.details = data?.errors || data?.details;

    // Set the prototype explicitly to ensure instanceof works
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static isApiError(error: unknown): error is ApiError {
    return (
      error instanceof ApiError ||
      (error instanceof Error && "status" in error && "code" in error)
    );
  }
}

export function handleApiError(
  error: unknown,
  defaultMessage = "An error occurred"
): never {
  if (error instanceof ApiError) {
    throw error;
  }

  if (error instanceof Error) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = axiosError.response;
      const message =
        (data as any)?.message || axiosError.message || defaultMessage;

      throw new ApiError({
        message,
        response: {
          ...axiosError.response,
          data: {
            ...(data as object),
            message,
          },
        },
      } as AxiosError);
    } else if (axiosError.request) {
      // The request was made but no response was received
      throw new ApiError({
        message: "No response received from server",
        request: axiosError.request,
      } as AxiosError);
    }
  }

  // Something happened in setting up the request that triggered an Error
  throw new ApiError({
    message: defaultMessage,
  } as AxiosError);
}

export function handleApiResponse<T = any>(response: AxiosResponse<T>): T {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }

  throw new ApiError({
    message: "Request failed",
    response,
  } as AxiosError);
}

export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (result: R) => void;
    onError?: (error: unknown) => void;
    showToast?: boolean;
  } = {}
) {
  return async (...args: T): Promise<R | undefined> => {
    try {
      const result = await fn(...args);

      if (options.successMessage && options.showToast !== false) {
        toast.success(options.successMessage);
      }

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (error) {
      const errorMessage = options.errorMessage || "An error occurred";

      if (options.showToast !== false) {
        if (ApiError.isApiError(error)) {
          toast.error(error.message || errorMessage);
        } else {
          toast.error(errorMessage);
        }
      }

      if (options.onError) {
        options.onError(error);
      }

      // Re-throw the error to allow further handling
      throw error;
    }
  };
}

export function createApiHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (result: R) => void;
    onError?: (error: unknown) => void;
    showToast?: boolean;
  } = {}
) {
  return withErrorHandling(fn, options);
}

export function createMutationHandler<T, R>(
  mutationFn: (data: T) => Promise<R>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (result: R) => void;
    onError?: (error: unknown) => void;
    showToast?: boolean;
  } = {}
) {
  return withErrorHandling(mutationFn, options);
}

export function createQueryHandler<T>(
  queryFn: () => Promise<T>,
  options: {
    errorMessage?: string;
    onError?: (error: unknown) => void;
    showToast?: boolean;
  } = {}
) {
  return withErrorHandling(queryFn, {
    ...options,
    successMessage: undefined, // Don't show success toast for queries
  });
}

export const apiUtils = {
  handleApiError,
  handleApiResponse,
  withErrorHandling,
  createApiHandler,
  createMutationHandler,
  createQueryHandler,
};
