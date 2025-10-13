import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// ✅ Gebruik de environment variable als basis voor alle API-calls
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  // Voeg base URL toe als het geen volledig pad is
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Combineer key tot URL, en voeg API_BASE_URL toe
    const path = queryKey.j
