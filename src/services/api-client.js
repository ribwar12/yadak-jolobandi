import { ApiError } from "@/lib/api-error";
import { mockRouter } from "@/mocks/mock-router";
import { useAuthStore } from "@/store/use-auth-store";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

function buildUrl(path, params = {}) {
  const cleanBase = API_BASE_URL.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${cleanBase}${cleanPath}`, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  Object.entries(params || {}).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      url.searchParams.set(key, String(val));
    }
  });

  return url.toString();
}

async function request(method, path, { params = {}, body = undefined } = {}) {
  const token = useAuthStore.getState().token;

  try {
    if (USE_MOCK) {
      return await mockRouter.handle({ method, path, params, body, token });
    }

    const res = await fetch(buildUrl(path, params), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      throw await ApiError.fromResponse(res);
    }

    return await res.json();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      useAuthStore.getState().logout();
    }
    throw err;
  }
}

export const apiClient = {
  get: (path, options = {}) => request("GET", path, options),
  post: (path, body, options = {}) => request("POST", path, { ...options, body }),
  patch: (path, body, options = {}) => request("PATCH", path, { ...options, body }),
  put: (path, body, options = {}) => request("PUT", path, { ...options, body }),
  delete: (path, options = {}) => request("DELETE", path, options),
};
