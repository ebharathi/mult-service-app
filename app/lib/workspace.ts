const WORKSPACE_COOKIE = "workspace_id";

export function getWorkspaceId(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${WORKSPACE_COOKIE}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function setWorkspaceId(id: string) {
  document.cookie = `${WORKSPACE_COOKIE}=${encodeURIComponent(id)}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
}

export function clearWorkspaceId() {
  document.cookie = `${WORKSPACE_COOKIE}=; path=/; max-age=0`;
}
