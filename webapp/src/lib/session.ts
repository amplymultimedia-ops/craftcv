const KEY = "auth_token";

export const tokenStore = {
  get: () => localStorage.getItem(KEY),
  set: (token: string) => localStorage.setItem(KEY, token),
  clear: () => localStorage.removeItem(KEY),
};

export async function fetchSession() {
  const token = tokenStore.get();
  if (!token) return null;
  try {
    const res = await fetch("/api/auth/get-session", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    const data = await res.json();
    if (!data || !data.session) {
      tokenStore.clear();
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function clearSession() {
  tokenStore.clear();
  try {
    await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
  } catch (_) {
    // ignore sign-out errors
  }
  window.location.href = "/login";
}
