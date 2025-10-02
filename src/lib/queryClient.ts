import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { QueryClient, QueryFunction, UseMutationOptions, useMutation, MutationFunction } from "@tanstack/react-query";

const axiosInstance = axios.create({
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const message =
        (error.response.data as { message?: string })?.message ||
        error.response.statusText ||
        "An error occurred";
      throw new Error(`${error.response.status}: ${message}`);
    }
    throw error;
  }
);

export async function apiRequest<T = unknown>(
  method: string,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await axiosInstance.request<T>({
    method,
    url,
    data,
    ...config,
  });
  return response.data;
}

export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>("GET", url, undefined, config),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>("POST", url, data, config),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>("PUT", url, data, config),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>("DELETE", url, undefined, config),

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>("PATCH", url, data, config),
};

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> => {
  return async ({ queryKey, signal }) => {
    try {
      const url = queryKey.join("/");
      const response = await axiosInstance.get<T>(url, {
        signal,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (options.on401 === "returnNull" && error.response?.status === 401) {
          return null as T;
        }
      }
      throw error;
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error) && error.response) {
          const status = error.response.status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
    },
  },
});

const createMutationFn = <TData = unknown, TVariables = unknown>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  url: string
): MutationFunction<TData, TVariables> => {
  return async (variables: TVariables) => {
    switch (method) {
      case "POST":
        return api.post<TData>(url, variables);
      case "PUT":
        return api.put<TData>(url, variables);
      case "PATCH":
        return api.patch<TData>(url, variables);
      case "DELETE":
        return api.delete<TData>(url, { data: variables });
    }
  };
};

// Hook dùng mutation
export const useApiMutation = <TData = unknown, TVariables = unknown>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  options?: UseMutationOptions<TData, unknown, TVariables, unknown>
) => {
  return useMutation<TData, unknown, TVariables>({
    mutationFn: createMutationFn<TData, TVariables>(method, url),
    ...options,
  });
};

export { axiosInstance };