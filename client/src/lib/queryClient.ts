// src/lib/queryClient.ts
import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { BASE_URL, apiRequest } from "./api";

export { apiRequest };

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      // Use apiRequest for consistency, but we need to handle 401 specifically
      // So we might need to replicate the URL logic here or expose a helper from api.ts

      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const path = queryKey.join("/");
      const url = path.startsWith("/api") ? path : `/api${path}`;

      const res = await fetch(`${BASE_URL}${url}`, {
        headers,
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0,                    // ← CHANGED FROM Infinity → 0
      gcTime: 1000 * 60 * 5,           // ← 5 minutes garbage collection
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});