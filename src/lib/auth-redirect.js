export function getSafeRedirectPath(rawPath) {
  if (!rawPath || typeof rawPath !== "string") return "/";
  const trimmed = rawPath.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
  if (
    trimmed.startsWith("/login") ||
    trimmed.startsWith("/register") ||
    trimmed.startsWith("/verify-otp")
  ) {
    return "/";
  }
  return trimmed;
}
