export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function apiFetch(path, options = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}
